import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock, Flag, ChevronLeft, ChevronRight, Calculator as CalcIcon,
  StickyNote, Send, Lock, X, AlertTriangle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../components/ui/dialog";
import Calculator from "../components/Calculator";
import { useExam } from "../context/ExamContext";
import { SUBJECTS } from "../mock";

function fmt(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function ExamScreen() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { session, setAnswer, toggleFlag, setNotes, submitSession, candidate } = useExam();

  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [showCalc, setShowCalc] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const subject = SUBJECTS.find((s) => s.id === subjectId);

  useEffect(() => {
    if (!session || session.subject.id !== subjectId) {
      navigate(`/pre-exam/${subjectId}`, { replace: true });
    }
  }, [session, subjectId, navigate]);

  useEffect(() => {
    if (session) setRemaining(session.durationSec);
  }, [session]);

  const doSubmit = useCallback(() => {
    submitSession();
    navigate("/result");
  }, [submitSession, navigate]);

  useEffect(() => {
    if (!session || session.submitted) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          doSubmit();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [session, doSubmit]);

  const questions = session?.questions || [];
  const answers = session?.answers || {};
  const flags = session?.flags || {};
  const q = questions[current];

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const flaggedCount = useMemo(() => Object.keys(flags).length, [flags]);

  if (!session || !q) return null;

  const lowTime = remaining <= 300;

  return (
    <div className="flex min-h-screen flex-col bg-indigo-50/40">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-indigo-900 bg-indigo-950 px-4 py-2.5 text-white lg:px-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <Lock className="h-4 w-4 shrink-0 text-emerald-400" />
          <div className="overflow-hidden">
            <div className="truncate text-sm font-bold">{subject?.name}</div>
            <div className="truncate text-[11px] text-indigo-300">{candidate?.name} · {candidate?.id}</div>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-extrabold tabular-nums ${
            lowTime ? "animate-pulse bg-red-500 text-white" : "bg-indigo-900 text-amber-300"
          }`}
        >
          <Clock className="h-4 w-4" /> {fmt(remaining)}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-5 px-4 py-5 lg:px-6">
        {/* MAIN */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-500">
              Soal <span className="text-indigo-950">{current + 1}</span> dari {questions.length}
            </div>
            <button
              onClick={() => toggleFlag(q.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                flags[q.id]
                  ? "border-amber-300 bg-amber-100 text-amber-700"
                  : "border-indigo-200 bg-white text-slate-600 hover:bg-indigo-50"
              }`}
            >
              <Flag className={`h-4 w-4 ${flags[q.id] ? "fill-amber-500 text-amber-500" : ""}`} />
              {flags[q.id] ? "Ditandai" : "Tandai ragu"}
            </button>
          </div>

          <div className="mt-3 flex-1 rounded-2xl border border-indigo-100 bg-white p-6 lg:p-8">
            <p className="text-[17px] font-semibold leading-relaxed text-indigo-950">{q.q}</p>
            <div className="mt-6 space-y-3">
              {q.options.map((o) => {
                const selected = answers[q.id] === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => setAnswer(q.id, o.key)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? "border-indigo-700 bg-indigo-50 ring-1 ring-indigo-700"
                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        selected ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {o.key}
                    </span>
                    <span className={`text-[15px] ${selected ? "font-semibold text-indigo-900" : "text-slate-700"}`}>
                      {o.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* nav + tools */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={current === 0}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                className="border-indigo-200 font-semibold text-indigo-700"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Sebelumnya
              </Button>
              <Button
                disabled={current === questions.length - 1}
                onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                className="bg-indigo-700 font-semibold hover:bg-indigo-900"
              >
                Berikutnya <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCalc(true)} className="border-indigo-200 font-semibold text-indigo-700">
                <CalcIcon className="mr-1.5 h-4 w-4" /> Kalkulator
              </Button>
              <Button variant="outline" onClick={() => setShowNote(true)} className="border-indigo-200 font-semibold text-indigo-700">
                <StickyNote className="mr-1.5 h-4 w-4" /> Catatan
              </Button>
              <Button onClick={() => setMobileNav(true)} className="bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400 lg:hidden">
                Navigasi
              </Button>
            </div>
          </div>
        </main>

        {/* SIDEBAR NAVIGATOR (desktop) */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <NavigatorPanel
            questions={questions} answers={answers} flags={flags} current={current}
            answeredCount={answeredCount} flaggedCount={flaggedCount}
            onJump={(i) => setCurrent(i)} onSubmit={() => setShowSubmit(true)}
          />
        </aside>
      </div>

      {/* CALCULATOR DIALOG */}
      <Dialog open={showCalc} onOpenChange={setShowCalc}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Kalkulator</DialogTitle>
          </DialogHeader>
          <Calculator />
        </DialogContent>
      </Dialog>

      {/* NOTE DIALOG */}
      <Dialog open={showNote} onOpenChange={setShowNote}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Catatan</DialogTitle>
            <DialogDescription>Gunakan untuk coretan selama mengerjakan soal (tidak dinilai).</DialogDescription>
          </DialogHeader>
          <Textarea
            value={session.notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis catatan Anda di sini..."
            className="min-h-[220px] resize-none"
          />
        </DialogContent>
      </Dialog>

      {/* MOBILE NAVIGATOR */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-indigo-950/50" onClick={() => setMobileNav(false)} />
          <div className="relative ml-auto h-full w-80 max-w-[85%] overflow-y-auto bg-indigo-50/60 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-indigo-950">Navigasi Soal</span>
              <button onClick={() => setMobileNav(false)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <NavigatorPanel
              questions={questions} answers={answers} flags={flags} current={current}
              answeredCount={answeredCount} flaggedCount={flaggedCount}
              onJump={(i) => { setCurrent(i); setMobileNav(false); }}
              onSubmit={() => { setMobileNav(false); setShowSubmit(true); }}
            />
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRM */}
      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Kirim & Selesai?
            </DialogTitle>
            <DialogDescription>
              Setelah dikirim, jawaban <b>terkunci</b> dan tidak dapat diubah lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-indigo-50 p-4 text-center">
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">{answeredCount}</div>
              <div className="text-xs font-medium text-slate-500">Terjawab</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-400">{questions.length - answeredCount}</div>
              <div className="text-xs font-medium text-slate-500">Belum</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-500">{flaggedCount}</div>
              <div className="text-xs font-medium text-slate-500">Ditandai</div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setShowSubmit(false)} className="border-indigo-200 font-semibold text-indigo-700">
              Periksa lagi
            </Button>
            <Button onClick={doSubmit} className="bg-indigo-700 font-bold hover:bg-indigo-900">
              <Send className="mr-1.5 h-4 w-4" /> Kirim & Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NavigatorPanel({ questions, answers, flags, current, answeredCount, flaggedCount, onJump, onSubmit }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5">
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 py-2">
          <div className="text-lg font-extrabold text-emerald-600">{answeredCount}</div>
          <div className="text-[10px] font-semibold text-slate-500">Terjawab</div>
        </div>
        <div className="rounded-lg bg-slate-50 py-2">
          <div className="text-lg font-extrabold text-slate-400">{questions.length - answeredCount}</div>
          <div className="text-[10px] font-semibold text-slate-500">Belum</div>
        </div>
        <div className="rounded-lg bg-amber-50 py-2">
          <div className="text-lg font-extrabold text-amber-500">{flaggedCount}</div>
          <div className="text-[10px] font-semibold text-slate-500">Ragu</div>
        </div>
      </div>

      <div className="grid max-h-[46vh] grid-cols-6 gap-1.5 overflow-y-auto pr-1 lg:grid-cols-5">
        {questions.map((qq, i) => {
          const answered = answers[qq.id];
          const flagged = flags[qq.id];
          const isCurrent = i === current;
          return (
            <button
              key={qq.id}
              onClick={() => onJump(i)}
              className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                isCurrent ? "ring-2 ring-indigo-700 ring-offset-1" : ""
              } ${
                flagged
                  ? "bg-amber-400 text-indigo-950"
                  : answered
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-500" /> Terjawab</div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-400" /> Ditandai ragu</div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-slate-100 ring-1 ring-slate-200" /> Belum dijawab</div>
      </div>

      <Button onClick={onSubmit} className="mt-5 h-11 w-full bg-indigo-700 font-bold hover:bg-indigo-900">
        <Send className="mr-1.5 h-4 w-4" /> Kirim & Selesai
      </Button>
    </div>
  );
}
