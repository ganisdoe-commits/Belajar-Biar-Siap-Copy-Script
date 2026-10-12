"""Peraturan & formulir (PDF/Excel) untuk 'Ekstra Konten' di layar ujian."""
import os
import uuid
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from bson.binary import Binary

from storage import APP_NAME, put_object, get_object_to_file

CACHE_DIR = "/tmp/bbp_reg_cache"
MAX_BYTES = 100 * 1024 * 1024
CHUNK_BYTES = 4 * 1024 * 1024
TYPES = {
    "pdf": ("pdf", "application/pdf", (b"%PDF",)),
    "xlsx": ("excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", (b"PK",)),
    "xlsm": ("excel", "application/vnd.ms-excel.sheet.macroEnabled.12", (b"PK",)),
    "xls": ("excel", "application/vnd.ms-excel", (b"\xd0\xcf\x11\xe0",)),
}


class UploadInit(BaseModel):
    filename: str
    size: int


class UploadComplete(BaseModel):
    upload_id: str
    title: str
    subject_ids: List[str] = []


class RegulationUpdate(BaseModel):
    title: Optional[str] = None
    subject_ids: Optional[List[str]] = None
    order: Optional[int] = None


def _ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _public(r: dict) -> dict:
    return {k: r.get(k) for k in ("id", "title", "filename", "kind", "size", "subject_ids", "order", "created_at")}


def build_router(db, require_admin) -> APIRouter:
    router = APIRouter()

    # ------------------------------ Admin ------------------------------
    @router.post("/admin/regulations/upload/init")
    async def upload_init(payload: UploadInit, _: bool = Depends(require_admin)):
        ext = _ext(payload.filename)
        if ext not in TYPES:
            raise HTTPException(400, "Format didukung: PDF (.pdf) dan Excel (.xlsx, .xlsm, .xls)")
        if payload.size <= 0 or payload.size > MAX_BYTES:
            raise HTTPException(413, "Ukuran file maksimal 100 MB")
        upload_id = str(uuid.uuid4())
        total = (payload.size + CHUNK_BYTES - 1) // CHUNK_BYTES
        await db.upload_sessions.insert_one({
            "id": upload_id, "filename": payload.filename, "size": payload.size, "total_chunks": total,
            "created_at": datetime.now(timezone.utc),
        })
        return {"upload_id": upload_id, "chunk_size": CHUNK_BYTES, "total_chunks": total}

    @router.post("/admin/regulations/upload/chunk")
    async def upload_chunk(upload_id: str = Form(...), index: int = Form(...), chunk: UploadFile = File(...),
                           _: bool = Depends(require_admin)):
        up = await db.upload_sessions.find_one({"id": upload_id})
        if not up or index < 0 or index >= up["total_chunks"]:
            raise HTTPException(400, "Sesi unggah tidak valid")
        data = await chunk.read()
        if len(data) > CHUNK_BYTES:
            raise HTTPException(413, "Potongan file terlalu besar")
        await db.upload_chunks.update_one(
            {"upload_id": upload_id, "index": index},
            {"$set": {"data": Binary(data), "created_at": datetime.now(timezone.utc)}}, upsert=True)
        return {"ok": True, "index": index}

    @router.post("/admin/regulations/upload/complete")
    async def upload_complete(payload: UploadComplete, _: bool = Depends(require_admin)):
        up = await db.upload_sessions.find_one({"id": payload.upload_id})
        if not up:
            raise HTTPException(404, "Sesi unggah tidak ditemukan, silakan ulangi")
        if not payload.title.strip():
            raise HTTPException(400, "Judul dokumen wajib diisi")
        chunks = await db.upload_chunks.find({"upload_id": payload.upload_id}).sort("index", 1).to_list(1000)
        if [c["index"] for c in chunks] != list(range(up["total_chunks"])):
            raise HTTPException(400, "Sebagian file belum terunggah, silakan ulangi")
        data = b"".join(bytes(c["data"]) for c in chunks)
        await db.upload_chunks.delete_many({"upload_id": payload.upload_id})
        await db.upload_sessions.delete_one({"id": payload.upload_id})
        if len(data) != up["size"]:
            raise HTTPException(400, "Ukuran file tidak sesuai, silakan ulangi")
        ext = _ext(up["filename"])
        kind, ctype, magics = TYPES[ext]
        if not data.startswith(magics):
            raise HTTPException(400, "Isi file tidak sesuai dengan format .%s" % ext)
        rid = str(uuid.uuid4())
        try:
            res = await asyncio.to_thread(put_object, f"{APP_NAME}/regulations/{rid}.{ext}", data, ctype)
        except Exception:
            raise HTTPException(502, "Penyimpanan file gagal, silakan coba lagi")
        last = await db.regulations.find({"is_deleted": False}).sort("order", -1).to_list(1)
        doc = {
            "id": rid, "title": payload.title.strip(), "filename": up["filename"], "kind": kind,
            "content_type": ctype, "size": len(data), "storage_path": res["path"],
            "subject_ids": payload.subject_ids, "order": (last[0]["order"] + 1) if last else 1,
            "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.regulations.insert_one(dict(doc))
        return _public(doc)

    @router.get("/admin/regulations")
    async def admin_list(_: bool = Depends(require_admin)):
        rs = await db.regulations.find({"is_deleted": False}).sort("order", 1).to_list(500)
        return [_public(r) for r in rs]

    @router.put("/admin/regulations/{rid}")
    async def admin_update(rid: str, payload: RegulationUpdate, _: bool = Depends(require_admin)):
        upd = payload.dict(exclude_none=True)
        if "title" in upd:
            upd["title"] = upd["title"].strip()
            if not upd["title"]:
                raise HTTPException(400, "Judul dokumen wajib diisi")
        res = await db.regulations.find_one_and_update({"id": rid, "is_deleted": False}, {"$set": upd}, return_document=True)
        if not res:
            raise HTTPException(404, "Dokumen tidak ditemukan")
        return _public(res)

    @router.delete("/admin/regulations/{rid}")
    async def admin_delete(rid: str, _: bool = Depends(require_admin)):
        res = await db.regulations.update_one({"id": rid, "is_deleted": False}, {"$set": {"is_deleted": True}})
        if not res.matched_count:
            raise HTTPException(404, "Dokumen tidak ditemukan")
        cached = os.path.join(CACHE_DIR, rid)
        if os.path.exists(cached):
            os.remove(cached)
        return {"ok": True}

    # ------------------------------ Peserta ------------------------------
    @router.get("/subjects/{sid}/regulations")
    async def subject_regulations(sid: str):
        rs = await db.regulations.find({"is_deleted": False, "subject_ids": sid}).sort("order", 1).to_list(200)
        return [{k: r[k] for k in ("id", "title", "kind", "size", "filename")} for r in rs]

    @router.get("/regulations/{rid}/file")
    async def regulation_file(rid: str):
        r = await db.regulations.find_one({"id": rid, "is_deleted": False})
        if not r:
            raise HTTPException(404, "Dokumen tidak ditemukan")
        os.makedirs(CACHE_DIR, exist_ok=True)
        path = os.path.join(CACHE_DIR, rid)
        if not os.path.exists(path):
            try:
                await asyncio.to_thread(get_object_to_file, r["storage_path"], path)
            except Exception:
                raise HTTPException(502, "Dokumen gagal dimuat, silakan coba lagi")
        return FileResponse(path, media_type=r["content_type"], headers={
            "Content-Disposition": f"inline; filename*=UTF-8''{quote(r['filename'])}",
            "Cache-Control": "public, max-age=3600",
        })

    return router
