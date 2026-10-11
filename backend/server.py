from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, Request, UploadFile, File  # noqa: E402
from starlette.middleware.cors import CORSMiddleware  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
import os  # noqa: E402
import io  # noqa: E402
import re  # noqa: E402
import asyncio  # noqa: E402
import logging  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402
from typing import List, Optional, Dict  # noqa: E402
import uuid  # noqa: E402
from datetime import datetime, timezone, timedelta  # noqa: E402
import random  # noqa: E402
import bcrypt  # noqa: E402
import jwt  # noqa: E402

import seed_data  # noqa: E402
from parse_any import analyze, to_qdocs, to_edocs  # noqa: E402

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']  # hanya dipakai sekali saat admin belum ada di DB
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
TOKEN_HOURS = 12
MAX_FAILED = 5
LOCK_MINUTES = 15
MAX_UPLOAD_BYTES = 15 * 1024 * 1024

app = FastAPI(title="Belajar Biar Pintar API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------------------------- Models ----------------------------
class Option(BaseModel):
    key: str
    text: str


class SubjectIn(BaseModel):
    code: str = "A1"
    name: str
    short: str = ""
    level: str = "A"
    durationMin: int = 90
    examCount: int = 40
    color: str = "#4338CA"
    desc: str = ""
    order: int = 99


class Subject(SubjectIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class QuestionIn(BaseModel):
    subject_id: str
    question: str
    options: List[Option]
    answer: str
    pembahasan: str = ""
    number: Optional[int] = None
    materi: Optional[str] = None


class Question(QuestionIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class EssayIn(BaseModel):
    subject_id: str
    question: str
    model_answer: str = ""
    number: Optional[int] = None


class Essay(EssayIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class Candidate(BaseModel):
    name: str
    id: str = ""


class ExamSubmit(BaseModel):
    subject_id: str
    candidate: Candidate
    answers: Dict[str, str] = {}  # {question_id: selected_key}
    question_ids: List[str] = []  # urutan soal yang disajikan pada sesi ini


class LoginIn(BaseModel):
    password: str


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str


class ImportCommit(BaseModel):
    draft_id: str
    subject_id: Optional[str] = None
    new_subject: Optional[SubjectIn] = None


class BulkQuestions(BaseModel):
    subject_id: str
    items: List[dict]


class BulkEssays(BaseModel):
    subject_id: str
    items: List[dict]


# ---------------------------- Helpers ----------------------------
def clean(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_admin_token(token_version: int) -> str:
    payload = {"sub": "admin", "tv": token_version, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_admin_doc() -> dict:
    return await db.admin_users.find_one({"username": "admin"})


async def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesi admin berakhir, silakan masuk lagi")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token admin tidak valid")
    admin = await get_admin_doc()
    if payload.get("type") != "access" or not admin or payload.get("tv") != admin.get("token_version", 0):
        raise HTTPException(status_code=401, detail="Token admin tidak valid")
    return True


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


def password_problem(pw: str) -> Optional[str]:
    if len(pw) < 10:
        return "Password minimal 10 karakter"
    if not re.search(r"[A-Za-z]", pw) or not re.search(r"\d", pw):
        return "Password harus mengandung huruf dan angka"
    return None


# ---------------------------- Seeding ----------------------------
async def seed_if_empty():
    count = await db.subjects.count_documents({})
    if count > 0:
        return
    logger.info("Seeding database contoh...")
    name_to_id = {}
    for s in seed_data.SUBJECTS:
        subj = Subject(**s)
        await db.subjects.insert_one(subj.dict())
        name_to_id[s["name"]] = subj.id
    for sname, items in seed_data.MCQ.items():
        sid = name_to_id.get(sname)
        if not sid:
            continue
        for i, it in enumerate(items, start=1):
            q = Question(subject_id=sid, number=i, question=it["question"],
                         options=[Option(**o) for o in it["options"]],
                         answer=it["answer"], pembahasan=it.get("pembahasan", ""))
            await db.questions.insert_one(q.dict())
    for sname, items in seed_data.ESSAY.items():
        sid = name_to_id.get(sname)
        if not sid:
            continue
        for i, it in enumerate(items, start=1):
            e = Essay(subject_id=sid, number=i, question=it["question"],
                      model_answer=it.get("model_answer", ""))
            await db.essays.insert_one(e.dict())
    logger.info("Seeding selesai.")


async def seed_admin():
    # Seed sekali saja; setelah admin mengganti password di panel, .env tidak menimpa lagi.
    if not await get_admin_doc():
        await db.admin_users.insert_one({
            "username": "admin", "password_hash": hash_password(ADMIN_PASSWORD),
            "token_version": 0, "created_at": datetime.now(timezone.utc).isoformat(), "password_changed_at": None,
        })
        logger.info("Admin awal dibuat dari ADMIN_PASSWORD.")


@app.on_event("startup")
async def on_startup():
    try:
        await seed_if_empty()
        await seed_admin()
        await db.admin_users.create_index("username", unique=True)
        await db.login_attempts.create_index("identifier", unique=True)
        await db.import_drafts.create_index("created_at", expireAfterSeconds=86400)
    except Exception as e:
        logger.error(f"Gagal seeding: {e}")


# ---------------------------- Public routes ----------------------------
@api_router.get("/")
async def root():
    return {"message": "Belajar Biar Pintar API", "status": "ok"}


async def _subject_qcount(sid: str) -> int:
    return await db.questions.count_documents({"subject_id": sid})


async def _attach_public_counts(s: dict) -> dict:
    bank = await _subject_qcount(s["id"])
    ec = int(s.get("examCount", 40))
    s["bankSize"] = bank
    s["examCount"] = ec
    s["totalQuestions"] = min(ec, bank) if bank else 0
    s["essayCount"] = await db.essays.count_documents({"subject_id": s["id"]})
    return s


@api_router.get("/subjects")
async def get_subjects():
    subs = await db.subjects.find().sort("order", 1).to_list(100)
    return [await _attach_public_counts(clean(s)) for s in subs]


@api_router.get("/subjects/{sid}")
async def get_subject(sid: str):
    s = await db.subjects.find_one({"id": sid})
    if not s:
        raise HTTPException(404, "Mata ujian tidak ditemukan")
    return await _attach_public_counts(clean(s))


@api_router.get("/subjects/{sid}/exam")
async def get_exam(sid: str):
    s = await db.subjects.find_one({"id": sid})
    if not s:
        raise HTTPException(404, "Mata ujian tidak ditemukan")
    s = clean(s)
    all_qs = await db.questions.find({"subject_id": sid}).to_list(2000)
    exam_count = int(s.get("examCount", 40))
    if len(all_qs) > exam_count:
        chosen = random.sample(all_qs, exam_count)
    else:
        chosen = all_qs
        random.shuffle(chosen)
    questions = []
    for i, q in enumerate(chosen, start=1):
        q = clean(q)
        questions.append({
            "id": q["id"],
            "number": i,
            "question": q["question"],
            "options": q["options"],
        })
    s["bankSize"] = len(all_qs)
    s["examCount"] = exam_count
    s["totalQuestions"] = len(questions)
    return {
        "subject": s,
        "duration_sec": int(s.get("durationMin", 90)) * 60,
        "questions": questions,
    }


@api_router.post("/exam/submit")
async def submit_exam(payload: ExamSubmit):
    s = await db.subjects.find_one({"id": payload.subject_id})
    if not s:
        raise HTTPException(404, "Mata ujian tidak ditemukan")
    s = clean(s)
    if payload.question_ids:
        found = await db.questions.find(
            {"subject_id": payload.subject_id, "id": {"$in": payload.question_ids}}
        ).to_list(2000)
        qmap = {clean(q)["id"]: q for q in found}
        qs = [qmap[qid] for qid in payload.question_ids if qid in qmap]
    else:
        qs = await db.questions.find({"subject_id": payload.subject_id}).sort("number", 1).to_list(2000)
    total = len(qs)
    correct = 0
    answered = 0
    review = []
    materi_map = {}
    for i, q in enumerate(qs, start=1):
        q = clean(q)
        selected = payload.answers.get(q["id"])
        if selected:
            answered += 1
        is_correct = selected == q["answer"]
        if is_correct:
            correct += 1
        if q.get("materi"):
            ms = materi_map.setdefault(q["materi"], {"materi": q["materi"], "correct": 0, "total": 0})
            ms["total"] += 1
            ms["correct"] += int(is_correct)
        review.append({
            "id": q["id"],
            "number": i,
            "question": q["question"],
            "options": q["options"],
            "answer": q["answer"],
            "selected": selected,
            "is_correct": is_correct,
            "pembahasan": q.get("pembahasan", ""),
        })
    score = round((correct / total) * 100, 2) if total else 0
    passed = score >= 60
    result = {
        "id": str(uuid.uuid4()),
        "candidate_name": payload.candidate.name,
        "candidate_id": payload.candidate.id,
        "subject_id": payload.subject_id,
        "subject_name": s["name"],
        "level": s.get("level", "A"),
        "total": total,
        "correct": correct,
        "wrong": answered - correct,
        "unanswered": total - answered,
        "score": score,
        "passed": passed,
        "materi_stats": list(materi_map.values()),
        "date": datetime.now(timezone.utc).isoformat(),
    }
    await db.results.insert_one(dict(result))
    result.pop("_id", None)
    return {"result": result, "review": review}


@api_router.get("/subjects/{sid}/essays")
async def get_essays(sid: str):
    es = await db.essays.find({"subject_id": sid}).sort("number", 1).to_list(1000)
    return [clean(e) for e in es]


@api_router.get("/results/{candidate_id}")
async def get_results(candidate_id: str):
    rs = await db.results.find({"candidate_id": candidate_id}).sort("date", -1).to_list(50)
    return [clean(r) for r in rs]


def _materi_list(agg: dict) -> list:
    out = [{**m, "pct": round(m["correct"] / m["total"] * 100) if m["total"] else 0} for m in agg.values()]
    return sorted(out, key=lambda m: (m["pct"], -m["total"]))


@api_router.get("/report/{candidate_id}")
async def get_report(candidate_id: str):
    rs = await db.results.find({"candidate_id": candidate_id}).sort("date", 1).to_list(2000)
    subs = {s["id"]: clean(s) for s in await db.subjects.find().to_list(500)}
    per = {}
    for r in rs:
        s = subs.get(r["subject_id"], {})
        e = per.setdefault(r["subject_id"], {
            "subject_id": r["subject_id"], "subject_name": s.get("name", r["subject_name"]),
            "code": s.get("code", ""), "color": s.get("color", "#4338CA"),
            "level": r.get("level") or s.get("level", "A"), "scores": [], "materi": {}, "last_date": None,
        })
        e["scores"].append(r["score"])
        e["last_date"] = r["date"]
        for m in r.get("materi_stats", []):
            a = e["materi"].setdefault(m["materi"], {"materi": m["materi"], "correct": 0, "total": 0})
            a["correct"] += m["correct"]
            a["total"] += m["total"]

    subjects = []
    for e in per.values():
        sc = e.pop("scores")
        e.update({"attempts": len(sc), "best": max(sc), "avg": round(sum(sc) / len(sc), 2),
                  "last": sc[-1], "passed": max(sc) >= 60, "materi": _materi_list(e["materi"])})
        subjects.append(e)
    subjects.sort(key=lambda x: (x["level"], subs.get(x["subject_id"], {}).get("order", 999)))

    levels = []
    for lv in ["A", "B", "C"]:
        ls = [x for x in subjects if x["level"] == lv]
        weak = [{**m, "subject_name": x["subject_name"], "subject_id": x["subject_id"]} for x in ls for m in x["materi"]]
        weak.sort(key=lambda m: (m["pct"], -m["total"]))
        attempts = sum(x["attempts"] for x in ls)
        levels.append({
            "level": lv,
            "subjects_total": sum(1 for s in subs.values() if s.get("level", "A") == lv),
            "subjects_attempted": len(ls),
            "subjects_passed": sum(1 for x in ls if x["passed"]),
            "attempts": attempts,
            "avg": round(sum(x["avg"] * x["attempts"] for x in ls) / attempts, 2) if attempts else 0,
            "best": max((x["best"] for x in ls), default=0),
            "weakest": [m for m in weak if m["pct"] < 60][:5],
        })
    return {"candidate_id": candidate_id, "total_attempts": len(rs), "levels": levels, "subjects": subjects}


# ---------------------------- Admin routes ----------------------------
@api_router.post("/admin/login")
async def admin_login(payload: LoginIn, request: Request):
    ident = client_ip(request)
    now = datetime.now(timezone.utc)
    att = await db.login_attempts.find_one({"identifier": ident})
    if att and att.get("locked_until") and datetime.fromisoformat(att["locked_until"]) > now:
        mins = int((datetime.fromisoformat(att["locked_until"]) - now).total_seconds() // 60) + 1
        raise HTTPException(429, f"Terlalu banyak percobaan gagal. Coba lagi dalam {mins} menit.")
    admin = await get_admin_doc()
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        count = (att.get("count", 0) if att and not att.get("locked_until") else 0) + 1
        upd = {"count": count, "last_failed_at": now.isoformat(), "locked_until": None}
        if count >= MAX_FAILED:
            upd = {"count": 0, "last_failed_at": now.isoformat(),
                   "locked_until": (now + timedelta(minutes=LOCK_MINUTES)).isoformat()}
        await db.login_attempts.update_one({"identifier": ident}, {"$set": upd}, upsert=True)
        raise HTTPException(401, "Kata sandi salah")
    await db.login_attempts.delete_one({"identifier": ident})
    return {"token": create_admin_token(admin.get("token_version", 0))}


@api_router.post("/admin/change-password")
async def admin_change_password(payload: ChangePasswordIn, _: bool = Depends(require_admin)):
    admin = await get_admin_doc()
    if not verify_password(payload.current_password, admin["password_hash"]):
        raise HTTPException(400, "Password saat ini salah")
    problem = password_problem(payload.new_password)
    if problem:
        raise HTTPException(400, problem)
    if verify_password(payload.new_password, admin["password_hash"]):
        raise HTTPException(400, "Password baru harus berbeda dari password saat ini")
    tv = admin.get("token_version", 0) + 1
    await db.admin_users.update_one({"username": "admin"}, {"$set": {
        "password_hash": hash_password(payload.new_password), "token_version": tv,
        "password_changed_at": datetime.now(timezone.utc).isoformat()}})
    return {"ok": True, "token": create_admin_token(tv)}


@api_router.get("/admin/me")
async def admin_me(_: bool = Depends(require_admin)):
    admin = await get_admin_doc()
    return {"username": "admin", "password_changed_at": admin.get("password_changed_at")}


# ---------------------------- Import Word ----------------------------
LEVEL_BASE_ORDER = {"A": 1, "B": 11, "C": 21}


@api_router.post("/admin/import/preview")
async def import_preview(file: UploadFile = File(...), _: bool = Depends(require_admin)):
    if not (file.filename or "").lower().endswith(".docx"):
        raise HTTPException(400, "Hanya file Word berformat .docx yang didukung")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Ukuran file melebihi 15 MB")
    try:
        rep = await asyncio.to_thread(analyze, io.BytesIO(data))
    except Exception:
        raise HTTPException(400, "File tidak dapat dibaca sebagai dokumen Word (.docx)")
    if not rep["mcq_total"] and not rep["essay_total"]:
        raise HTTPException(400, "Tidak ditemukan soal. Pastikan format 'Soal 1.' dan 'Esai 1 —' sesuai template bank soal.")
    draft_id = str(uuid.uuid4())
    await db.import_drafts.insert_one({
        "id": draft_id, "created_at": datetime.now(timezone.utc), "filename": file.filename,
        "mcq": rep["valid_mcq"], "essays": rep["valid_essays"],
    })
    meta = rep["meta"]
    match = await db.subjects.find_one({"level": meta["level"], "name": meta["name"]}) if meta["name"] else None
    first = rep["valid_mcq"][0] if rep["valid_mcq"] else None
    return {
        "draft_id": draft_id, "filename": file.filename, "meta": meta,
        "mcq_total": rep["mcq_total"], "mcq_valid": len(rep["valid_mcq"]),
        "essay_total": rep["essay_total"], "essay_valid": len(rep["valid_essays"]),
        "issues": rep["issues"], "warnings": rep["warnings"], "materi": rep["materi"],
        "key_table_found": rep["key_table_found"],
        "suggested_subject_id": match["id"] if match else None,
        "sample": {"number": first["number"], "question": first["question"], "options": first["options"],
                   "answer": first["answer"], "materi": first["materi"]} if first else None,
    }


@api_router.post("/admin/import/commit")
async def import_commit(payload: ImportCommit, _: bool = Depends(require_admin)):
    draft = await db.import_drafts.find_one({"id": payload.draft_id})
    if not draft:
        raise HTTPException(404, "Pratinjau kedaluwarsa, silakan unggah ulang file")
    if payload.subject_id:
        subj = await db.subjects.find_one({"id": payload.subject_id})
        if not subj:
            raise HTTPException(404, "Mata ujian tidak ditemukan")
        sid, created = subj["id"], False
    elif payload.new_subject:
        ns = payload.new_subject
        if not ns.name.strip() or ns.level not in LEVEL_BASE_ORDER or not ns.code.strip():
            raise HTTPException(400, "Nama, tingkat (A/B/C), dan kode mata ujian wajib diisi")
        if ns.durationMin < 10 or ns.durationMin > 300:
            raise HTTPException(400, "Durasi harus antara 10 dan 300 menit")
        last = await db.subjects.find({"level": ns.level}).sort("order", -1).to_list(1)
        data = ns.dict()
        data["name"], data["code"] = ns.name.strip(), ns.code.strip()
        data["short"] = data["short"] or data["code"]
        data["order"] = (last[0]["order"] + 1) if last else LEVEL_BASE_ORDER[ns.level]
        subj = Subject(**data).dict()
        await db.subjects.insert_one(dict(subj))
        sid, created = subj["id"], True
    else:
        raise HTTPException(400, "Pilih mata ujian tujuan atau buat mata ujian baru")

    mcq, essays = draft["mcq"], draft["essays"]
    if mcq:
        await db.questions.delete_many({"subject_id": sid})
        await db.questions.insert_many(to_qdocs(sid, mcq))
    if essays:
        await db.essays.delete_many({"subject_id": sid})
        await db.essays.insert_many(to_edocs(sid, essays))
    await db.import_drafts.delete_one({"id": payload.draft_id})
    return {"ok": True, "subject_id": sid, "created_subject": created,
            "mcq_saved": len(mcq), "essays_saved": len(essays),
            "essays_kept": not essays, "mcq_kept": not mcq}


@api_router.get("/admin/subjects")
async def admin_subjects(_: bool = Depends(require_admin)):
    subs = await db.subjects.find().sort("order", 1).to_list(100)
    out = []
    for s in subs:
        s = clean(s)
        s["totalQuestions"] = await _subject_qcount(s["id"])
        s["essayCount"] = await db.essays.count_documents({"subject_id": s["id"]})
        out.append(s)
    return out


@api_router.post("/admin/subjects")
async def create_subject(payload: SubjectIn, _: bool = Depends(require_admin)):
    subj = Subject(**payload.dict())
    await db.subjects.insert_one(subj.dict())
    return subj.dict()


@api_router.put("/admin/subjects/{sid}")
async def update_subject(sid: str, payload: SubjectIn, _: bool = Depends(require_admin)):
    res = await db.subjects.update_one({"id": sid}, {"$set": payload.dict()})
    if res.matched_count == 0:
        raise HTTPException(404, "Mata ujian tidak ditemukan")
    s = await db.subjects.find_one({"id": sid})
    return clean(s)


@api_router.delete("/admin/subjects/{sid}")
async def delete_subject(sid: str, _: bool = Depends(require_admin)):
    await db.subjects.delete_one({"id": sid})
    await db.questions.delete_many({"subject_id": sid})
    await db.essays.delete_many({"subject_id": sid})
    return {"ok": True}


@api_router.get("/admin/questions")
async def admin_questions(subject_id: str, _: bool = Depends(require_admin)):
    qs = await db.questions.find({"subject_id": subject_id}).sort("number", 1).to_list(1000)
    return [clean(q) for q in qs]


@api_router.post("/admin/questions")
async def create_question(payload: QuestionIn, _: bool = Depends(require_admin)):
    if payload.number is None:
        payload.number = await db.questions.count_documents({"subject_id": payload.subject_id}) + 1
    q = Question(**payload.dict())
    await db.questions.insert_one(q.dict())
    return q.dict()


@api_router.put("/admin/questions/{qid}")
async def update_question(qid: str, payload: QuestionIn, _: bool = Depends(require_admin)):
    data = payload.dict(exclude_none=True)
    data["options"] = [o if isinstance(o, dict) else o for o in data["options"]]
    res = await db.questions.update_one({"id": qid}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Soal tidak ditemukan")
    q = await db.questions.find_one({"id": qid})
    return clean(q)


@api_router.delete("/admin/questions/{qid}")
async def delete_question(qid: str, _: bool = Depends(require_admin)):
    await db.questions.delete_one({"id": qid})
    return {"ok": True}


@api_router.post("/admin/questions/bulk")
async def bulk_questions(payload: BulkQuestions, _: bool = Depends(require_admin)):
    start = await db.questions.count_documents({"subject_id": payload.subject_id})
    docs = []
    for i, it in enumerate(payload.items, start=1):
        opts = it.get("options", [])
        q = Question(
            subject_id=payload.subject_id,
            number=it.get("number", start + i),
            question=it.get("question", ""),
            options=[Option(**o) for o in opts],
            answer=it.get("answer", "A"),
            pembahasan=it.get("pembahasan", ""),
        )
        docs.append(q.dict())
    if docs:
        await db.questions.insert_many(docs)
    return {"inserted": len(docs)}


@api_router.get("/admin/essays")
async def admin_essays(subject_id: str, _: bool = Depends(require_admin)):
    es = await db.essays.find({"subject_id": subject_id}).sort("number", 1).to_list(1000)
    return [clean(e) for e in es]


@api_router.post("/admin/essays")
async def create_essay(payload: EssayIn, _: bool = Depends(require_admin)):
    if payload.number is None:
        payload.number = await db.essays.count_documents({"subject_id": payload.subject_id}) + 1
    e = Essay(**payload.dict())
    await db.essays.insert_one(e.dict())
    return e.dict()


@api_router.put("/admin/essays/{eid}")
async def update_essay(eid: str, payload: EssayIn, _: bool = Depends(require_admin)):
    res = await db.essays.update_one({"id": eid}, {"$set": payload.dict()})
    if res.matched_count == 0:
        raise HTTPException(404, "Soal esai tidak ditemukan")
    e = await db.essays.find_one({"id": eid})
    return clean(e)


@api_router.delete("/admin/essays/{eid}")
async def delete_essay(eid: str, _: bool = Depends(require_admin)):
    await db.essays.delete_one({"id": eid})
    return {"ok": True}


@api_router.post("/admin/essays/bulk")
async def bulk_essays(payload: BulkEssays, _: bool = Depends(require_admin)):
    start = await db.essays.count_documents({"subject_id": payload.subject_id})
    docs = []
    for i, it in enumerate(payload.items, start=1):
        e = Essay(
            subject_id=payload.subject_id,
            number=it.get("number", start + i),
            question=it.get("question", ""),
            model_answer=it.get("model_answer", ""),
        )
        docs.append(e.dict())
    if docs:
        await db.essays.insert_many(docs)
    return {"inserted": len(docs)}


@api_router.get("/admin/results")
async def admin_results(_: bool = Depends(require_admin)):
    rs = await db.results.find().sort("date", -1).to_list(500)
    return [clean(r) for r in rs]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
