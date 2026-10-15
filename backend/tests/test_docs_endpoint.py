"""Tests for new GET /api/admin/docs/prototype endpoint."""
import os
import requests
import pytest

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE}/api/admin/login", json={"password": os.environ["ADMIN_PASSWORD"]}, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code}: {r.text}")
    return r.json()["token"]


def test_prototype_doc_requires_auth():
    r = requests.get(f"{BASE}/api/admin/docs/prototype", timeout=15)
    assert r.status_code == 401


def test_prototype_doc_bad_token():
    r = requests.get(
        f"{BASE}/api/admin/docs/prototype",
        headers={"Authorization": "Bearer invalid.jwt.token"},
        timeout=15,
    )
    assert r.status_code == 401


def test_prototype_doc_ok(admin_token):
    r = requests.get(
        f"{BASE}/api/admin/docs/prototype",
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=15,
    )
    assert r.status_code == 200
    data = r.json()
    assert data["filename"] == "PROTOTYPE.md"
    assert "updated_at" in data
    assert isinstance(data["content"], str)
    assert len(data["content"]) > 1000
    assert "BAGIAN I" in data["content"]
    assert "BAGIAN II" in data["content"]
    assert "PANDUAN PEMILIK" in data["content"]
    assert "RINGKASAN TEKNIS" in data["content"]


def test_subjects_present_for_simulation():
    """Ensure the specific subjects needed for simulation testing exist."""
    r = requests.get(f"{BASE}/api/subjects", timeout=15)
    assert r.status_code == 200
    subjects = r.json()
    names = [(s["level"], s["name"]) for s in subjects]
    # From the review request
    assert any(l == "A" and "PPh OP" in n and "SPT PPh OP" in n for l, n in names)
    assert any(l == "B" and "PPN" in n and "SPT PPN" in n for l, n in names)
    assert any(l == "C" and "KUP" in n and "Internasional" in n for l, n in names)
    assert any(l == "B" and "PPh Badan" in n for l, n in names)


def test_regulations_count():
    r = requests.get(f"{BASE}/api/subjects", timeout=15)
    subjects = r.json()
    # pick A PPh OP
    s = next(x for x in subjects if x["level"] == "A" and "PPh OP" in x["name"] and "SPT PPh OP" in x["name"])
    r2 = requests.get(f"{BASE}/api/subjects/{s['id']}/regulations", timeout=15)
    assert r2.status_code == 200
    regs = r2.json()
    assert len(regs) >= 3  # SDSN, PP58, SPT PPh OP form
    titles = " | ".join([x.get("title", "") for x in regs])
    assert "SDSN" in titles or "UU Pajak" in titles
