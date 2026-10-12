"""Iteration-3 backend tests: regulations chunked upload + exam sessions."""
import io
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
HERE = os.path.dirname(__file__)
PDF_PATH = os.path.join(HERE, "sample_regulation.pdf")
XLSX_PATH = os.path.join(HERE, "sample_spt.xlsx")
CHUNK = 4 * 1024 * 1024


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"password": "admin123"}, timeout=30)
    if r.status_code != 200:
        pytest.skip(f"admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="module")
def headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def subjects():
    return requests.get(f"{API}/subjects", timeout=30).json()


@pytest.fixture(scope="module")
def c2_subject(subjects):
    cs = [s for s in subjects if s.get("level") == "C"]
    assert cs, "No C subjects"
    # Prefer the KUP international one
    pref = [s for s in cs if "KUP" in s["name"]]
    return (pref or cs)[0]


# Container for cleanup
_created_regs = []


def _upload(headers, path, title, subject_ids):
    size = os.path.getsize(path)
    r = requests.post(f"{API}/admin/regulations/upload/init",
                      json={"filename": os.path.basename(path), "size": size},
                      headers=headers, timeout=30)
    assert r.status_code == 200, r.text
    init = r.json()
    with open(path, "rb") as f:
        for i in range(init["total_chunks"]):
            chunk = f.read(init["chunk_size"])
            files = {"chunk": ("c", io.BytesIO(chunk), "application/octet-stream")}
            data = {"upload_id": init["upload_id"], "index": str(i)}
            rc = requests.post(f"{API}/admin/regulations/upload/chunk",
                               files=files, data=data, headers=headers, timeout=60)
            assert rc.status_code == 200, rc.text
    r2 = requests.post(f"{API}/admin/regulations/upload/complete",
                       json={"upload_id": init["upload_id"], "title": title, "subject_ids": subject_ids},
                       headers=headers, timeout=60)
    assert r2.status_code == 200, r2.text
    reg = r2.json()
    _created_regs.append(reg["id"])
    return reg


# ---------------- Auth / validation ----------------
def test_upload_init_no_token():
    r = requests.post(f"{API}/admin/regulations/upload/init", json={"filename": "x.pdf", "size": 100}, timeout=15)
    assert r.status_code == 401


def test_upload_init_unsupported_ext(headers):
    r = requests.post(f"{API}/admin/regulations/upload/init",
                      json={"filename": "test.docx", "size": 100}, headers=headers, timeout=15)
    assert r.status_code == 400
    r2 = requests.post(f"{API}/admin/regulations/upload/init",
                       json={"filename": "test.txt", "size": 100}, headers=headers, timeout=15)
    assert r2.status_code == 400


def test_upload_init_size_too_big(headers):
    r = requests.post(f"{API}/admin/regulations/upload/init",
                      json={"filename": "big.pdf", "size": 101 * 1024 * 1024},
                      headers=headers, timeout=15)
    assert r.status_code == 413


def test_upload_wrong_magic(headers):
    # Register init with .pdf but send plain text content.
    data = b"this is not a pdf file at all" * 100
    r = requests.post(f"{API}/admin/regulations/upload/init",
                      json={"filename": "fake.pdf", "size": len(data)},
                      headers=headers, timeout=15)
    assert r.status_code == 200
    init = r.json()
    files = {"chunk": ("c", io.BytesIO(data), "application/octet-stream")}
    rc = requests.post(f"{API}/admin/regulations/upload/chunk",
                       files=files, data={"upload_id": init["upload_id"], "index": "0"},
                       headers=headers, timeout=30)
    assert rc.status_code == 200
    r2 = requests.post(f"{API}/admin/regulations/upload/complete",
                       json={"upload_id": init["upload_id"], "title": "TEST_fakepdf", "subject_ids": []},
                       headers=headers, timeout=30)
    assert r2.status_code == 400


def test_upload_missing_chunk(headers):
    size = os.path.getsize(PDF_PATH)
    r = requests.post(f"{API}/admin/regulations/upload/init",
                      json={"filename": "sample_regulation.pdf", "size": size},
                      headers=headers, timeout=15)
    assert r.status_code == 200
    init = r.json()
    assert init["total_chunks"] >= 2
    # Only upload first chunk
    with open(PDF_PATH, "rb") as f:
        chunk = f.read(init["chunk_size"])
    files = {"chunk": ("c", io.BytesIO(chunk), "application/octet-stream")}
    rc = requests.post(f"{API}/admin/regulations/upload/chunk",
                       files=files, data={"upload_id": init["upload_id"], "index": "0"},
                       headers=headers, timeout=60)
    assert rc.status_code == 200
    r2 = requests.post(f"{API}/admin/regulations/upload/complete",
                       json={"upload_id": init["upload_id"], "title": "TEST_missingchunk", "subject_ids": []},
                       headers=headers, timeout=30)
    assert r2.status_code == 400


# ---------------- Happy path: PDF + XLSX ----------------
@pytest.fixture(scope="module")
def pdf_reg(headers, c2_subject):
    return _upload(headers, PDF_PATH, "TEST_UU_SAMPLE_PDF", [c2_subject["id"]])


@pytest.fixture(scope="module")
def xlsx_reg(headers, c2_subject):
    return _upload(headers, XLSX_PATH, "TEST_SPT_SAMPLE_XLSX", [c2_subject["id"]])


def test_pdf_upload_fields(pdf_reg):
    assert pdf_reg["kind"] == "pdf"
    assert pdf_reg["size"] == os.path.getsize(PDF_PATH)
    assert pdf_reg["title"] == "TEST_UU_SAMPLE_PDF"


def test_xlsx_upload_fields(xlsx_reg):
    assert xlsx_reg["kind"] == "excel"
    assert xlsx_reg["size"] == os.path.getsize(XLSX_PATH)


def test_subject_regulations_lists_both(c2_subject, pdf_reg, xlsx_reg):
    r = requests.get(f"{API}/subjects/{c2_subject['id']}/regulations", timeout=30)
    assert r.status_code == 200
    ids = {d["id"] for d in r.json()}
    assert pdf_reg["id"] in ids and xlsx_reg["id"] in ids


def test_regulation_file_bytes_pdf(pdf_reg):
    r = requests.get(f"{API}/regulations/{pdf_reg['id']}/file", timeout=60)
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("application/pdf")
    assert "inline" in r.headers.get("content-disposition", "")
    assert len(r.content) == pdf_reg["size"]
    with open(PDF_PATH, "rb") as f:
        assert r.content[:16] == f.read(16)


def test_regulation_file_bytes_xlsx(xlsx_reg):
    r = requests.get(f"{API}/regulations/{xlsx_reg['id']}/file", timeout=60)
    assert r.status_code == 200
    assert "spreadsheet" in r.headers["content-type"] or "excel" in r.headers["content-type"]
    assert len(r.content) == xlsx_reg["size"]


def test_admin_list_contains_both(headers, pdf_reg, xlsx_reg):
    r = requests.get(f"{API}/admin/regulations", headers=headers, timeout=30)
    assert r.status_code == 200
    ids = {d["id"] for d in r.json()}
    assert pdf_reg["id"] in ids and xlsx_reg["id"] in ids


def test_update_title_and_subjects(headers, pdf_reg):
    new_title = "TEST_UU_SAMPLE_PDF_v2"
    r = requests.put(f"{API}/admin/regulations/{pdf_reg['id']}",
                     json={"title": new_title, "subject_ids": []},
                     headers=headers, timeout=30)
    assert r.status_code == 200
    assert r.json()["title"] == new_title
    assert r.json()["subject_ids"] == []


def test_delete_soft_removes(headers, c2_subject, xlsx_reg):
    r = requests.delete(f"{API}/admin/regulations/{xlsx_reg['id']}", headers=headers, timeout=30)
    assert r.status_code == 200
    # list excludes it
    rl = requests.get(f"{API}/subjects/{c2_subject['id']}/regulations", timeout=30).json()
    assert xlsx_reg["id"] not in {d["id"] for d in rl}
    # file 404
    r2 = requests.get(f"{API}/regulations/{xlsx_reg['id']}/file", timeout=15)
    assert r2.status_code == 404
    try:
        _created_regs.remove(xlsx_reg["id"])
    except ValueError:
        pass


# ---------------- Exam sessions ----------------
@pytest.fixture(scope="module")
def a_subject(subjects):
    return next(s for s in subjects if s.get("level", "A") == "A")


def _start(subject):
    r = requests.post(f"{API}/exam/start",
                      json={"subject_id": subject["id"],
                            "candidate": {"name": "TEST_Session", "id": f"TEST_{uuid.uuid4().hex[:8]}"}},
                      timeout=30)
    assert r.status_code == 200, r.text
    return r.json()


def test_exam_start_shape(a_subject):
    data = _start(a_subject)
    assert "session_id" in data and "started_at" in data and "deadline" in data and "server_time" in data
    assert len(data["questions"]) == 40
    for q in data["questions"]:
        assert "answer" not in q and "pembahasan" not in q


def test_client_info():
    r = requests.get(f"{API}/client-info", timeout=15)
    assert r.status_code == 200
    assert "ip" in r.json()


def test_save_filters_invalid(a_subject):
    data = _start(a_subject)
    sid = data["session_id"]
    qids = [q["id"] for q in data["questions"]]
    answers = {qids[0]: "A", qids[1]: "Z", "notexist": "B"}  # Z invalid, notexist unknown
    flags = {qids[2]: True, "ghost": True}
    r = requests.post(f"{API}/exam/session/{sid}/save", json={"answers": answers, "flags": flags}, timeout=30)
    assert r.status_code == 200
    body = r.json()
    assert body["answered"] == 1
    assert body["saved_at"]


def test_submit_uses_session_qids_and_locks(a_subject):
    data = _start(a_subject)
    sid = data["session_id"]
    # Submit with WRONG question_ids (should be ignored because session_id is passed)
    payload = {
        "subject_id": a_subject["id"],
        "candidate": {"name": "TEST_Session", "id": f"TEST_{uuid.uuid4().hex[:8]}"},
        "answers": {data["questions"][0]["id"]: data["questions"][0]["options"][0]["key"]},
        "question_ids": ["fake-id-1", "fake-id-2"],
        "session_id": sid,
    }
    r = requests.post(f"{API}/exam/submit", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    res = r.json()["result"]
    assert res["total"] == 40  # proves it used session's qids, not the bogus list
    # Second submit -> 409
    r2 = requests.post(f"{API}/exam/submit", json=payload, timeout=30)
    assert r2.status_code == 409
    # Save after submit -> 409
    r3 = requests.post(f"{API}/exam/session/{sid}/save", json={"answers": {}, "flags": {}}, timeout=30)
    assert r3.status_code == 409


def test_old_exam_endpoint_still_works(a_subject):
    r = requests.get(f"{API}/subjects/{a_subject['id']}/exam", timeout=30)
    assert r.status_code == 200
    assert len(r.json()["questions"]) == 40


# ---------------- Cleanup ----------------
def test_zz_cleanup(headers):
    for rid in list(_created_regs):
        requests.delete(f"{API}/admin/regulations/{rid}", headers=headers, timeout=15)
    # Clean TEST_ results
    try:
        import pymongo
        mongo_url = os.environ.get("MONGO_URL")
        db_name = os.environ.get("DB_NAME")
        if mongo_url and db_name:
            cli = pymongo.MongoClient(mongo_url)
            db = cli[db_name]
            db.results.delete_many({"candidate_name": {"$regex": "^TEST_"}})
            db.exam_sessions.delete_many({"candidate.name": {"$regex": "^TEST_"}})
            cli.close()
    except Exception:
        pass
