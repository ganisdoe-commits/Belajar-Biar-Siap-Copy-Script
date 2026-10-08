"""Impor Bank Soal KUP (100 PG + 25 esai) dari /tmp/bank_kup.json ke MongoDB."""
import json
import os
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
c = MongoClient(os.environ["MONGO_URL"])
db = c[os.environ["DB_NAME"]]

data = json.load(open("/tmp/bank_kup.json"))

# cari subject KUP
subj = db.subjects.find_one({"name": {"$regex": "KUP", "$options": "i"}})
if not subj:
    raise SystemExit("Subject KUP tidak ditemukan. Jalankan seeding dulu.")
sid = subj["id"]

# update metadata subject
db.subjects.update_one({"id": sid}, {"$set": {
    "name": "KUP, PPSP, dan Pengadilan Pajak",
    "short": "KUP",
    "examCount": 40,
    "desc": "Ketentuan Umum & Tata Cara Perpajakan, Penagihan Pajak dengan Surat Paksa, dan Pengadilan Pajak.",
}})

# hapus soal lama subject ini
db.questions.delete_many({"subject_id": sid})
db.essays.delete_many({"subject_id": sid})

# insert MCQ
qdocs = []
for q in data["mcq"]:
    pemb = q.get("pembahasan", "").strip()
    dasar = q.get("dasar", "").strip()
    if dasar:
        pemb = (pemb + "\n\nDasar Hukum: " + dasar).strip()
    qdocs.append({
        "id": str(uuid.uuid4()),
        "subject_id": sid,
        "number": q["number"],
        "question": q["question"].strip(),
        "options": [{"key": k, "text": q["options"][k].strip()} for k in ["A", "B", "C", "D"]],
        "answer": q["answer"],
        "pembahasan": pemb,
    })
if qdocs:
    db.questions.insert_many(qdocs)

# insert essays
edocs = []
for e in data["essays"]:
    model = e.get("model", "").strip()
    dasar = e.get("dasar", "").strip()
    if dasar:
        model = (model + "\n\nDasar Hukum: " + dasar).strip()
    q = e["question"].strip()
    topic = e.get("topic", "").strip()
    edocs.append({
        "id": str(uuid.uuid4()),
        "subject_id": sid,
        "number": e["number"],
        "question": (f"[{topic}] " if topic else "") + q,
        "model_answer": model,
    })
if edocs:
    db.essays.insert_many(edocs)

print("KUP subject id:", sid)
print("MCQ inserted:", len(qdocs))
print("Essays inserted:", len(edocs))
