"""Pulihkan bank soal + dokumen peraturan dari folder /data ke database baru.
Pakai: python restore_data.py            (ganti subjects/questions/essays/regulations di DB)
       python restore_data.py --no-files (lewati unggah file peraturan ke object storage)"""
import os
import sys
from pathlib import Path

from bson import json_util
from dotenv import load_dotenv
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parent
DATA = ROOT.parent / "data"
load_dotenv(ROOT / ".env")
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]


def load(name):
    return json_util.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


def main(upload_files: bool):
    for c in ("subjects", "questions", "essays"):
        docs = load(c)
        db[c].delete_many({})
        if docs:
            db[c].insert_many(docs)
        print(f"{c}: {len(docs)}")
    regs = load("regulations")
    if upload_files:
        from storage import APP_NAME, put_object
        for r in regs:
            data = (DATA / r["local_file"]).read_bytes()
            ext = r["local_file"].rsplit(".", 1)[-1]
            r["storage_path"] = put_object(f"{APP_NAME}/regulations/{r['id']}.{ext}", data, r["content_type"])["path"]
            print(f"  diunggah: {r['title']}")
    db.regulations.delete_many({})
    if regs:
        db.regulations.insert_many(regs)
    print(f"regulations: {len(regs)}")


if __name__ == "__main__":
    main("--no-files" not in sys.argv)
