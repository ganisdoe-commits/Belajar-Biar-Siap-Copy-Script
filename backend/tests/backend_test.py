"""Backend tests for Belajar Biar Pintar — Tingkat A & B coverage.

Covers:
- GET /api/subjects (level A + B presence and shape)
- GET /api/subjects/{id}/exam (count, duration, no answer leak) for A & B
- POST /api/exam/submit (level B scoring + review of 40)
- GET /api/results/{candidate_id} (level persisted)
- GET /api/subjects/{id}/essays (B: 25 essays non-empty)
"""
import os
import uuid
import pytest
import requests

def _read_frontend_env():
    try:
        with open("/app/frontend/.env") as fh:
            for ln in fh:
                if ln.startswith("REACT_APP_BACKEND_URL="):
                    return ln.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass
    return ""


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or _read_frontend_env()

API = f"{BASE_URL}/api"

EXPECTED_B_NAMES = {
    "KUP, PPSP, dan Pengadilan Pajak",
    "Bea Meterai",
    "PBB-P5L",
    "Akuntansi Perpajakan",
    "PPh Badan & SPT PPh Badan",
}


@pytest.fixture(scope="module")
def subjects():
    r = requests.get(f"{API}/subjects", timeout=30)
    assert r.status_code == 200
    return r.json()


# ---------- Subjects list ----------
def test_subjects_total_and_levels(subjects):
    assert isinstance(subjects, list)
    a = [s for s in subjects if s.get("level", "A") == "A"]
    b = [s for s in subjects if s.get("level") == "B"]
    assert len(a) == 5, f"Expected 5 A, got {len(a)}"
    assert len(b) == 5, f"Expected 5 B, got {len(b)}"
    assert len(subjects) >= 10


def test_b_subject_names_present(subjects):
    b_names = {s["name"] for s in subjects if s.get("level") == "B"}
    missing = EXPECTED_B_NAMES - b_names
    assert not missing, f"Missing B subjects: {missing}"


def test_b_subjects_shape(subjects):
    for s in [x for x in subjects if x.get("level") == "B"]:
        assert s["bankSize"] == 100, f"{s['name']} bank={s['bankSize']}"
        assert s["examCount"] == 40
        assert s["totalQuestions"] == 40
        assert s["essayCount"] == 25
        assert s["durationMin"] == 90


def test_a_subjects_shape(subjects):
    for s in [x for x in subjects if x.get("level", "A") == "A"]:
        assert s["bankSize"] >= 100
        assert s["examCount"] == 40
        assert s["totalQuestions"] == 40
        assert s["essayCount"] >= 25


# ---------- Exam endpoint ----------
def _exam_check(sid, expected_dur=5400):
    r = requests.get(f"{API}/subjects/{sid}/exam", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data["duration_sec"] == expected_dur
    qs = data["questions"]
    assert len(qs) == 40
    for q in qs:
        assert "answer" not in q, "answer leaked"
        assert "pembahasan" not in q, "pembahasan leaked"
        assert "options" in q and len(q["options"]) >= 2
    return data


def test_exam_b(subjects):
    b = next(s for s in subjects if s.get("level") == "B")
    _exam_check(b["id"], 5400)


def test_exam_a(subjects):
    a = next(s for s in subjects if s.get("level", "A") == "A")
    data = _exam_check(a["id"], a["durationMin"] * 60)
    assert data["subject"]["level"] in (None, "A") or data["subject"].get("level", "A") == "A"


# ---------- Submit + results ----------
def test_submit_b_and_results(subjects):
    b = next(s for s in subjects if s.get("level") == "B")
    exam = requests.get(f"{API}/subjects/{b['id']}/exam", timeout=30).json()
    qids = [q["id"] for q in exam["questions"]]
    assert len(qids) == 40
    # pick an answer for first 3 questions (random guess)
    answers = {}
    for q in exam["questions"][:3]:
        answers[q["id"]] = q["options"][0]["key"]
    cand_id = f"TEST_{uuid.uuid4().hex[:8]}"
    payload = {
        "subject_id": b["id"],
        "candidate": {"name": "TEST_Candidate", "id": cand_id},
        "answers": answers,
        "question_ids": qids,
    }
    r = requests.post(f"{API}/exam/submit", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    res = body["result"]
    assert res["total"] == 40
    assert res["level"] == "B"
    assert res["subject_id"] == b["id"]
    assert len(body["review"]) == 40
    for item in body["review"]:
        assert "answer" in item and "is_correct" in item

    # Verify persistence via /results/{candidate_id}
    r2 = requests.get(f"{API}/results/{cand_id}", timeout=30)
    assert r2.status_code == 200
    rs = r2.json()
    assert len(rs) >= 1
    assert rs[0]["level"] == "B"
    assert rs[0]["total"] == 40


# ---------- Essays ----------
def test_b_essays(subjects):
    for b in [s for s in subjects if s.get("level") == "B"]:
        r = requests.get(f"{API}/subjects/{b['id']}/essays", timeout=30)
        assert r.status_code == 200
        es = r.json()
        assert len(es) == 25, f"{b['name']} essays={len(es)}"
        for e in es:
            assert e.get("question"), f"empty essay question in {b['name']}"
            assert e.get("model_answer"), f"empty model_answer in {b['name']} #{e.get('number')}"
