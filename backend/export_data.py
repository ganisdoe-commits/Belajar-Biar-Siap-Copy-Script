"""Ekspor bank soal + dokumen peraturan ke folder /data proyek (untuk backup & GitHub).
Pakai: python export_data.py"""
import json
import os
from pathlib import Path

from bson import json_util
from dotenv import load_dotenv
from pymongo import MongoClient

from storage import get_object_to_file

ROOT = Path(__file__).resolve().parent
DATA = ROOT.parent / "data"
load_dotenv(ROOT / ".env")
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]


def dump(name, docs):
    (DATA / f"{name}.json").write_text(json_util.dumps(docs, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{name}.json: {len(docs)}")


def main():
    (DATA / "files").mkdir(parents=True, exist_ok=True)
    for c in ("subjects", "questions", "essays"):
        dump(c, list(db[c].find({}, {"_id": 0}).sort([("subject_id", 1), ("number", 1)])))
    regs = list(db.regulations.find({"is_deleted": False}, {"_id": 0}).sort("order", 1))
    for r in regs:
        ext = r["filename"].rsplit(".", 1)[-1].lower()
        r["local_file"] = f"files/{r['id']}.{ext}"
        dest = DATA / r["local_file"]
        if not dest.exists():
            get_object_to_file(r["storage_path"], str(dest))
        print(f"  file: {r['title']} ({dest.stat().st_size // 1024} KB)")
    dump("regulations", regs)
    (DATA / "manifest.json").write_text(json.dumps({
        "subjects": db.subjects.count_documents({}), "questions": db.questions.count_documents({}),
        "essays": db.essays.count_documents({}), "regulations": len(regs)}, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
