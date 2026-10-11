# PRD — Belajar Biar Pintar (Simulator Ujian Kompetensi Pajak / USKP)

## Problem statement
Simulator latihan CAT USKP (bukan ujian resmi/proctored) untuk dijual ke publik: 40 PG acak per sesi dari bank 100, timer per mata ujian, navigasi/ragu/catatan/kalkulator, skor dihitung backend (benar/40×100, lulus ≥60), kunci jawaban tersembunyi, mode esai terpisah, panel admin, impor bank soal Word, Tingkat A/B/C (tidak harus berurutan), kelak monetisasi + deployment production + custom domain.

## Architecture
- React (Sora, palet Indigo–Amber–Ivory) + FastAPI (/api) + MongoDB
- Collections: subjects (level A/B/C, code, durationMin, examCount), questions, essays, results (incl. level)
- Parser DOCX: backend/parse_any.py; impor: import_kup.py, import_all_a.py, import_bank.py (JOBS per level+short; re-run = ganti total bank soal & esai subject tsb)
- Admin: password dari ADMIN_PASSWORD (.env, masih sementara)

## Implemented
- CAT simulator, mode esai, rebrand, admin CRUD + hasil (sebelumnya)
- Tingkat A: 5 mata ujian × (100 PG + 25 esai)
- 2026-06: Tingkat B (5 file pertama): KUP-PPSP-PP, Bea Meterai, PBB-P5L, Akuntansi Perpajakan, PPh Badan & SPT PPh Badan — masing-masing 100 PG + 25 esai, 90 menit, 40 soal acak
- 2026-06: Tab Tingkat A|B|C di Dashboard & Mode Esai (tersimpan di browser), badge tingkat di pra-ujian, hasil, riwayat, admin dropdown & tabel hasil; result menyimpan level
- Testing: iteration_1 backend 8/8 + frontend flows 100%
- 2026-06: Tingkat B lengkap 8 mata ujian (+PPh OP, Pot/Put, PPN versi B); Tingkat C dibuka 2 mata ujian: C1 PPh OP & SPT PPh OP, C2 KUP-PPSP-PP — nama lengkap '(Aspek Transaksi Internasional dan P3B)', 90 mnt/40 soal. Kunci jawaban parser dicek silang dgn tabel kunci di dokumen (100% cocok). Tabel durasi landing B & C disamakan 1,5 jam. Fix badge pra-ujian. pytest 9/9

## Backlog
- P0: Ganti password admin sebelum production
- P0: Sisa Tingkat C (8 mata ujian lagi) — user akan upload bertahap
- P1: Fitur admin 'Unggah Word' agar user bisa impor/revisi bank soal sendiri
- P1: Login peserta + akses berbayar (voucher manual atau Midtrans/Xendit)
- P1: Deployment production + subdomain (mis. belajar.potput.id), link dari Blogger/Sitepad
