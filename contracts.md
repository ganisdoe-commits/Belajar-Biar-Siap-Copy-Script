# Contracts — Belajar Biar Pintar (Simulator UKP)

## Tujuan
Backend menyimpan soal + kunci jawaban di server (tidak bocor ke frontend),
melakukan skoring di server, menyediakan panel admin untuk kelola soal, dan
menyimpan hasil ujian. Frontend memanggil API via `REACT_APP_BACKEND_URL`.

## Data yang sebelumnya di-mock (mock.js) → sekarang dari backend
- SUBJECTS, MCQ_BANK, ESSAY_BANK, buildQuestions  → dipindah ke backend (seed_data.py) + DB.
- Tetap di frontend (konten marketing landing): LANDING_STATS, PASS_RATES,
  TESTIMONIALS, LEVELS, PRE_EXAM_RULES, EXAM_TOKENS, SUBJECTS (hanya untuk marquee/fallback).

## Model (MongoDB)
- subjects: { id(uuid), code, name, short, level, durationMin, color, desc, order }
- questions (PG): { id, subject_id, number, question, options:[{key,text}], answer, pembahasan }
- essays: { id, subject_id, number, question, model_answer }
- results: { id, candidate_name, candidate_id, subject_id, subject_name, total, correct, wrong, unanswered, score, passed, date }

## API (prefix /api)
### Publik
- GET  /api/subjects → daftar subject (tanpa kunci jawaban)
- GET  /api/subjects/{id} → detail subject
- GET  /api/subjects/{id}/exam → { subject, duration_sec, questions:[{id,number,question,options}] } (TANPA answer/pembahasan)
- POST /api/exam/submit → body {subject_id, candidate:{name,id}, answers:{question_id:selected}} 
       → hitung skor di server, simpan result, balas {result, review:[{id,question,options,answer,selected,is_correct,pembahasan}]}
- GET  /api/subjects/{id}/essays → daftar esai (dengan model_answer, untuk mode latihan)
- GET  /api/results/{candidate_id} → riwayat hasil peserta

### Admin (header: Authorization: Bearer <ADMIN_TOKEN>)
- POST /api/admin/login {password} → {token}
- GET/POST/PUT/DELETE /api/admin/subjects[/{id}]
- GET  /api/admin/questions?subject_id= → soal LENGKAP (dengan answer)
- POST /api/admin/questions ; PUT/DELETE /api/admin/questions/{id}
- POST /api/admin/questions/bulk {subject_id, items:[...]} → impor massal
- GET/POST/PUT/DELETE /api/admin/essays[/{id}] ; POST /api/admin/essays/bulk
- GET  /api/admin/results → semua hasil

## Skoring
- score = round(correct / total * 100, 2) (setara 2,5/soal saat total=40). Lulus bila score >= 60.

## Frontend integrasi
- src/api.js: axios instance + fungsi (getSubjects, getExam, submitExam, getEssays, getResults, admin*).
- ExamContext: startSession(subject) async → GET exam; submitSession async → POST submit (simpan result+review).
- ResultScreen: pakai session.result.review (bukan answers lokal).
- Dashboard/PreExam/EssaySelect/EssayScreen: ambil data dari API.
- Admin: /admin/login, /admin (kelola subjects, PG, esai, lihat hasil, impor).
- Auth admin disimpan di localStorage (token).
