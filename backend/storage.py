"""Emergent Object Storage helpers (sinkron; panggil via asyncio.to_thread)."""
import os
import requests

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "belajar-biar-pintar"
_storage_key = None


def init_storage(force: bool = False) -> str:
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _request(method: str, path: str, **kw):
    for attempt in range(2):
        resp = requests.request(method, f"{STORAGE_URL}/objects/{path}",
                                headers={"X-Storage-Key": init_storage(force=attempt > 0), **kw.pop("headers", {})}, **kw)
        if resp.status_code == 404 and attempt == 0 and method == "PUT":
            continue
        resp.raise_for_status()
        return resp


def put_object(path: str, data: bytes, content_type: str) -> dict:
    return _request("PUT", path, headers={"Content-Type": content_type}, data=data, timeout=300).json()


def get_object_to_file(path: str, dest: str) -> None:
    key = init_storage()
    with requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, stream=True, timeout=300) as resp:
        if resp.status_code == 404:
            resp.close()
            key = init_storage(force=True)
            resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, stream=True, timeout=300)
        resp.raise_for_status()
        tmp = dest + ".part"
        with open(tmp, "wb") as f:
            for chunk in resp.iter_content(1024 * 1024):
                f.write(chunk)
        os.replace(tmp, dest)
