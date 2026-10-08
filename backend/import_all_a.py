"""Impor 4 mata ujian Tingkat A dan rapikan daftar subject sesuai tabel PUSBIN."""
import os
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv
from parse_any import parse

load_dotenv()
c = MongoClient(os.environ["MONGO_URL"])
db = c[os.environ["DB_NAME"]]

# (file, kata kunci nama subject di DB)
JOBS = [
    ("/tmp/f_pphop.docx", "PPh OP"),
    ("/tmp/f_potput.docx", "Pot/Put"),
    ("/tmp/f_ppn.docx", "PPN"),
    ("/tmp/f_pbb.docx", "PBB"),
]


def to_qdocs(sid, mcq):
    out = []
    for q in mcq:
        pemb = (q.get("pembahasan") or "").strip()
        dasar = (q.get("dasar") or "").strip()
        if dasar:
            pemb = (pemb + "\n\nDasar Hukum: " + dasar).strip()
        out.append({
            "id": str(uuid.uuid4()), "subject_id": sid, "number": q["number"],
            "question": q["question"].strip(),
            "options": [{"key": k, "text": q["options"][k].strip()} for k in ["A", "B", "C", "D"]],
            "answer": q["answer"], "pembahasan": pemb,
        })
    return out


def to_edocs(sid, essays):
    out = []
    for e in essays:
        model = (e.get("model") or "").strip()
        dasar = (e.get("dasar") or "").strip()
        if dasar:
            model = (model + "\n\nDasar Hukum: " + dasar).strip()
        topic = (e.get("topic") or "").strip()
        out.append({
            "id": str(uuid.uuid4()), "subject_id": sid, "number": e["number"],
            "question": (f"[{topic}] " if topic else "") + e["question"].strip(),
            "model_answer": model,
        })
    return out


for path, kw in JOBS:
    subj = db.subjects.find_one({"name": {"$regex": kw, "$options": "i"}})
    if not subj:
        print("TIDAK ditemukan subject untuk", kw)
        continue
    sid = subj["id"]
    mcq, essays = parse(path)
    db.subjects.update_one({"id": sid}, {"$set": {"examCount": 40}})
    db.questions.delete_many({"subject_id": sid})
    db.essays.delete_many({"subject_id": sid})
    qd, ed = to_qdocs(sid, mcq), to_edocs(sid, essays)
    if qd:
        db.questions.insert_many(qd)
    if ed:
        db.essays.insert_many(ed)
    print(f"{subj['name']:30s} -> PG {len(qd)}, esai {len(ed)}")

# Hapus Kode Etik Profesi dari Tingkat A (tidak termasuk; belum ada bank soal)
ke = db.subjects.find_one({"name": {"$regex": "Kode Etik", "$options": "i"}})
if ke:
    db.questions.delete_many({"subject_id": ke["id"]})
    db.essays.delete_many({"subject_id": ke["id"]})
    db.subjects.delete_one({"id": ke["id"]})
    print("Dihapus:", ke["name"])

print("\n--- Daftar mata ujian sekarang ---")
for s in db.subjects.find().sort("order", 1):
    bank = db.questions.count_documents({"subject_id": s["id"]})
    es = db.essays.count_documents({"subject_id": s["id"]})
    print(f"  {s['name']:32s} | bank PG {bank:3d} | esai {es}")
