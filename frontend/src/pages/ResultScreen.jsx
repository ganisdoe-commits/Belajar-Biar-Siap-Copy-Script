import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, XCircle, MinusCircle, RotateCcw, LayoutDashboard, Trophy, BookOpen, Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useExam } from "../context/ExamContext";
import MateriBars, { pctOf } from "../components/report/MateriBars";

export default function ResultScreen() {
  const navigate = useNavigate();
  const { session, startSession, clearSession } = useExam();
  const [tab, setTab] = useState("ringkasan");
  const [retaking, setRetaking] = useState(false);

  if (!session || !session.submitted || !session.result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFEFB] px-5 text-center">
        <p className="text-slate-600">Belum ada hasil ujian untuk ditampilkan.</p>
        <Button onClick={() => navigate("/dashboard")} className="bg-indigo-700 hover:bg-indigo-900">
          Ke Dashboard
        </Button>
      </div>
    );
  }

  const r = session.result;
  const review = session.review || [];
  const subject = session.subject;

  const retake = async () => {
    try {
      setRetaking(true);
      const subj = subject;
      clearSession();
      await startSession(subj);
      navigate(`/exam/${subj.id}`);
    } catch (e) {
      setRetaking(false);
    }
  };

  const circ = 2 * Math.PI * 54;
  const dash = (r.score / 100) * circ;

  return (
    <div className="min-h-screen bg-[#FFFEFB]">
      <div className={`${r.passed ? "bg-emerald-600" : "bg-indigo-900"} px-5 py-10 text-white`}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
            {r.passed ? "Selamat, Anda Lulus!" : "Terus Berlatih, Hampir Sampai!"}
          </h1>
          <p className="mt-1.5 text-sm text-white/80">Tingkat {r.level || "A"} · {r.subject_name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        <div className="-mt-16 rounded-2xl border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-900/5 lg:p-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
            <div className="relative h-36 w-36">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7f0" strokeWidth="10" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={r.passed ? "#059669" : "#4338CA"} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-indigo-950">{r.score}</span>
                <span className="text-xs font-semibold text-slate-400">dari 100</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 text-center">
              <div>
                <div className="flex items-center justify-center text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
                <div className="mt-1 text-2xl font-extrabold text-indigo-950">{r.correct}</div>
                <div className="text-xs font-medium text-slate-500">Benar</div>
              </div>
              <div>
                <div className="flex items-center justify-center text-red-500"><XCircle className="h-5 w-5" /></div>
                <div className="mt-1 text-2xl font-extrabold text-indigo-950">{r.wrong}</div>
                <div className="text-xs font-medium text-slate-500">Salah</div>
              </div>
              <div>
                <div className="flex items-center justify-center text-slate-400"><MinusCircle className="h-5 w-5" /></div>
                <div className="mt-1 text-2xl font-extrabold text-indigo-950">{r.unanswered}</div>
                <div className="text-xs font-medium text-slate-500">Kosong</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={retake} disabled={retaking} className="bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400">
              {retaking ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-1.5 h-4 w-4" />} Ulangi Latihan
            </Button>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="border-indigo-200 font-semibold text-indigo-700">
              <LayoutDashboard className="mr-1.5 h-4 w-4" /> Kembali ke Dashboard
            </Button>
          </div>
        </div>

        {r.materi_stats?.length > 0 && (
          <div data-testid="result-materi" className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6">
            <h2 className="text-lg font-extrabold text-indigo-950">Hasil per Materi</h2>
            <p className="mt-1 text-sm text-slate-500">Diurutkan dari yang paling lemah. Lihat rapor untuk akumulasi semua percobaan.</p>
            <div className="mt-5">
              <MateriBars items={[...r.materi_stats].sort((a, b) => pctOf(a) - pctOf(b))} testid="result-materi-bars" />
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-2 border-b border-indigo-100">
          {[{ k: "ringkasan", label: "Review Jawaban" }, { k: "pembahasan", label: "Pembahasan" }].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${tab === t.k ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-500 hover:text-indigo-900"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {review.map((q, i) => {
            const picked = q.selected;
            const correct = q.is_correct;
            return (
              <div key={q.id + "-" + i} className="rounded-2xl border border-indigo-100 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold leading-relaxed text-indigo-950">{q.question}</p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((o) => {
                        const isAnswer = o.key === q.answer;
                        const isPicked = o.key === picked;
                        let cls = "border-slate-200 bg-white text-slate-600";
                        if (isAnswer) cls = "border-emerald-300 bg-emerald-50 text-emerald-800";
                        else if (isPicked && !correct) cls = "border-red-300 bg-red-50 text-red-800";
                        return (
                          <div key={o.key} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`}>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/70 text-xs font-bold">{o.key}</span>
                            <span className="flex-1">{o.text}</span>
                            {isAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                            {isPicked && !correct && <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        );
                      })}
                    </div>
                    {!picked && <p className="mt-2 text-xs font-semibold text-slate-400">Tidak dijawab</p>}
                    {tab === "pembahasan" && q.pembahasan && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-[#FFF8E9] p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                          <BookOpen className="h-4 w-4" /> Pembahasan
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{q.pembahasan}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
