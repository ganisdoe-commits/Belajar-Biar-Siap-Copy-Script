"""Buat backend/.env dan frontend/.env baru dengan password & kunci acak.
Pakai: python setup_env.py   (tidak menimpa .env yang sudah ada)"""
import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_ENV = ROOT / ".env"
FRONTEND_ENV = ROOT.parent / "frontend" / ".env"


def ask(label, default=""):
    v = input(f"{label}{f' [{default}]' if default else ''}: ").strip()
    return v or default


def main():
    if BACKEND_ENV.exists() or FRONTEND_ENV.exists():
        print("File .env sudah ada. Hapus dulu bila ingin membuat ulang.")
        return
    admin_pw = secrets.token_urlsafe(12)
    backend = {
        "MONGO_URL": ask("MONGO_URL", "mongodb://localhost:27017"),
        "DB_NAME": ask("DB_NAME", "belajar_biar_siap"),
        "CORS_ORIGINS": ask("CORS_ORIGINS (domain frontend)", "*"),
        "ADMIN_PASSWORD": admin_pw,
        "JWT_SECRET": secrets.token_urlsafe(48),
        "EMERGENT_LLM_KEY": ask("EMERGENT_LLM_KEY (untuk penyimpanan file peraturan; kosongkan bila belum ada)"),
    }
    frontend = {
        "REACT_APP_BACKEND_URL": ask("REACT_APP_BACKEND_URL (alamat backend)", "http://localhost:8001"),
        "WDS_SOCKET_PORT": "443",
        "ENABLE_HEALTH_CHECK": "false",
    }
    BACKEND_ENV.write_text("".join(f'{k}="{v}"\n' for k, v in backend.items()), encoding="utf-8")
    FRONTEND_ENV.write_text("".join(f"{k}={v}\n" for k, v in frontend.items()), encoding="utf-8")
    print("\n.env dibuat. Password admin awal (catat, hanya ditampilkan sekali):", admin_pw)
    print("Segera ganti lewat panel admin -> Ganti Password.")


if __name__ == "__main__":
    main()
