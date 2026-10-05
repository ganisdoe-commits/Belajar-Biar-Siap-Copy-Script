import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, XCircle, MinusCircle, RotateCcw, LayoutDashboard, Trophy, BookOpen,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useExam } from "../context/ExamContext";

export default function ResultScreen() {
  const navigate = useNavigate();
  const { session, startSession, clearSession } = useExam();
  const [tab, setTab] = useState("ringkasan");

  if (!session || !session.submitted || !session.result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-5 text-center">
        <p className="text-slate-600">Belum ada hasil ujian untuk ditampilkan.</p>
        <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
          Ke Dashboard
        </Button>
      </div>
    );
  }

  const r = session.result;
  const { questions, answers } = session;

  const retake = () => {
    const subj = session.subject;
    clearSession();
    startSession(subj);
    navigate(`/exam/${subj.id}`);
  };

  const circ = 2 * Math.PI * 54;
  const dash = (r.score / 100) * circ;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* header */}
      <div className={`${r.passed ? "bg-green-600" : "bg-slate-800"} px-5 py-10 text-white`}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
            {r.passed ? "Selamat, Anda Lulus!" : "Terus Berlatih, Hampir Sampai!"}
          </h1>
          <p className="mt-1.5 text-sm text-white/80">{r.subjectName}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        {/* score card */}
        <div className="-mt-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 lg:p-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
            <div className="relative h-36 w-36">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={r.passed ? "#16a34a" : "#2563eb"} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${dash} ${circ}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-900">{r.score}</span>
                <span className="text-xs font-semibold text-slate-400">dari 100</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">{r.correct}</div>
                <div className="text-xs font-medium text-slate-500">Benar</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-red-500"><XCircle className="h-5 w-5" /></div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">{r.wrong}</div>
                <div className="text-xs font-medium text-slate-500">Salah</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-slate-400"><MinusCircle className="h-5 w-5" /></div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">{r.unanswered}</div>
                <div className="text-xs font-medium text-slate-500">Kosong</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={retake} variant="outline" className="border-slate-300 font-semibold">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Ulangi Latihan
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 font-semibold hover:bg-blue-700">
              <LayoutDashboard className="mr-1.5 h-4 w-4" /> Kembali ke Dashboard
            </Button>
          </div>
        </div>

        {/* tabs */}
        <div className="mt-8 flex gap-2 border-b border-slate-200">
          {[
            { k: "ringkasan", label: "Review Jawaban" },
            { k: "pembahasan", label: "Pembahasan" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                tab === t.k ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {questions.map((q, i) => {
            const picked = answers[q.id];
            const correct = picked === q.answer;
            return (
              <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold leading-relaxed text-slate-900">{q.q}</p>

                    <div className="mt-3 space-y-2">
                      {q.options.map((o) => {
                        const isAnswer = o.key === q.answer;
                        const isPicked = o.key === picked;
                        let cls = "border-slate-200 bg-white text-slate-600";
                        if (isAnswer) cls = "border-green-300 bg-green-50 text-green-800";
                        else if (isPicked && !correct) cls = "border-red-300 bg-red-50 text-red-800";
                        return (
                          <div key={o.key} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`}>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/70 text-xs font-bold">
                              {o.key}
                            </span>
                            <span className="flex-1">{o.text}</span>
                            {isAnswer && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {isPicked && !correct && <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        );
                      })}
                    </div>

                    {!picked && (
                      <p className="mt-2 text-xs font-semibold text-slate-400">Tidak dijawab</p>
                    )}

                    {tab === "pembahasan" && (
                      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
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
