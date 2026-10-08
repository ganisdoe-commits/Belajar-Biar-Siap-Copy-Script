from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

import seed_data

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'bbp-admin-token')

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


class LoginIn(BaseModel):
    password: str


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


async def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    token = authorization.split(" ", 1)[1].strip()
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Token admin tidak valid")
    return True


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


@app.on_event("startup")
async def on_startup():
    try:
        await seed_if_empty()
    except Exception as e:
        logger.error(f"Gagal seeding: {e}")


# ---------------------------- Public routes ----------------------------
@api_router.get("/")
async def root():
    return {"message": "Belajar Biar Pintar API", "status": "ok"}


async def _subject_qcount(sid: str) -> int:
    return await db.questions.count_documents({"subject_id": sid})


@api_router.get("/subjects")
async def get_subjects():
    subs = await db.subjects.find().sort("order", 1).to_list(100)
    out = []
    for s in subs:
        s = clean(s)
        s["totalQuestions"] = await _subject_qcount(s["id"])
        s["essayCount"] = await db.essays.count_documents({"subject_id": s["id"]})
        out.append(s)
    return out


@api_router.get("/subjects/{sid}")
async def get_subject(sid: str):
    s = await db.subjects.find_one({"id": sid})
    if not s:
        raise HTTPException(404, "Mata ujian tidak ditemukan")
    s = clean(s)
    s["totalQuestions"] = await _subject_qcount(sid)
    s["essayCount"] = await db.essays.count_documents({"subject_id": sid})
    return s


@api_router.get("/subjects/{sid}/exam")
async def get_exam(sid: str):
    s = await db.subjects.find_one({"id": sid})
    if not s:
        raise HTTPException(404, "Mata ujian tidak ditemukan")
    s = clean(s)
    qs = await db.questions.find({"subject_id": sid}).sort("number", 1).to_list(1000)
    questions = []
    for i, q in enumerate(qs, start=1):
        q = clean(q)
        questions.append({
            "id": q["id"],
            "number": i,
            "question": q["question"],
            "options": q["options"],
        })
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
    qs = await db.questions.find({"subject_id": payload.subject_id}).sort("number", 1).to_list(1000)
    total = len(qs)
    correct = 0
    answered = 0
    review = []
    for i, q in enumerate(qs, start=1):
        q = clean(q)
        selected = payload.answers.get(q["id"])
        if selected:
            answered += 1
        is_correct = selected == q["answer"]
        if is_correct:
            correct += 1
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
        "total": total,
        "correct": correct,
        "wrong": answered - correct,
        "unanswered": total - answered,
        "score": score,
        "passed": passed,
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


# ---------------------------- Admin routes ----------------------------
@api_router.post("/admin/login")
async def admin_login(payload: LoginIn):
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Kata sandi salah")
    return {"token": ADMIN_TOKEN}


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
    data = payload.dict()
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
