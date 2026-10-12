import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, Lock, KeyRound, ArrowLeft, Loader2, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useExam } from "../context/ExamContext";
import { INTEGRITY_PACT, EXAM_PROHIBITIONS, EXAM_TOKENS } from "../mock";
import { getSubject } from "../api";
import ExamDetailTable from "../components/preexam/ExamDetailTable";
import CameraPreview from "../components/preexam/CameraPreview";
import ExamGuide from "../components/preexam/ExamGuide";

export default function PreExam() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { candidate, session, startSession } = useExam();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [agree, setAgree] = useState(false);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("detail");
  const [starting, setStarting] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const resumable = session && !session.submitted && session.subject.id === subjectId && session.deadlineMs > Date.now();

  useEffect(() => {
    getSubject(subjectId).then(setSubject).catch(() => setSubject(null)).finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-indigo-950 text-indigo-200"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat...</div>;
  if (!subject) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-indigo-950 text-white">
        Mata ujian tidak ditemukan.
        <Button onClick={() => navigate("/dashboard")} className="bg-amber-500 text-indigo-950 hover:bg-amber-400">Kembali</Button>
      </div>
    );
  }

  const checkToken = () => {
    if (!agree) return toast({ title: "Pakta Integritas belum disetujui", description: "Baca dan centang persetujuan Pakta Integritas terlebih dahulu." });
    if (!EXAM_TOKENS.includes(token.trim().toUpperCase())) {
      return toast({ title: "Token tidak valid", description: `Token latihan: ${EXAM_TOKENS[0]}`, variant: "destructive" });
    }
    setStep("guide");
  };

  const begin = async () => {
    try {
      setStarting(true);
      await startSession(subject);
      navigate(`/exam/${subject.id}`);
    } catch {
      toast({ title: "Gagal memulai ujian", description: "Periksa koneksi lalu coba lagi.", variant: "destructive" });
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-indigo-100">
      <div className="flex items-center justify-between border-b border-indigo-800 bg-[#15123A] px-5 py-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-indigo-200"><Lock className="h-4 w-4 text-emerald-400" /> Mode Ujian · {candidate ? `${candidate.name} — ${candidate.id}` : "Belum login"}</div>
        <div className="hidden items-center gap-2 text-xs text-indigo-400 sm:flex"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Simulasi Ujian Kompetensi Pajak</div>
      </div>

      {step === "guide" ? (
        <div className="px-5 py-10"><ExamGuide subject={subject} starting={starting} onContinue={begin} onBack={() => setStep("detail")} /></div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-5 lg:px-8">
          <div className="space-y-6 lg:col-span-3">
            <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Kembali ke daftar mata ujian
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: subject.color }}>{subject.code}</span>
                <span data-testid="pre-exam-level" className="inline-flex rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-bold text-indigo-950">Tingkat {subject.level || "A"}</span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{subject.name}</h1>
            </div>
            <ExamDetailTable subject={subject} />

            <div data-testid="integrity-pact" className="rounded-xl border border-indigo-800 bg-indigo-900/50 p-5">
              <div className="font-extrabold text-white">Pakta Integritas</div>
              <p className="mt-1 text-xs text-indigo-300">Dengan mengikuti simulasi ini, saya menyatakan:</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-indigo-100">{INTEGRITY_PACT.map((t) => <li key={t}>{t}</li>)}</ol>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm font-semibold text-amber-200">
                <input data-testid="integrity-agree-checkbox" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-500" />
                Saya telah membaca dan menyetujui Pakta Integritas.
              </label>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
              <button data-testid="toggle-prohibitions" onClick={() => setShowRules((v) => !v)} className="flex w-full items-center justify-between font-bold text-amber-300">
                <span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Larangan pada ujian sesungguhnya</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showRules ? "rotate-180" : ""}`} />
              </button>
              {showRules && <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-indigo-200">{EXAM_PROHIBITIONS.map((t) => <li key={t}>{t}</li>)}</ul>}
            </div>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <CameraPreview />
            <div className="rounded-2xl border border-indigo-800 bg-indigo-900 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400"><KeyRound className="h-5 w-5" /></div>
                <div>
                  <div className="text-sm font-bold text-white">Masukkan Token</div>
                  <div className="text-xs text-indigo-300">Pada ujian sesungguhnya token dibacakan pengawas sesaat sebelum ujian dimulai serentak.</div>
                </div>
              </div>
              {resumable ? (
                <Button data-testid="resume-exam-button" onClick={() => navigate(`/exam/${subject.id}`)} className="mt-5 h-12 w-full bg-emerald-600 font-bold hover:bg-emerald-700">Lanjutkan Ujian yang Sedang Berjalan</Button>
              ) : (
                <>
                  <Input data-testid="token-input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="masukkan token"
                    className="mt-5 h-12 border-indigo-700 bg-indigo-950 text-center text-lg font-bold uppercase tracking-widest text-white placeholder:text-sm placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-indigo-500" />
                  <p className="mt-2 text-center text-xs text-indigo-400">Token latihan: <span className="font-bold text-amber-400">{EXAM_TOKENS[0]}</span></p>
                  <Button data-testid="start-exam-button" onClick={checkToken} className="mt-5 h-12 w-full bg-amber-500 text-base font-extrabold uppercase text-indigo-950 hover:bg-amber-400">Mulai Ujian</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
