"""Impor/ganti bank soal per mata ujian (idempoten: subject dicari via level + short).
Pakai: python import_bank.py SHORT [SHORT ...]   (tanpa argumen = semua job yang filenya ada)
Revisi file: unggah ulang, sesuaikan path, jalankan lagi -> bank soal & esai subject diganti total."""
import os
import sys
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv
from parse_any import parse, to_qdocs, to_edocs

load_dotenv()
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]

C_SUFFIX = " (Aspek Transaksi Internasional dan P3B)"

JOBS = [
    ("/tmp/b2/b_pphop.docx", dict(level="B", code="B1", short="PPhOP-B", order=11, color="#1d4ed8", name="PPh OP & SPT PPh OP",
                                  desc="PPh Orang Pribadi dan SPT Tahunan PPh Orang Pribadi — studi kasus tingkat menengah.")),
    ("/tmp/b/kup.docx", dict(level="B", code="B2", short="KUP-B", order=12, color="#0891b2", name="KUP, PPSP, dan Pengadilan Pajak",
                             desc="KUP, Penagihan Pajak dengan Surat Paksa, dan Pengadilan Pajak — studi kasus WP orang pribadi dan badan.")),
    ("/tmp/b2/b_potput.docx", dict(level="B", code="B3", short="PotPut-B", order=13, color="#7c3aed", name="PPh Pot/Put",
                                   desc="PPh Pemotongan dan Pemungutan — studi kasus WP orang pribadi dan badan.")),
    ("/tmp/b2/b_ppn.docx", dict(level="B", code="B4", short="PPN-B", order=14, color="#059669", name="PPN & SPT PPN",
                                desc="PPN dan PPnBM serta SPT Masa PPN.")),
    ("/tmp/b/bm.docx", dict(level="B", code="B5", short="BM-B", order=15, color="#be185d", name="Bea Meterai",
                            desc="Bea Meterai: objek, tarif, saat terutang, pemeteraian kemudian, dan sanksi.")),
    ("/tmp/b/pbb.docx", dict(level="B", code="B6", short="PBB-B", order=16, color="#d97706", name="PBB-P5L",
                             desc="PBB Sektor Perkebunan, Perhutanan, Pertambangan, dan Sektor Lainnya.")),
    ("/tmp/b/akt.docx", dict(level="B", code="B7", short="AKT-B", order=17, color="#0f766e", name="Akuntansi Perpajakan",
                             desc="Rekonsiliasi fiskal, beda tetap/waktu, pajak tangguhan, dan pencatatan transaksi perpajakan.")),
    ("/tmp/b/pphb.docx", dict(level="B", code="B8", short="PPhB-B", order=18, color="#4338CA", name="PPh Badan & SPT PPh Badan",
                              desc="Pajak Penghasilan Badan dan SPT Tahunan PPh Badan di Coretax.")),
    ("/tmp/b2/c_pphop.docx", dict(level="C", code="C1", short="PPhOP-C", order=21, color="#15803D",
                                  name="PPh Orang Pribadi dan SPT PPh Orang Pribadi" + C_SUFFIX,
                                  desc="PPh OP dan SPT PPh OP dalam konteks transaksi internasional dan Persetujuan Penghindaran Pajak Berganda (P3B).")),
    ("/tmp/b2/c_kup.docx", dict(level="C", code="C2", short="KUP-C", order=22, color="#0e7490",
                                name="KUP, PPSP, dan Pengadilan Pajak" + C_SUFFIX,
                                desc="KUP, PPSP, dan Pengadilan Pajak dalam konteks transaksi internasional dan P3B.")),
]


def import_job(path, meta):
    mcq, essays = parse(path)
    assert len(mcq) == 100 and len(essays) == 25, (path, len(mcq), len(essays))
    subj = db.subjects.find_one({"level": meta["level"], "short": meta["short"]})
    if subj:
        sid = subj["id"]
        db.subjects.update_one({"id": sid}, {"$set": {**meta, "durationMin": 90, "examCount": 40}})
    else:
        sid = str(uuid.uuid4())
        db.subjects.insert_one({**meta, "id": sid, "durationMin": 90, "examCount": 40})
    db.questions.delete_many({"subject_id": sid})
    db.essays.delete_many({"subject_id": sid})
    db.questions.insert_many(to_qdocs(sid, mcq))
    db.essays.insert_many(to_edocs(sid, essays))
    print(f"{meta['level']} | {meta['name'][:60]:60s} -> PG {len(mcq)}, esai {len(essays)}")


if __name__ == "__main__":
    wanted = set(sys.argv[1:])
    for path, meta in JOBS:
        if (not wanted or meta["short"] in wanted) and os.path.exists(path):
            import_job(path, meta)

    print("\n--- Daftar mata ujian ---")
    for s in db.subjects.find().sort("order", 1):
        print(f"  [{s.get('level')}] {s['code']} {s['name'][:60]:60s} | PG {db.questions.count_documents({'subject_id': s['id']}):3d} | esai {db.essays.count_documents({'subject_id': s['id']})} | {s.get('durationMin')} mnt")
