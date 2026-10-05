import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, Clock, FileText, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useExam } from "../context/ExamContext";
import { SUBJECTS, PRE_EXAM_RULES, EXAM_TOKENS } from "../mock";

export default function PreExam() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { candidate, startSession } = useExam();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [agree, setAgree] = useState(false);

  const subject = SUBJECTS.find((s) => s.id === subjectId);

  if (!subject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        Mata ujian tidak ditemukan.
      </div>
    );
  }

  const handleStart = () => {
    if (!agree) {
      toast({ title: "Harap setujui tata tertib", description: "Centang persetujuan tata tertib ujian terlebih dahulu." });
      return;
    }
    const valid = EXAM_TOKENS.map((t) => t.toLowerCase()).includes(token.trim().toLowerCase());
    if (!valid) {
      toast({
        title: "Token tidak valid",
        description: `Gunakan token contoh: ${EXAM_TOKENS.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    startSession(subject);
    navigate(`/exam/${subject.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Fake SEB top bar */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-950 px-5 py-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Lock className="h-4 w-4 text-green-400" /> Safe Exam Browser — Mode Terkunci
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-green-400" /> CAT Kementerian Keuangan (Simulasi)
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-5 lg:px-8">
        {/* Left: info */}
        <div className="lg:col-span-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke daftar mata ujian
          </button>

          <span
            className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: subject.color }}
          >
            {subject.code}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">{subject.name}</h1>
          <p className="mt-2 text-slate-400">{subject.desc}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><FileText className="h-4 w-4" /> Jumlah Soal</div>
              <div className="mt-1 text-xl font-extrabold text-white">{subject.totalQuestions}</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Clock className="h-4 w-4" /> Durasi</div>
              <div className="mt-1 text-xl font-extrabold text-white">{subject.durationMin} mnt</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><CheckCircle2 className="h-4 w-4" /> Nilai Maks</div>
              <div className="mt-1 text-xl font-extrabold text-white">100</div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="h-5 w-5" /> Tata Tertib Ujian
            </div>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
              {PRE_EXAM_RULES.map((r, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: token */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Masukkan Token</div>
                <div className="text-xs text-slate-400">Dibagikan pengawas sebelum sesi dimulai</div>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-xs text-slate-400">
              <div className="font-semibold text-slate-300">Peserta</div>
              <div className="mt-0.5">{candidate ? `${candidate.name} — ${candidate.id}` : "Belum login"}</div>
            </div>

            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Masukkan token ujian"
              className="mt-4 h-12 border-slate-600 bg-slate-900 text-center text-lg font-bold uppercase tracking-widest text-white placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
            />
            <p className="mt-2 text-center text-xs text-slate-500">
              Token contoh: <span className="font-semibold text-blue-400">{EXAM_TOKENS.join(" · ")}</span>
            </p>

            <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-blue-600"
              />
              Saya memahami dan menyetujui seluruh tata tertib ujian di atas.
            </label>

            <Button
              onClick={handleStart}
              className="mt-5 h-12 w-full bg-blue-600 text-base font-bold hover:bg-blue-500"
            >
              Mulai Ujian
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" /> Timer berjalan segera setelah ujian dimulai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
