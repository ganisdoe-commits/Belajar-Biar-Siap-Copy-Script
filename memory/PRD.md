# PRD — Belajar Biar Pintar (Simulator Ujian Kompetensi Pajak / USKP)

## Problem statement
Simulator latihan CAT USKP (bukan ujian resmi/proctored) untuk dijual ke publik: 40 PG acak per sesi dari bank 100, timer per mata ujian, navigasi/ragu/catatan/kalkulator, skor dihitung backend (benar/40×100, lulus ≥60), kunci jawaban tersembunyi, mode esai terpisah, panel admin, impor bank soal Word, Tingkat A/B/C (tidak harus berurutan), kelak monetisasi + deployment production + custom domain.

## Architecture
- React (Sora, palet Indigo–Amber–Ivory) + FastAPI (/api) + MongoDB
- Collections: subjects (level A/B/C, code, durationMin, examCount), questions, essays, results (incl. level)
- Parser DOCX: backend/parse_any.py; impor: import_kup.py, import_all_a.py, import_bank.py (JOBS per level+short; re-run = ganti total bank soal & esai subject tsb)
- Admin auth: bcrypt hash di db.admin_users (seed sekali dari ADMIN_PASSWORD), JWT Bearer 12 jam (JWT_SECRET), token_version untuk invalidasi, lockout 5x gagal/15 menit per IP; aturan password baru ≥10 karakter + huruf & angka
- Import Word: POST /api/admin/import/preview (analyze docx -> draft di db.import_drafts TTL 24h) -> POST /api/admin/import/commit (subject lama/baru; ganti PG & esai yang ada di file)
- Rapor: results.materi_stats; GET /api/report/{candidate_id}
- Peraturan (Ekstra Konten): regulations.py — unggah bertahap 4 MB (db.upload_chunks TTL) -> Emergent Object Storage (storage.py, EMERGENT_LLM_KEY), db.regulations (soft delete, subject_ids); GET /api/regulations/{id}/file (cache /tmp)
- Sesi ujian server: POST /api/exam/start (deadline), /api/exam/session/{id}/save tiap 60 dtk, submit dgn session_id (409 jika sudah terkirim); frontend menyimpan sesi di localStorage (lanjut setelah refresh)

## Implemented
- CAT simulator, mode esai, rebrand, admin CRUD + hasil (sebelumnya)
- Tingkat A: 5 mata ujian × (100 PG + 25 esai)
- 2026-06: Tingkat B (5 file pertama): KUP-PPSP-PP, Bea Meterai, PBB-P5L, Akuntansi Perpajakan, PPh Badan & SPT PPh Badan — masing-masing 100 PG + 25 esai, 90 menit, 40 soal acak
- 2026-06: Tab Tingkat A|B|C di Dashboard & Mode Esai (tersimpan di browser), badge tingkat di pra-ujian, hasil, riwayat, admin dropdown & tabel hasil; result menyimpan level
- Testing: iteration_1 backend 8/8 + frontend flows 100%
- 2026-06: Tingkat B lengkap 8 mata ujian (+PPh OP, Pot/Put, PPN versi B); Tingkat C dibuka 2 mata ujian: C1 PPh OP & SPT PPh OP, C2 KUP-PPSP-PP — nama lengkap '(Aspek Transaksi Internasional dan P3B)', 90 mnt/40 soal. Kunci jawaban parser dicek silang dgn tabel kunci di dokumen (100% cocok). Tabel durasi landing B & C disamakan 1,5 jam. Fix badge pra-ujian. pytest 9/9

- 2026-06: Admin 'Unggah Word' (pratinjau + validasi + simpan ke mata ujian lama/baru), 'Ganti Password' (bcrypt+JWT), Rapor peserta (/rapor: per tingkat, per mata ujian, per materi + materi terlemah), Hasil per Materi di layar hasil. Bank B & C diimpor ulang dengan tag materi. Testing iteration_2: backend 25/25, frontend 100%

- 2026-06: Disesuaikan dgn Panduan Umum & Teknis UKP Online: alur Detail Ujian -> Pakta Integritas -> pratinjau kamera (lokal) -> token (1234) -> Panduan -> ujian 3 kolom (Ekstra Konten | Soal KEMBALI/TANDAI/LANJUT + Note/Lembar Kerja/Kalkulator | Navigasi online + Statistik + KIRIM & SELESAI) -> halaman 'Ujian Telah Selesai' -> nilai. Lembar Kerja ala Excel (rumus, SUM/ROUND dll). Admin tab 'Peraturan' (PDF/Excel, pilih mata ujian). Beranda: hook baru, klaim 250+/30.000+/1.000+, testimoni & infografis kelulusan dihapus; footer penafian tidak berafiliasi. Testing iteration_3: backend 28/28, frontend lulus (2 temuan kecil sudah diperbaiki)

## Backlog
- P0: User ganti password admin lewat menu 'Ganti Password' sebelum production
- P0: Sisa Tingkat C (8 mata ujian lagi) — user akan upload bertahap
- P0: User unggah file peraturan (SDSN UU Pajak, UU PPSP, UU PP, Lampiran PP 58/2023, PER-11/2025, SPT Coretax PDF/Excel) via tab 'Peraturan'
- P1: User unggah ulang 5 file Tingkat A via 'Unggah Word' agar rapor per materi Tingkat A aktif
- P1: Login peserta + akses berbayar (voucher manual atau Midtrans/Xendit)
- P1: Deployment production + subdomain (mis. belajar.potput.id), link dari Blogger/Sitepad
