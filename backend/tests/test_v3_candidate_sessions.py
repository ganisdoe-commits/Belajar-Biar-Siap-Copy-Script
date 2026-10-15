"""Tests for v3 contract: candidate headers, session_id submit, deadline grace,
atomic close, snapshot protection, admin finalize-expired."""
import io
import os
import time
import asyncio
import threading
import requests
import pytest
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient


def _read_env(path, key):
    try:
        with open(path) as fh:
            for ln in fh:
                if ln.startswith(f"{key}="):
                    return ln.split("=", 1)[1].strip().rstrip("/").strip('"').strip("'")
    except Exception:
        pass
    return ""


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or _read_env("/app/frontend/.env", "REACT_APP_BACKEND_URL")
API = f"{BASE_URL}/api"
MONGO_URL = _read_env("/app/backend/.env", "MONGO_URL")
DB_NAME = _read_env("/app/backend/.env", "DB_NAME")
GOOD_PW = os.environ["ADMIN_PASSWORD"]

db = MongoClient(MONGO_URL)[DB_NAME]


def _admin_token():
    db.login_attempts.delete_many({})
    r = requests.post(f"{API}/admin/login", json={"password": GOOD_PW}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def _register(name="TEST_User"):
    r = requests.post(f"{API}/candidates", json={"name": name}, timeout=30)
    return r


def _headers(cand):
    return {"X-Candidate-Id": cand["id"], "X-Candidate-Secret": cand["secret"]}


@pytest.fixture(scope="module")
def subject_id():
    r = requests.get(f"{API}/subjects", timeout=30)
    assert r.status_code == 200
    for s in r.json():
        if s.get("totalQuestions", 0) >= 1:
            return s["id"]
    pytest.skip("no subject with questions")


@pytest.fixture(scope="module")
def cand():
    r = _register("TEST_Owner")
    assert r.status_code == 200, r.text
    data = r.json()
    yield data
    # cleanup done globally at session end


@pytest.fixture(scope="module")
def cand2():
    r = _register("TEST_Other")
    assert r.status_code == 200
    yield r.json()


# ---------- POST /api/candidates ----------
def test_register_candidate_valid():
    r = _register("TEST_Register")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["id"].startswith("BBP-") and len(d["id"]) == 12
    assert d["name"] == "TEST_Register"
    assert isinstance(d["secret"], str) and len(d["secret"]) > 20


def test_register_candidate_empty():
    r = requests.post(f"{API}/candidates", json={"name": "  "}, timeout=30)
    assert r.status_code == 400


# ---------- /exam/start auth + payload ----------
def test_exam_start_without_headers(subject_id):
    r = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, timeout=30)
    assert r.status_code == 401


def test_exam_start_wrong_secret(cand, subject_id):
    r = requests.post(f"{API}/exam/start", json={"subject_id": subject_id},
                      headers={"X-Candidate-Id": cand["id"], "X-Candidate-Secret": "bad"}, timeout=30)
    assert r.status_code == 401


def test_exam_start_success_and_no_answer_leak(cand, subject_id):
    r = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["grace_sec"] == 150
    assert "deadline" in d and "session_id" in d
    assert len(d["questions"]) >= 1
    for q in d["questions"]:
        assert "answer" not in q and "pembahasan" not in q and "materi" not in q
    # snapshot stored in DB with answers
    sess = db.exam_sessions.find_one({"id": d["session_id"]})
    assert sess and "questions" in sess
    assert any("answer" in q for q in sess["questions"])


# ---------- submit auth + session_id ----------
def test_submit_missing_session_id(cand):
    r = requests.post(f"{API}/exam/submit", json={"answers": {}}, headers=_headers(cand), timeout=30)
    assert r.status_code == 422


def test_submit_other_candidate_404(cand, cand2, subject_id):
    s = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30).json()
    r = requests.post(f"{API}/exam/submit", json={"session_id": s["session_id"], "answers": {}},
                      headers=_headers(cand2), timeout=30)
    assert r.status_code == 404
    # cleanup: let owner submit
    requests.post(f"{API}/exam/submit", json={"session_id": s["session_id"], "answers": {}},
                  headers=_headers(cand), timeout=30)


def test_submit_owner_success_and_double_submit_409(cand, subject_id):
    s = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30).json()
    sid = s["session_id"]
    r = requests.post(f"{API}/exam/submit", json={"session_id": sid, "answers": {}},
                     headers=_headers(cand), timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    assert len(body["review"]) == len(s["questions"])
    assert body["result"]["session_id"] == sid
    # second submit
    r2 = requests.post(f"{API}/exam/submit", json={"session_id": sid, "answers": {}},
                      headers=_headers(cand), timeout=30)
    assert r2.status_code == 409
    # save after submit
    r3 = requests.post(f"{API}/exam/session/{sid}/save", json={"answers": {}, "flags": {}},
                      headers=_headers(cand), timeout=30)
    assert r3.status_code == 409


def test_concurrent_submits_only_one_wins(cand, subject_id):
    s = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30).json()
    sid = s["session_id"]
    results = []

    def go():
        r = requests.post(f"{API}/exam/submit", json={"session_id": sid, "answers": {}},
                         headers=_headers(cand), timeout=30)
        results.append(r.status_code)

    ts = [threading.Thread(target=go) for _ in range(5)]
    for t in ts: t.start()
    for t in ts: t.join()
    oks = [c for c in results if c == 200]
    conflicts = [c for c in results if c == 409]
    assert len(oks) == 1, f"expected 1 ok, got {results}"
    assert len(conflicts) == 4
    assert db.results.count_documents({"session_id": sid}) == 1


# ---------- deadline + grace ----------
def test_deadline_within_grace_client_basis(cand, subject_id):
    s = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30).json()
    sid = s["session_id"]
    # push deadline into past but within grace
    new_dl = (datetime.now(timezone.utc) - timedelta(seconds=60)).isoformat()
    db.exam_sessions.update_one({"id": sid}, {"$set": {"deadline": new_dl}})
    # save still works (within grace)
    r = requests.post(f"{API}/exam/session/{sid}/save", json={"answers": {}, "flags": {}},
                     headers=_headers(cand), timeout=30)
    assert r.status_code == 200
    # submit uses client basis
    first_qid = s["questions"][0]["id"]
    r2 = requests.post(f"{API}/exam/submit",
                       json={"session_id": sid, "answers": {first_qid: "A"}},
                       headers=_headers(cand), timeout=30)
    assert r2.status_code == 200
    assert r2.json()["result"]["basis"] == "client"


def test_deadline_beyond_grace_server_saved_basis(cand, subject_id):
    s = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30).json()
    sid = s["session_id"]
    first_qid = s["questions"][0]["id"]
    # save first (still valid deadline)
    r0 = requests.post(f"{API}/exam/session/{sid}/save",
                      json={"answers": {first_qid: "A"}, "flags": {}},
                      headers=_headers(cand), timeout=30)
    assert r0.status_code == 200
    # push deadline well beyond grace
    db.exam_sessions.update_one({"id": sid},
        {"$set": {"deadline": (datetime.now(timezone.utc) - timedelta(seconds=200)).isoformat()}})
    # save now 409
    r1 = requests.post(f"{API}/exam/session/{sid}/save",
                      json={"answers": {first_qid: "B"}, "flags": {}},
                      headers=_headers(cand), timeout=30)
    assert r1.status_code == 409
    # submit with new client answers but basis is server_saved; only prior saved count
    r2 = requests.post(f"{API}/exam/submit",
                      json={"session_id": sid, "answers": {first_qid: "D"}},
                      headers=_headers(cand), timeout=30)
    assert r2.status_code == 200
    body = r2.json()
    assert body["result"]["basis"] == "server_saved"
    # review should reflect selected=A (previously saved), not D
    r_first = next(x for x in body["review"] if x["id"] == first_qid)
    assert r_first["selected"] == "A"


def test_auto_finalize_via_results_endpoint(cand, subject_id):
    s = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30).json()
    sid = s["session_id"]
    db.exam_sessions.update_one({"id": sid},
        {"$set": {"deadline": (datetime.now(timezone.utc) - timedelta(seconds=200)).isoformat()}})
    r = requests.get(f"{API}/results/{cand['id']}", headers=_headers(cand), timeout=30)
    assert r.status_code == 200
    assert any(x["session_id"] == sid for x in r.json())
    sess = db.exam_sessions.find_one({"id": sid})
    assert sess["status"] == "submitted"
    assert sess.get("basis") == "auto"


def test_admin_finalize_expired(cand, subject_id):
    s = requests.post(f"{API}/exam/start", json={"subject_id": subject_id}, headers=_headers(cand), timeout=30).json()
    sid = s["session_id"]
    db.exam_sessions.update_one({"id": sid},
        {"$set": {"deadline": (datetime.now(timezone.utc) - timedelta(seconds=200)).isoformat()}})
    tok = _admin_token()
    r = requests.get(f"{API}/admin/results", headers={"Authorization": f"Bearer {tok}"}, timeout=30)
    assert r.status_code == 200
    sess = db.exam_sessions.find_one({"id": sid})
    assert sess["status"] == "submitted"


# ---------- results / report auth ----------
def test_results_report_auth(cand, cand2):
    r = requests.get(f"{API}/results/{cand['id']}", timeout=30)
    assert r.status_code == 401
    r = requests.get(f"{API}/results/{cand['id']}", headers=_headers(cand2), timeout=30)
    assert r.status_code == 403
    r = requests.get(f"{API}/results/{cand['id']}", headers=_headers(cand), timeout=30)
    assert r.status_code == 200

    r = requests.get(f"{API}/report/{cand['id']}", timeout=30)
    assert r.status_code == 401
    r = requests.get(f"{API}/report/{cand['id']}", headers=_headers(cand2), timeout=30)
    assert r.status_code == 403
    r = requests.get(f"{API}/report/{cand['id']}", headers=_headers(cand), timeout=30)
    assert r.status_code == 200


# ---------- snapshot protection via re-import ----------
def test_snapshot_protects_running_session(cand):
    fixture = "/app/backend/tests/fixtures/c_kup.docx"
    if not os.path.exists(fixture):
        pytest.skip("no fixture")
    tok = _admin_token()
    ah = {"Authorization": f"Bearer {tok}"}
    # preview
    with open(fixture, "rb") as fh:
        r = requests.post(f"{API}/admin/import/preview", headers=ah,
                          files={"file": ("c_kup.docx", fh, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
                          timeout=60)
    assert r.status_code == 200, r.text
    draft_id = r.json()["draft_id"]
    # commit new TEST subject
    r2 = requests.post(f"{API}/admin/import/commit", headers=ah,
                       json={"draft_id": draft_id, "new_subject": {
                           "name": "TEST_Snapshot", "level": "C", "code": "C9",
                           "durationMin": 60, "examCount": 40, "short": "SNAP", "color": "#000", "desc": "", "order": 99}},
                       timeout=60)
    assert r2.status_code == 200, r2.text
    sid = r2.json()["subject_id"]
    try:
        # start session on new subject
        s = requests.post(f"{API}/exam/start", json={"subject_id": sid}, headers=_headers(cand), timeout=30).json()
        session_id = s["session_id"]
        original_qids = [q["id"] for q in s["questions"]]
        # re-import same file into same subject (replaces questions -> new ids)
        with open(fixture, "rb") as fh:
            rp = requests.post(f"{API}/admin/import/preview", headers=ah,
                               files={"file": ("c_kup.docx", fh, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
                               timeout=60)
        d2 = rp.json()["draft_id"]
        rc = requests.post(f"{API}/admin/import/commit", headers=ah,
                           json={"draft_id": d2, "subject_id": sid}, timeout=60)
        assert rc.status_code == 200
        # new question ids differ
        new_qs = requests.get(f"{API}/admin/questions?subject_id={sid}", headers=ah, timeout=30).json()
        new_ids = {q["id"] for q in new_qs}
        assert not (set(original_qids) & new_ids), "ids should have been replaced"
        # submit using original ids, picks A for all
        answers = {qid: "A" for qid in original_qids}
        rs = requests.post(f"{API}/exam/submit",
                          json={"session_id": session_id, "answers": answers},
                          headers=_headers(cand), timeout=30)
        assert rs.status_code == 200, rs.text
        body = rs.json()
        assert body["result"]["total"] == len(original_qids)
        assert len(body["review"]) == len(original_qids)
    finally:
        requests.delete(f"{API}/admin/subjects/{sid}", headers=ah, timeout=30)


# ---------- Cleanup ----------
def test_cleanup():
    # delete TEST_ candidates + their sessions + results
    tids = [c["id"] for c in db.candidates.find({"name": {"$regex": "^TEST_"}})]
    db.results.delete_many({"candidate_id": {"$in": tids}})
    db.exam_sessions.delete_many({"candidate.id": {"$in": tids}})
    db.candidates.delete_many({"name": {"$regex": "^TEST_"}})
    db.subjects.delete_many({"name": "TEST_Snapshot"})
