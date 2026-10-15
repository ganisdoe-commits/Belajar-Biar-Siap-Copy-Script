# Belajar Biar Siap — Panduan Membangun Ulang

Repository ini berisi seluruh kode, bank soal, dan dokumen peraturan.
Password & kunci rahasia **tidak** disimpan di sini; skrip setup membuat yang baru.

## Isi
- `frontend/` — React (yarn)
- `backend/` — FastAPI + MongoDB
- `data/` — salinan bank soal (`subjects.json`, `questions.json`, `essays.json`),
  metadata peraturan (`regulations.json`), dan file PDF/Excel peraturan (`data/files/`)

## Langkah
1. Siapkan MongoDB, Python 3.11, Node 18+ dan yarn.
2. Backend:
   ```
   cd backend
   pip install -r requirements.txt
   python setup_env.py        # membuat .env baru + password admin acak (dicetak sekali)
   python restore_data.py     # memasukkan bank soal & dokumen ke database
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```
   Tanpa EMERGENT_LLM_KEY, jalankan `python restore_data.py --no-files` (soal tetap masuk;
   file peraturan perlu diunggah ulang lewat panel admin, atau ganti `backend/storage.py`
   ke penyimpanan lain seperti S3).
3. Frontend:
   ```
   cd frontend
   yarn install
   yarn start
   ```
4. Buka `/admin`, login dengan password dari langkah 2, lalu **Ganti Password**.

## Memperbarui salinan data
Setelah bank soal/peraturan direvisi di aplikasi, jalankan `python backend/export_data.py`
lalu simpan ke GitHub lagi.

Semua route backend memakai prefix `/api`.
