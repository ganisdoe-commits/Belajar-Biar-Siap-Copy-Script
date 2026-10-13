# Catatan Prototipe — Belajar Biar Pintar

**Aplikasi Pembelajaran Ujian Kompetensi Pajak (Simulasi CAT Tingkat A, B, C)**

| | |
|---|---|
| Versi dokumen | Prototipe v0.9 — Juni 2026 |
| Status | Prototipe berjalan di lingkungan *preview* (belum production / belum dijual) |
| Bahasa aplikasi | Bahasa Indonesia |
| Posisi produk | Simulator latihan mandiri — **bukan** ujian resmi, tidak berafiliasi dengan Kementerian Keuangan maupun penyelenggara ujian |

---

# BAGIAN I — PANDUAN PEMILIK (NON-TEKNIS)

## 1. Ringkasan Produk

Belajar Biar Pintar adalah aplikasi web untuk berlatih menghadapi Ujian Kompetensi Pajak berbasis komputer (CAT). Alur dan tampilan layar ujiannya dibuat menyerupai **Panduan Umum dan Teknis Peserta Ujian Online UKP**, sehingga peserta terbiasa dengan:

- urutan pra-ujian (detail ujian, pakta integritas, kamera, token, panduan),
- layar ujian 3 kolom (Ekstra Konten — Soal — Navigasi),
- membuka peraturan perpajakan di dalam layar ujian,
- lembar kerja ala Excel sebagai pengganti kertas buram,
- tekanan waktu dan aturan "Kirim & Selesai" yang mengunci jawaban.

Setelah ujian, peserta langsung mendapat **nilai, pembahasan per soal, dan rapor per materi** untuk mengetahui bagian yang masih lemah.

**Hook beranda:** *"Jangan biarkan hari ujian menjadi pertama kalinya Anda melihat layar CAT."*
Tiga poin: alur & layar seperti ujian asli · soal studi kasus terbaru · rapor per materi menunjukkan titik lemah.
Beranda **tidak** memuat klaim angka pengguna/sesi, testimoni contoh, maupun infografis kelulusan contoh.

## 2. Cara Memulai Simulasi (Peserta)

1. Buka alamat aplikasi, lalu klik **Mulai Belajar** atau buka halaman `/dashboard`.
2. Isi **nama** Anda → klik masuk (tanpa password; identitas disimpan di browser).
3. Pilih tab **Tingkat A / B / C** → pilih mata ujian → klik **Mulai Simulasi**.
4. Halaman pra-ujian:
   - Periksa **Detail Ujian** (nama ujian, mata ujian, durasi, jumlah soal, zona waktu, browser, alamat IP).
   - Baca dan centang **Pakta Integritas**.
   - (Opsional) klik **Aktifkan Kamera** — pratinjau hanya tampil di layar Anda, **tidak direkam dan tidak dikirim**.
   - Masukkan **token latihan `1234`** → klik **MULAI UJIAN**.
5. Baca **Panduan Ujian** → klik **LANJUT**. Timer mulai berjalan.
6. Kerjakan soal. Setelah selesai klik **KIRIM & SELESAI** → konfirmasi.
7. Muncul halaman **Ujian Telah Selesai** → klik **Lihat Nilai & Pembahasan**.
8. Lihat perkembangan di menu **Rapor**.

> Tips: Jika halaman tertutup atau di-refresh di tengah ujian, buka lagi mata ujian yang sama — ujian **dilanjutkan** dengan sisa waktu yang benar.

## 3. Layar Ujian (CAT)

| Area | Isi |
|---|---|
| Header | Nama mata ujian, tingkat, nama peserta, **Sisa Waktu** (berkedip merah pada 5 menit terakhir) |
| Kiri — **EKSTRA KONTEN** | Petunjuk singkat + tautan **Peraturan & Formulir** sesuai mata ujian. Klik tautan → dokumen terbuka di layar ujian → **Kembali ke Soal** |
| Tengah — **Soal** | Nomor soal, teks soal, opsi A–D. Tombol **KEMBALI**, **TANDAI** (ragu-ragu), **LANJUT**. Alat: **Note**, **Lembar Kerja**, **Kalkulator** |
| Kanan — **NAVIGASI** | Status *online/offline*, kotak nomor 1–40 (biru = terjawab, bendera merah = ditandai), **Statistik** (terjawab, belum, ditandai), info simpan otomatis, tombol **KIRIM & SELESAI** |
| Ponsel | Kolom kiri/kanan menjadi tombol **Ekstra Konten** dan **Navigasi** (laci samping) |

**Aturan penilaian (sesuai panduan):** 40 soal pilihan ganda diambil **acak** dari bank 100 soal setiap percobaan · benar = **2,5 poin** · salah/kosong = 0 (tanpa pengurangan) · nilai maksimal 100 · **lulus ≥ 60**.

**Simpan otomatis:** setiap perubahan jawaban langsung tersimpan di perangkat; setiap **1 menit** dikirim ke server. Bila koneksi putus, status berubah *offline* dan jawaban tetap aman di perangkat. Bila waktu habis, jawaban **otomatis terkirim**. Jawaban yang sudah terkirim **terkunci**.

**Masa toleransi 2,5 menit (ditegakkan server):** batas waktu dihitung oleh server, bukan oleh browser.
- Kiriman yang diterima server paling lambat **2,5 menit setelah waktu habis** (mis. karena koneksi terputus) tetap dinilai dengan jawaban lengkap dari perangkat.
- Lewat dari 2,5 menit, server menolak simpan/kiriman baru dan hanya menilai **jawaban terakhir yang sudah tersimpan di server**.
- Jika halaman ditutup dan tidak dibuka lagi, server **menyelesaikan dan menilai ujian secara otomatis** (saat peserta membuka dashboard/rapor atau admin membuka Hasil).

**Lembar Kerja (ala Excel):** 10 kolom (A–J) × 30 baris. Rumus diawali `=`. Contoh: `=B3*5%`, `=SUM(B2:B6)`, `=ROUND(B5*2,5%;0)`. Fungsi: SUM, AVERAGE, MIN, MAX, COUNT, ROUND, ROUNDDOWN, ROUNDUP, ABS. Pemisah argumen `;`, desimal `,` (gaya Excel Indonesia). Isi lembar kerja tidak dinilai.

**Kalkulator:** tetap disediakan sebagai alat bantu latihan. *Catatan: pada ujian sesungguhnya kalkulator fisik dan kertas buram dilarang; yang disediakan adalah tab Excel.*

## 4. Mode Esai

Menu **Mode Esai** berisi 25 soal studi kasus per mata ujian. Peserta menulis jawaban, lalu membuka **jawaban model** dan dasar hukumnya untuk membandingkan. Mode esai tidak dinilai otomatis.

## 5. Rapor Peserta

Menu **Rapor** (atau tombol **Lihat Rapor** di dashboard), per tingkat:

- Rata-rata nilai, nilai terbaik, jumlah percobaan, jumlah mata ujian lulus.
- **Materi yang perlu diperkuat** — bab dengan persentase benar < 60%.
- Per mata ujian: percobaan, terbaik, rata-rata, terakhir, status lulus, dan **rincian persen benar per materi/bab**.

Layar hasil setiap ujian juga menampilkan **Hasil per Materi**.

> Catatan: rincian per materi aktif untuk Tingkat B dan C. Untuk Tingkat A, unggah ulang file Word bank soal melalui **Unggah Word** agar label materi terbaca.

## 6. Panel Admin

Alamat: `/admin` (tidak ditautkan dari menu peserta). Masuk dengan password admin.

| Tab | Fungsi |
|---|---|
| **Soal PG** | Lihat, tambah, ubah, hapus soal pilihan ganda per mata ujian (kunci jawaban & pembahasan) |
| **Esai** | Kelola soal esai dan jawaban model |
| **Unggah Word** | Unggah bank soal `.docx` → aplikasi memeriksa (jumlah PG/esai, soal bermasalah, kecocokan tabel kunci, daftar materi, contoh soal) → pilih mata ujian lama **atau buat mata ujian baru** (nama, tingkat, kode, durasi, jumlah soal) → **Simpan** (mengganti seluruh soal mata ujian tsb). Riwayat nilai peserta tetap aman |
| **Peraturan** | Unggah PDF/Excel (maks. 100 MB), beri judul, centang mata ujian yang menampilkannya. Atur ulang atau hapus kapan saja |
| **Hasil** | Riwayat nilai seluruh peserta |
| **Ganti Password** | Ganti password admin (min. 10 karakter, huruf + angka) |
| **Dokumentasi** | Dokumen ini — bisa dibaca dan diunduh |

**Format file Word bank soal** (sama seperti file yang sudah diunggah): judul `Materi: ...`, soal `Soal 1. ...`, opsi `A.`–`D.`, `Kunci Jawaban: X`, `Pembahasan:`, `Dasar Hukum:`; bagian esai diawali `Bagian II` dengan judul `Esai 1 — ...`, `Kasus:`, `Jawaban:`/`Pedoman Jawaban:`. Tabel ringkasan kunci di dokumen dipakai untuk pengecekan silang.

## 7. Isi Konten Saat Ini

### 7.1 Mata ujian & bank soal

| Tingkat | Kode | Mata Ujian | Bank PG | Esai | Durasi |
|---|---|---|---|---|---|
| A | A1 | PPh OP & SPT PPh OP | 100 | 25 | 120 mnt |
| A | A1 | KUP, PPSP, dan Pengadilan Pajak | 100 | 25 | 90 mnt |
| A | A2 | PPh Pot/Put | 100 | 25 | 120 mnt |
| A | A2 | PPN & SPT PPN | 100 | 25 | 90 mnt |
| A | A3 | PBB-P5L & Bea Meterai | 100 | 25 | 90 mnt |
| B | B1 | PPh OP & SPT PPh OP | 100 | 25 | 90 mnt |
| B | B2 | KUP, PPSP, dan Pengadilan Pajak | 100 | 25 | 90 mnt |
| B | B3 | PPh Pot/Put | 100 | 25 | 90 mnt |
| B | B4 | PPN & SPT PPN | 100 | 25 | 90 mnt |
| B | B5 | Bea Meterai | 100 | 25 | 90 mnt |
| B | B6 | PBB-P5L | 100 | 25 | 90 mnt |
| B | B7 | Akuntansi Perpajakan | 100 | 25 | 90 mnt |
| B | B8 | PPh Badan & SPT PPh Badan | 100 | 25 | 90 mnt |
| C | C1 | PPh Orang Pribadi dan SPT PPh Orang Pribadi (Aspek Transaksi Internasional dan P3B) | 100 | 25 | 90 mnt |
| C | C2 | KUP, PPSP, dan Pengadilan Pajak (Aspek Transaksi Internasional dan P3B) | 100 | 25 | 90 mnt |

**Total:** 15 mata ujian · 1.500 soal PG · 375 esai. Setiap sesi: 40 soal acak.
Tingkat tidak harus ditempuh berurutan. Sisa 8 mata ujian Tingkat C akan ditambahkan melalui **Unggah Word**.

### 7.2 Peraturan & formulir (Ekstra Konten)

| Dokumen | Format | Ditampilkan di |
|---|---|---|
| SDSN UU Pajak 2023 | PDF (426 hlm) | Semua 15 mata ujian |
| UU PPSP (UU 19/2000) | PDF | KUP-PPSP-PP A, B, C |
| UU Pengadilan Pajak (UU 14/2002) | PDF | KUP-PPSP-PP A, B, C |
| Lampiran Tarif PP 58/2023 | PDF | PPh Pot/Put A, B · PPh OP A, B, C |
| Lampiran PER-11/PJ/2025 (lengkap, 1.040 hlm) | PDF | PPh Pot/Put A, B · PPN A, B |
| SPT Masa PPN & Faktur Pajak (potongan PER-11 huruf D–E) | PDF (200 hlm) | PPN A, B |
| Formulir SPT Tahunan PPh Orang Pribadi 2025 | PDF | PPh OP A, B, C |
| Formulir SPT Tahunan PPh Badan (PER-11/PJ/2025) | Excel (35 sheet) | PPh Badan B · Akuntansi Perpajakan B |

## 8. Keamanan & Perlindungan Konten

- **Kunci jawaban tidak pernah dikirim ke browser** selama ujian; nilai dihitung di server. Kiriman jawaban **wajib** memakai sesi ujian yang sah milik peserta tersebut; pembahasan hanya diberikan untuk 40 soal sesi itu setelah sesi ditutup.
- Setiap peserta mendapat **kode rahasia** dari server saat masuk (tersimpan di browser). Sesi, kiriman, riwayat, dan rapor hanya dapat diakses dengan kode itu (perlindungan sementara sampai ada akun login + pembayaran).
- Setiap sesi menyimpan **salinan soal & kunci** saat ujian dimulai, sehingga impor ulang bank soal tidak mengganggu ujian yang sedang berjalan.
- Penutupan sesi bersifat **atomik**: jika tombol kirim tertekan dua kali atau ada dua kiriman bersamaan, hanya satu yang dicatat.
- Password admin disimpan **terenkripsi (bcrypt)**; sesi admin berlaku 12 jam; mengganti password otomatis mengeluarkan sesi di perangkat lain.
- Login admin dikunci **15 menit** setelah 5 kali salah.
- Jawaban yang sudah dikirim dikunci server (tidak bisa dikirim/diubah ulang).
- File peraturan disimpan di penyimpanan objek terkelola, bukan di database.
- Kamera hanya pratinjau lokal; tidak ada perekaman atau pengiriman video.

## 9. Keterbatasan Prototipe (Belum Tersedia)

| Hal | Keterangan |
|---|---|
| Login peserta & pembayaran | Peserta masuk dengan nama + kode rahasia otomatis per browser (bila data browser dihapus, riwayat lama tidak bisa dibuka lagi); belum ada akun, voucher, atau gateway pembayaran |
| Production / domain | Masih di alamat *preview* — **jangan dibagikan untuk dijual**. Perlu deploy production + domain/subdomain (mis. `belajar.potput.id`) |
| Pengawasan (proctoring) | Tidak ada Safe Exam Browser, Zoom, atau perekaman. Aplikasi adalah simulasi |
| Token | Token latihan tetap (`1234`); belum ada token per sesi/jadwal serentak |
| Tingkat C | Baru 2 dari 10 mata ujian |
| Rapor per materi Tingkat A | Menunggu unggah ulang file Word Tingkat A |
| Penampil PDF | Memakai penampil PDF bawaan browser (fitur cari Ctrl+F tersedia di komputer); di sebagian ponsel PDF dibuka sebagai unduhan |
| File besar | PER-11 lengkap (28 MB) butuh beberapa detik saat pertama dibuka |
| Penilaian esai | Belum dinilai otomatis |

## 10. Daftar Periksa Sebelum Dijual

- [ ] Ganti password admin (Panel Admin → Ganti Password)
- [ ] Lengkapi Tingkat C (8 mata ujian) via Unggah Word
- [ ] Unggah ulang 5 file Tingkat A (untuk rapor per materi)
- [ ] Putuskan model akses berbayar (voucher manual / Midtrans / Xendit) dan login peserta
- [ ] Deploy ke production & hubungkan domain/subdomain; tautkan dari Blogger/situs utama
- [ ] Tinjau ulang syarat & ketentuan, kebijakan privasi, dan penafian
- [ ] Uji coba terbatas dengan beberapa calon peserta

## 11. Rencana Berikutnya (Usulan)

1. Login peserta + akses berbayar (voucher/gateway).
2. Try-out serentak terjadwal dengan token per sesi.
3. Kotak pencarian pasal di penampil peraturan.
4. Rapor PDF yang bisa diunduh/dibagikan.
5. Penilaian esai berbantuan AI (opsional).

---

# BAGIAN II — RINGKASAN TEKNIS (DEVELOPER)

## 12. Arsitektur

```
Browser (React 19 + Tailwind + shadcn/ui)
   │  REACT_APP_BACKEND_URL  (semua rute API berawalan /api)
   ▼
FastAPI (port 8001, supervisor)  ──►  MongoDB (MONGO_URL, DB_NAME)
   │
   └──►  Emergent Object Storage (file peraturan; kunci EMERGENT_LLM_KEY)
```

- Frontend: `/app/frontend/src` — halaman di `pages/`, komponen di `components/` (`exam/`, `preexam/`, `admin/`, `report/`), state ujian di `context/ExamContext.js`, mesin rumus di `lib/sheetFormula.js`, klien API di `api.js`.
- Backend: `/app/backend/server.py` (subjek, ujian, sesi, skor, rapor, admin, impor Word), `regulations.py` (unggah bertahap & penyajian file), `storage.py` (object storage), `parse_any.py` (parser & validator DOCX).
- Pustaka penting: `xlsx` (SheetJS 0.20.3, render Excel di browser), `react-markdown` + `remark-gfm` (dokumentasi), `bcrypt`, `PyJWT`, `python-docx`.

## 13. Variabel Lingkungan

| File | Kunci | Fungsi |
|---|---|---|
| `frontend/.env` | `REACT_APP_BACKEND_URL` | URL backend |
| `backend/.env` | `MONGO_URL`, `DB_NAME` | Database |
| `backend/.env` | `ADMIN_PASSWORD` | Password admin awal — **hanya dipakai sekali** saat akun admin belum ada di DB |
| `backend/.env` | `JWT_SECRET` | Penandatanganan token admin |
| `backend/.env` | `EMERGENT_LLM_KEY` | Akses object storage |
| `backend/.env` | `CORS_ORIGINS` | CORS |

## 14. Koleksi MongoDB

| Koleksi | Isi |
|---|---|
| `subjects` | id, level (A/B/C), code, short, name, desc, color, order, durationMin, examCount |
| `questions` | id, subject_id, number, materi, question, options[{key,text}], answer, pembahasan |
| `essays` | id, subject_id, number, question, model_answer |
| `candidates` | id, name, secret_hash (SHA-256), created_at |
| `exam_sessions` | id, subject_id, candidate, question_ids, questions (salinan soal+kunci), answers, flags, status (in_progress/scoring/submitted), started_at, deadline, saved_at, basis |
| `results` | id, candidate, subject_id/name, level, total, correct, answered, unanswered, score, passed, materi_stats[], date |
| `regulations` | id, title, filename, kind (pdf/excel), content_type, size, storage_path, subject_ids[], order, is_deleted |
| `admin_users` | username, password_hash (bcrypt), token_version, password_changed_at |
| `login_attempts` | identifier (IP), count, locked_until |
| `import_drafts` / `upload_sessions` / `upload_chunks` | Data sementara (TTL 24 jam) |

## 15. Endpoint API

**Publik / peserta**

| Metode | Rute | Fungsi |
|---|---|---|
| GET | `/api/subjects`, `/api/subjects/{id}` | Daftar & detail mata ujian |
| POST | `/api/candidates` | Daftarkan peserta → id + kode rahasia (header `X-Candidate-Id`, `X-Candidate-Secret`) |
| POST | `/api/exam/start` | *(peserta)* Mulai sesi: 40 soal acak (tanpa kunci) + salinan soal/kunci di server, deadline, `grace_sec`=150 |
| POST | `/api/exam/session/{id}/save` | *(pemilik sesi)* Simpan otomatis; ditolak 409 setelah deadline + 150 dtk |
| POST | `/api/exam/submit` | *(pemilik sesi, wajib `session_id`)* Kirim & nilai secara atomik; 409 bila sudah tertutup |
| GET | `/api/subjects/{id}/essays` | Soal esai + jawaban model |
| GET | `/api/results/{candidate_id}` | *(peserta ybs.)* Riwayat nilai; menutup otomatis sesi kedaluwarsa |
| GET | `/api/report/{candidate_id}` | *(peserta ybs.)* Rapor per tingkat, mata ujian, materi |
| GET | `/api/subjects/{id}/regulations` | Daftar peraturan per mata ujian |
| GET | `/api/regulations/{id}/file` | Isi file (inline) |
| GET | `/api/client-info` | Alamat IP (untuk Detail Ujian) |

**Admin (Bearer JWT)**

| Metode | Rute | Fungsi |
|---|---|---|
| POST | `/api/admin/login`, `/api/admin/change-password`; GET `/api/admin/me` | Autentikasi |
| CRUD | `/api/admin/subjects`, `/api/admin/questions`, `/api/admin/essays` (+ `/bulk`) | Kelola konten |
| POST | `/api/admin/import/preview`, `/api/admin/import/commit` | Impor Word |
| POST | `/api/admin/regulations/upload/init` → `/chunk` → `/complete` | Unggah bertahap (potongan 4 MB) |
| GET/PUT/DELETE | `/api/admin/regulations[/{id}]` | Kelola peraturan |
| GET | `/api/admin/results` | Semua hasil |
| GET | `/api/admin/docs/prototype` | Dokumen ini |

## 16. Pengujian

- Laporan pengujian otomatis: `/app/test_reports/iteration_1.json` s.d. `iteration_4.json`.
- Tes backend: `/app/backend/tests/backend_test.py` + berkas contoh (`test_bad.docx`, `test_empty.docx`, `sample_regulation.pdf`, `sample_spt.xlsx`).
- Kredensial uji: `/app/memory/test_credentials.md`.

## 17. Catatan Pemeliharaan

- Jangan ubah `REACT_APP_BACKEND_URL`, `MONGO_URL`, `DB_NAME`; backend wajib di `0.0.0.0:8001` dengan prefiks `/api`.
- Setelah admin mengganti password di panel, nilai `ADMIN_PASSWORD` di `.env` tidak berlaku lagi (sumber kebenaran = hash di DB).
- Impor ulang mata ujian mengganti seluruh soal PG (dan esai bila file berisi esai); riwayat nilai tidak terpengaruh.
- Dokumen ini disimpan di `/app/backend/docs/PROTOTYPE.md` dan ditampilkan di Panel Admin → **Dokumentasi**. Perbarui file tersebut setiap ada perubahan fitur.
