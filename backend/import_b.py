"""Impor bank soal Tingkat B (idempoten: subject dicari berdasarkan level + short)."""
import os
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv
from parse_any import parse
from import_all_a import to_qdocs, to_edocs

load_dotenv()
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]

JOBS = [
    ("/tmp/b/kup.docx", dict(code="B2", short="KUP-B", order=12, color="#0891b2", name="KUP, PPSP, dan Pengadilan Pajak",
                             desc="KUP, Penagihan Pajak dengan Surat Paksa, dan Pengadilan Pajak — studi kasus WP orang pribadi dan badan.")),
    ("/tmp/b/bm.docx", dict(code="B5", short="BM-B", order=15, color="#be185d", name="Bea Meterai",
                            desc="Bea Meterai: objek, tarif, saat terutang, pemeteraian kemudian, dan sanksi.")),
    ("/tmp/b/pbb.docx", dict(code="B6", short="PBB-B", order=16, color="#d97706", name="PBB-P5L",
                             desc="PBB Sektor Perkebunan, Perhutanan, Pertambangan, dan Sektor Lainnya.")),
    ("/tmp/b/akt.docx", dict(code="B7", short="AKT-B", order=17, color="#0f766e", name="Akuntansi Perpajakan",
                             desc="Rekonsiliasi fiskal, beda tetap/waktu, pajak tangguhan, dan pencatatan transaksi perpajakan.")),
    ("/tmp/b/pphb.docx", dict(code="B8", short="PPhB-B", order=18, color="#4338CA", name="PPh Badan & SPT PPh Badan",
                              desc="Pajak Penghasilan Badan dan SPT Tahunan PPh Badan di Coretax.")),
]

if __name__ == "__main__":
    db.subjects.update_many({"level": {"$exists": False}}, {"$set": {"level": "A"}})
    for path, meta in JOBS:
        mcq, essays = parse(path)
        assert len(mcq) == 100 and len(essays) == 25, (path, len(mcq), len(essays))
        subj = db.subjects.find_one({"level": "B", "short": meta["short"]})
        if subj:
            sid = subj["id"]
            db.subjects.update_one({"id": sid}, {"$set": {**meta, "durationMin": 90, "examCount": 40}})
        else:
            sid = str(uuid.uuid4())
            db.subjects.insert_one({**meta, "id": sid, "level": "B", "durationMin": 90, "examCount": 40})
        db.questions.delete_many({"subject_id": sid})
        db.essays.delete_many({"subject_id": sid})
        db.questions.insert_many(to_qdocs(sid, mcq))
        db.essays.insert_many(to_edocs(sid, essays))
        print(f"B | {meta['name']:34s} -> PG {len(mcq)}, esai {len(essays)}")

    print("\n--- Daftar mata ujian ---")
    for s in db.subjects.find().sort("order", 1):
        print(f"  [{s.get('level')}] {s['name']:34s} | PG {db.questions.count_documents({'subject_id': s['id']}):3d} | esai {db.essays.count_documents({'subject_id': s['id']})} | {s.get('durationMin')} mnt")
