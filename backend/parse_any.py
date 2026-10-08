"""Parser umum Bank Soal USKP (.docx) -> (mcq, essays). Format sama seperti KUP."""
import docx
import re


ANSWER_MARKERS = ("Kunci Jawaban", "Pedoman Jawaban", "Jawaban:")
STOP_MARKERS = ("Catatan Jebakan", "Tingkat Kesulitan", "Tingkat Perhitungan", "Verifikasi")


def parse(path):
    d = docx.Document(path)
    paras = [p.text.strip() for p in d.paragraphs]

    mcq, essays = [], []
    mode = "mcq"
    cur = None
    phase = field = last_opt = None

    def push_mcq():
        nonlocal cur
        if cur and mode == "mcq":
            mcq.append(cur)
        cur = None

    def push_essay():
        nonlocal cur
        if cur and mode == "essay":
            essays.append(cur)
        cur = None

    for t in paras:
        if not t:
            continue
        if t.startswith("Bagian III"):
            push_essay(); break
        if t.startswith("Bagian II"):
            push_mcq(); mode = "essay"; cur = None; continue

        # auto-switch to essay mode on first "Esai N" header even without Bagian II
        if mode == "mcq" and re.match(r"^Esai\s+\d+\s*[\u2014\u2013\-]", t):
            push_mcq(); mode = "essay"; cur = None

        if mode == "mcq":
            m = re.match(r"^Soal\s+(\d+)\.\s*(.*)$", t)
            if m:
                push_mcq()
                cur = {"number": int(m.group(1)), "question": m.group(2).strip(),
                       "options": {}, "answer": None, "pembahasan": "", "dasar": ""}
                phase = "stem"; field = None; last_opt = None
                continue
            if not cur:
                continue
            mo = re.match(r"^([ABCD])\.\s+(.*)$", t)
            if mo:
                cur["options"][mo.group(1)] = mo.group(2).strip()
                last_opt = mo.group(1); phase = "options"; field = None
                continue
            if t.startswith("Kunci Jawaban"):
                mk = re.search(r"([ABCD])", t)
                cur["answer"] = mk.group(1) if mk else None
                phase = "post"; field = None
                continue
            if t.startswith("Pembahasan"):
                cur["pembahasan"] = t.split(":", 1)[1].strip() if ":" in t else ""
                field = "pembahasan"; continue
            if t.startswith("Dasar Hukum"):
                cur["dasar"] = t.split(":", 1)[1].strip() if ":" in t else ""
                field = "dasar"; continue
            if t.startswith(STOP_MARKERS) or t.startswith("Materi"):
                field = None; continue
            if phase == "stem":
                cur["question"] += " " + t
            elif phase == "options" and last_opt:
                cur["options"][last_opt] += " " + t
            elif field == "pembahasan":
                cur["pembahasan"] += " " + t
            elif field == "dasar":
                cur["dasar"] += " " + t
        else:  # essay
            m = re.match(r"^Esai\s+(\d+)\s*[\u2014\u2013\-]\s*(.*)$", t)
            if m:
                push_essay()
                cur = {"number": int(m.group(1)), "topic": m.group(2).strip(),
                       "question": "", "model": "", "dasar": ""}
                field = "question"; continue
            if not cur:
                continue
            if t.startswith("Kasus"):
                rest = t.split(":", 1)[1].strip() if ":" in t else ""
                cur["question"] = (cur["question"] + "\n" + rest).strip() if cur["question"] else rest
                field = "question"; continue
            if t.startswith(ANSWER_MARKERS):
                after = t.split(":", 1)[1].strip() if ":" in t else ""
                cur["model"] = after
                field = "model"; continue
            if t.startswith("Dasar Hukum"):
                cur["dasar"] = t.split(":", 1)[1].strip() if ":" in t else ""
                field = "dasar"; continue
            if t.startswith(STOP_MARKERS):
                field = None; continue
            if field == "question":
                cur["question"] += ("\n" if cur["question"] else "") + t
            elif field == "model":
                cur["model"] += ("\n" if cur["model"] else "") + t
            elif field == "dasar":
                cur["dasar"] += " " + t

    push_mcq(); push_essay()
    return mcq, essays


if __name__ == "__main__":
    import sys
    files = {
        "PPh OP": "/tmp/f_pphop.docx",
        "PPh Pot/Put": "/tmp/f_potput.docx",
        "PPN": "/tmp/f_ppn.docx",
        "PBB & BM": "/tmp/f_pbb.docx",
    }
    for label, path in files.items():
        mcq, essays = parse(path)
        bad = [q["number"] for q in mcq if len(q["options"]) != 4 or not q["answer"] or q["answer"] not in q["options"]]
        ebad = [e["number"] for e in essays if not e["question"] or not e["model"]]
        print(f"{label:12s} | MCQ={len(mcq):3d} anomali={len(bad)} {bad[:8]} | Esai={len(essays):2d} kurang={ebad}")
