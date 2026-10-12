"""New-feature backend tests for Belajar Biar Pintar iteration 2.

Covers:
- Admin JWT auth (/admin/login, /admin/me, old static token rejected, brute force 429)
- Change password validation + token rotation (and restore to admin123)
- Import preview (valid, bad, empty, txt, unauth)
- Import commit (existing subject replace; new subject create+delete; unknown draft 404)
- Exam submit returns materi_stats and no leak on /exam
- Report API totals + math + weakest sort
"""
import io
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient


def _read_env(path, key):
    try:
        with open(path) as fh:
            for ln in fh:
                if ln.startswith(f"{key}="):
                    v = ln.split("=", 1)[1].strip().rstrip("/")
                    return v.strip('"').strip("'")
    except Exception:
        pass
    return ""


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or _read_env(
    "/app/frontend/.env", "REACT_APP_BACKEND_URL"
)
API = f"{BASE_URL}/api"

MONGO_URL = _read_env("/app/backend/.env", "MONGO_URL")
DB_NAME = _read_env("/app/backend/.env", "DB_NAME")

OLD_STATIC_TOKEN = "bbp-admin-2026-secret-token"
GOOD_PW = "admin123"


def _reset_login_attempts():
    if MONGO_URL and DB_NAME:
        try:
            MongoClient(MONGO_URL)[DB_NAME].login_attempts.delete_many({})
        except Exception:
            pass


def _login(pw=GOOD_PW):
    _reset_login_attempts()
    r = requests.post(f"{API}/admin/login", json={"password": pw}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="function")
def token():
    return _login()


@pytest.fixture(scope="function")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------- Auth ----------------------------
def test_login_returns_jwt():
    _reset_login_attempts()
    r = requests.post(f"{API}/admin/login", json={"password": GOOD_PW}, timeout=30)
    assert r.status_code == 200
    tok = r.json()["token"]
    assert tok.count(".") == 2 and len(tok) > 40  # JWT shape


def test_old_static_token_rejected():
    r = requests.get(f"{API}/admin/subjects",
                     headers={"Authorization": f"Bearer {OLD_STATIC_TOKEN}"}, timeout=30)
    assert r.status_code == 401


def test_admin_me(auth):
    r = requests.get(f"{API}/admin/me", headers=auth, timeout=30)
    assert r.status_code == 200
    assert r.json()["username"] == "admin"


def test_brute_force_lockout():
    _reset_login_attempts()
    for _ in range(5):
        r = requests.post(f"{API}/admin/login", json={"password": "WRONG!!"}, timeout=30)
        assert r.status_code == 401
    r6 = requests.post(f"{API}/admin/login", json={"password": "WRONG!!"}, timeout=30)
    assert r6.status_code == 429, f"expected 429 lockout, got {r6.status_code}"
    _reset_login_attempts()
    # verify unlock
    r = requests.post(f"{API}/admin/login", json={"password": GOOD_PW}, timeout=30)
    assert r.status_code == 200


# ---------------------------- Change password ----------------------------
def test_change_password_full_flow():
    old_tok = _login()
    h = {"Authorization": f"Bearer {old_tok}"}

    # wrong current -> 400 (NOT 401)
    r = requests.post(f"{API}/admin/change-password", headers=h,
                      json={"current_password": "wrong-pass", "new_password": "NewPass9999"}, timeout=30)
    assert r.status_code == 400, f"expected 400 for wrong current, got {r.status_code}"

    # short new -> 400
    r = requests.post(f"{API}/admin/change-password", headers=h,
                      json={"current_password": GOOD_PW, "new_password": "Short1"}, timeout=30)
    assert r.status_code == 400

    # no digit -> 400
    r = requests.post(f"{API}/admin/change-password", headers=h,
                      json={"current_password": GOOD_PW, "new_password": "NoDigitsAtAll"}, timeout=30)
    assert r.status_code == 400

    # valid change -> new token
    new_pw = "TempPass2026"
    r = requests.post(f"{API}/admin/change-password", headers=h,
                      json={"current_password": GOOD_PW, "new_password": new_pw}, timeout=30)
    assert r.status_code == 200, r.text
    new_tok = r.json()["token"]
    assert new_tok and new_tok != old_tok

    # old token invalidated
    r = requests.get(f"{API}/admin/me",
                     headers={"Authorization": f"Bearer {old_tok}"}, timeout=30)
    assert r.status_code == 401

    # login with new password works
    _reset_login_attempts()
    r = requests.post(f"{API}/admin/login", json={"password": new_pw}, timeout=30)
    assert r.status_code == 200

    # login with old password fails
    r = requests.post(f"{API}/admin/login", json={"password": GOOD_PW}, timeout=30)
    assert r.status_code == 401
    _reset_login_attempts()

    # RESTORE back to admin123 directly in DB (API disallows <10-char password).
    try:
        from pymongo import MongoClient
        import bcrypt
        h = bcrypt.hashpw(GOOD_PW.encode(), bcrypt.gensalt()).decode()
        MongoClient(MONGO_URL)[DB_NAME].admin_users.update_one(
            {"username": "admin"},
            {"$set": {"password_hash": h, "token_version": 0}},
        )
    except Exception as e:
        pytest.fail(f"Could not restore admin password in DB: {e}")
    _reset_login_attempts()
    # verify admin123 works again
    r = requests.post(f"{API}/admin/login", json={"password": GOOD_PW}, timeout=30)
    assert r.status_code == 200


# ---------------------------- Import preview ----------------------------
C_KUP = "/app/backend/tests/fixtures/c_kup.docx"
BAD = "/app/backend/tests/test_bad.docx"
EMPTY = "/app/backend/tests/test_empty.docx"


def _preview(path, auth_header, filename=None, content_type=None):
    with open(path, "rb") as fh:
        files = {"file": (filename or os.path.basename(path), fh,
                          content_type or "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        return requests.post(f"{API}/admin/import/preview", files=files, headers=auth_header, timeout=60)


def test_preview_c_kup(auth):
    r = _preview(C_KUP, auth)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["mcq_total"] == 100
    assert d["mcq_valid"] == 100
    assert d["essay_total"] == 25
    assert d["essay_valid"] == 25
    assert d["meta"]["level"] == "C"
    assert "Aspek Transaksi Internasional dan P3B" in d["meta"]["name"]
    assert len(d["materi"]) == 8
    assert d["key_table_found"] is True
    # suggested subject should match an existing C subject
    r2 = requests.get(f"{API}/subjects", timeout=30).json()
    c2 = next((s for s in r2 if s.get("level") == "C" and "KUP" in s["name"]), None)
    assert c2 is not None
    assert d["suggested_subject_id"] == c2["id"]


def test_preview_bad(auth):
    r = _preview(BAD, auth)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["mcq_valid"] == 98, f"expected mcq_valid=98, got {d['mcq_valid']}"
    nums = {it.get("number") for it in d["issues"]}
    assert 5 in nums and 7 in nums, f"issues numbers={nums}"


def test_preview_rejects_txt(auth, tmp_path):
    p = tmp_path / "x.txt"
    p.write_text("hello")
    with open(p, "rb") as fh:
        r = requests.post(f"{API}/admin/import/preview",
                          files={"file": ("x.txt", fh, "text/plain")},
                          headers=auth, timeout=30)
    assert r.status_code == 400


def test_preview_empty(auth):
    r = _preview(EMPTY, auth)
    assert r.status_code == 400


def test_preview_unauth():
    with open(C_KUP, "rb") as fh:
        r = requests.post(f"{API}/admin/import/preview",
                          files={"file": ("c_kup.docx", fh)}, timeout=30)
    assert r.status_code == 401


# ---------------------------- Import commit ----------------------------
def test_commit_existing_c_kup_replace(auth):
    """c_kup.docx -> commit to its matching C2 subject (same file)."""
    r = _preview(C_KUP, auth)
    assert r.status_code == 200
    d = r.json()
    sid = d["suggested_subject_id"]
    r2 = requests.post(f"{API}/admin/import/commit", headers=auth,
                       json={"draft_id": d["draft_id"], "subject_id": sid}, timeout=60)
    assert r2.status_code == 200, r2.text
    body = r2.json()
    assert body["mcq_saved"] == 100
    assert body["essays_saved"] == 25
    # Count on subjects endpoint still 100
    pub = requests.get(f"{API}/subjects/{sid}", timeout=30).json()
    assert pub["bankSize"] == 100
    # questions have materi
    qs = requests.get(f"{API}/admin/questions", params={"subject_id": sid},
                      headers=auth, timeout=30).json()
    assert any(q.get("materi") for q in qs), "expected at least one question with materi"


def test_commit_new_subject_and_delete(auth):
    r = _preview(C_KUP, auth)
    assert r.status_code == 200
    d = r.json()
    unique_code = f"C9{uuid.uuid4().hex[:4]}"
    payload = {
        "draft_id": d["draft_id"],
        "new_subject": {
            "name": "TEST_Mata Ujian", "level": "C", "code": unique_code,
            "durationMin": 60, "examCount": 40, "color": "#15803D"
        },
    }
    r2 = requests.post(f"{API}/admin/import/commit", headers=auth, json=payload, timeout=60)
    assert r2.status_code == 200, r2.text
    sid = r2.json()["subject_id"]
    try:
        pub = requests.get(f"{API}/subjects", timeout=30).json()
        new_s = next((s for s in pub if s["id"] == sid), None)
        assert new_s is not None, "new subject not visible"
        assert new_s["level"] == "C"
        assert new_s["durationMin"] == 60
        assert new_s["bankSize"] == 100  # from file
        assert new_s["name"].startswith("TEST_")
    finally:
        # cleanup
        rd = requests.delete(f"{API}/admin/subjects/{sid}", headers=auth, timeout=30)
        assert rd.status_code == 200


def test_commit_unknown_draft(auth):
    r = requests.post(f"{API}/admin/import/commit", headers=auth,
                      json={"draft_id": "does-not-exist", "subject_id": "x"}, timeout=30)
    assert r.status_code == 404


# ---------------------------- Exam submit materi_stats ----------------------------
def test_submit_contains_materi_stats_and_no_leak():
    subjects = requests.get(f"{API}/subjects", timeout=30).json()
    # Pick a C subject (now has materi)
    c = next(s for s in subjects if s.get("level") == "C")
    exam = requests.get(f"{API}/subjects/{c['id']}/exam", timeout=30).json()
    # verify no leak
    for q in exam["questions"]:
        assert "answer" not in q
        assert "materi" not in q
        assert "pembahasan" not in q
    qids = [q["id"] for q in exam["questions"]]
    cand = f"TEST_{uuid.uuid4().hex[:8]}"
    payload = {
        "subject_id": c["id"],
        "candidate": {"name": "TEST_MateriCand", "id": cand},
        "answers": {qids[0]: exam["questions"][0]["options"][0]["key"]},
        "question_ids": qids,
    }
    r = requests.post(f"{API}/exam/submit", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    res = r.json()["result"]
    assert res["total"] == 40
    stats = res.get("materi_stats")
    assert isinstance(stats, list) and len(stats) > 0
    tot = sum(m["total"] for m in stats)
    assert tot == 40, f"materi totals sum={tot} != 40"


# ---------------------------- Rapor API ----------------------------
def test_report_totals_and_math():
    subjects = requests.get(f"{API}/subjects", timeout=30).json()
    a_total = sum(1 for s in subjects if s.get("level", "A") == "A")
    b_total = sum(1 for s in subjects if s.get("level") == "B")
    c_total = sum(1 for s in subjects if s.get("level") == "C")

    b = next(s for s in subjects if s.get("level") == "B")
    cand = f"TEST_{uuid.uuid4().hex[:8]}"

    # 2 attempts on same B subject
    scores = []
    for _ in range(2):
        exam = requests.get(f"{API}/subjects/{b['id']}/exam", timeout=30).json()
        qids = [q["id"] for q in exam["questions"]]
        # Guess key 'A' for all (deterministic-ish wrong answers)
        answers = {qid: "A" for qid in qids}
        r = requests.post(f"{API}/exam/submit", json={
            "subject_id": b["id"],
            "candidate": {"name": "TEST_RaporCand", "id": cand},
            "answers": answers,
            "question_ids": qids,
        }, timeout=30)
        assert r.status_code == 200
        scores.append(r.json()["result"]["score"])
        time.sleep(0.05)

    rep = requests.get(f"{API}/report/{cand}", timeout=30).json()
    levels = {lv["level"]: lv for lv in rep["levels"]}
    assert levels["A"]["subjects_total"] == a_total
    assert levels["B"]["subjects_total"] == b_total
    assert levels["C"]["subjects_total"] == c_total
    assert levels["B"]["attempts"] == 2
    expected_avg = round(sum(scores) / len(scores), 2)
    assert abs(levels["B"]["avg"] - expected_avg) <= 0.5
    assert levels["B"]["best"] == max(scores)
    # weakest capped at 5 and all <60
    for m in levels["B"]["weakest"]:
        assert m["pct"] < 60
    assert len(levels["B"]["weakest"]) <= 5

    # per-subject row
    sub = next(s for s in rep["subjects"] if s["subject_id"] == b["id"])
    assert sub["attempts"] == 2
    assert sub["best"] == max(scores)
    assert sub["last"] == scores[-1]
    # materi sorted ascending pct
    pcts = [m["pct"] for m in sub["materi"]]
    assert pcts == sorted(pcts)


# ---------------------------- Regression ----------------------------
def test_regression_level_counts():
    subs = requests.get(f"{API}/subjects", timeout=30).json()
    a = [s for s in subs if s.get("level", "A") == "A"]
    b = [s for s in subs if s.get("level") == "B"]
    c = [s for s in subs if s.get("level") == "C"]
    assert len(a) == 5
    assert len(b) == 8
    assert len(c) == 2
