import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, X, AlertTriangle, Send, BookOpen, ListChecks, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import Calculator from "../components/Calculator";
import WorkSheet from "../components/exam/WorkSheet";
import QuestionPanel from "../components/exam/QuestionPanel";
import NavigatorPanel from "../components/exam/NavigatorPanel";
import ExtraContent from "../components/exam/ExtraContent";
import RegulationViewer from "../components/exam/RegulationViewer";
import { useExam } from "../context/ExamContext";
import { useToast } from "../hooks/use-toast";
import { getSubjectRegulations } from "../api";

const fmt = (sec) => [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((n) => String(n).padStart(2, "0")).join(":");
const AUTOSAVE_MS = 60000;

const Drawer = ({ title, onClose, children, side = "right" }) => (
  <div className="fixed inset-0 z-50 flex lg:hidden">
    <div className="absolute inset-0 bg-indigo-950/50" onClick={onClose} />
    <div className={`relative h-full w-80 max-w-[88%] overflow-y-auto bg-indigo-50 p-3 shadow-2xl ${side === "right" ? "ml-auto" : ""}`}>
      <div className="mb-3 flex items-center justify-between"><span className="font-bold text-indigo-950">{title}</span><button onClick={onClose}><X className="h-5 w-5 text-slate-500" /></button></div>
      {children}
    </div>
  </div>
);

export default function ExamScreen() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, setAnswer, toggleFlag, setNotes, setSheet, syncSession, submitSession, candidate } = useExam();
  const [current, setCurrent] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [tool, setTool] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [docs, setDocs] = useState([]);
  const [openDoc, setOpenDoc] = useState(null);
  const autoSubmitted = useRef(false);

  const valid = session && session.subject.id === subjectId;
  useEffect(() => {
    if (!valid) navigate(`/pre-exam/${subjectId}`, { replace: true });
    else if (session.submitted) navigate("/selesai", { replace: true });
  }, [valid, session, subjectId, navigate]);

  useEffect(() => { getSubjectRegulations(subjectId).then(setDocs).catch(() => setDocs([])); }, [subjectId]);

  const doSubmit = useCallback(async (auto = false) => {
    try {
      setSubmitting(true);
      await submitSession();
      navigate("/selesai");
    } catch (e) {
      setSubmitting(false);
      if (e?.response?.status === 409) { navigate("/dashboard"); return; }
      autoSubmitted.current = false;
      toast({ title: auto ? "Waktu habis — menunggu koneksi" : "Gagal mengirim jawaban", description: "Jawaban tetap tersimpan di perangkat. Periksa koneksi internet lalu coba lagi.", variant: "destructive" });
    }
  }, [submitSession, navigate, toast]);

  const sync = useCallback(() => syncSession().then(() => setOnline(true)).catch(() => setOnline(false)), [syncSession]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const save = setInterval(sync, AUTOSAVE_MS);
    const on = () => { setOnline(true); sync(); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { clearInterval(tick); clearInterval(save); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [sync]);

  const remaining = valid ? Math.max(0, Math.round((session.deadlineMs - now) / 1000)) : 0;
  useEffect(() => {
    if (valid && !session.submitted && remaining === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      doSubmit(true);
    }
  }, [valid, session, remaining, doSubmit]);

  if (!valid || session.submitted) return null;
  const { questions, answers, flags } = session;
  const q = questions[current];
  const unanswered = questions.filter((x) => !answers[x.id]).length;
  const navProps = { questions, answers, flags, current, online, savedAt: session.savedAt };

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="z-30 flex h-[52px] shrink-0 items-center justify-between gap-3 bg-indigo-950 px-4 text-white lg:px-6">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{session.subject.name}</div>
          <div className="truncate text-[11px] text-indigo-300">Simulasi CAT · Tingkat {session.subject.level || "A"} · {candidate?.name}</div>
        </div>
        <div data-testid="exam-timer" className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-extrabold tabular-nums ${remaining <= 300 ? "animate-pulse bg-red-500" : "bg-indigo-900 text-amber-300"}`}>
          <Clock className="h-4 w-4" /> <span className="hidden sm:inline text-[11px] font-semibold uppercase">Sisa Waktu</span> {fmt(remaining)}
        </div>
      </header>

      <div className="flex shrink-0 gap-2 border-b border-indigo-100 bg-white px-3 py-2 lg:hidden">
        <Button data-testid="mobile-extra-content" size="sm" variant="outline" onClick={() => setDrawer("extra")} className="flex-1 border-indigo-200 text-indigo-700"><BookOpen className="mr-1 h-4 w-4" /> Ekstra Konten</Button>
        <Button data-testid="mobile-navigator" size="sm" onClick={() => setDrawer("nav")} className="flex-1 bg-indigo-700"><ListChecks className="mr-1 h-4 w-4" /> Navigasi</Button>
      </div>

      <div className="mx-auto grid min-h-0 w-full max-w-[1500px] flex-1 gap-4 p-3 lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:p-4">
        <aside className="hidden min-h-0 overflow-y-auto lg:block"><ExtraContent docs={docs} onOpen={setOpenDoc} /></aside>
        <main className="min-h-0">
          <QuestionPanel q={q} index={current} total={questions.length} selected={answers[q.id]} flagged={!!flags[q.id]}
            onSelect={(k) => setAnswer(q.id, k)} onFlag={() => toggleFlag(q.id)}
            onPrev={() => setCurrent((c) => Math.max(0, c - 1))} onNext={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            onTool={setTool} />
        </main>
        <aside className="hidden min-h-0 overflow-y-auto lg:block"><NavigatorPanel {...navProps} onJump={setCurrent} onSubmit={() => setShowSubmit(true)} /></aside>
      </div>

      {drawer === "extra" && <Drawer side="left" title="Ekstra Konten" onClose={() => setDrawer(null)}><ExtraContent docs={docs} onOpen={(d) => { setDrawer(null); setOpenDoc(d); }} /></Drawer>}
      {drawer === "nav" && (
        <Drawer title="Navigasi Soal" onClose={() => setDrawer(null)}>
          <NavigatorPanel {...navProps} onJump={(i) => { setCurrent(i); setDrawer(null); }} onSubmit={() => { setDrawer(null); setShowSubmit(true); }} />
        </Drawer>
      )}
      {openDoc && <RegulationViewer doc={openDoc} onClose={() => setOpenDoc(null)} />}

      <Dialog open={tool === "calc"} onOpenChange={(o) => !o && setTool(null)}>
        <DialogContent className="max-w-xs"><DialogHeader><DialogTitle>Kalkulator</DialogTitle></DialogHeader><Calculator /></DialogContent>
      </Dialog>
      <Dialog open={tool === "note"} onOpenChange={(o) => !o && setTool(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Note</DialogTitle><DialogDescription>Coretan selama mengerjakan soal (tidak dinilai).</DialogDescription></DialogHeader>
          <Textarea data-testid="note-textarea" value={session.notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tulis catatan Anda di sini..." className="min-h-[240px] resize-none" />
        </DialogContent>
      </Dialog>
      <Dialog open={tool === "sheet"} onOpenChange={(o) => !o && setTool(null)}>
        <DialogContent className="flex h-[85vh] max-w-6xl flex-col">
          <DialogHeader><DialogTitle>Lembar Kerja</DialogTitle><DialogDescription>Pengganti kertas buram — hitung dengan sel dan rumus seperti Excel.</DialogDescription></DialogHeader>
          <div className="min-h-0 flex-1"><WorkSheet cells={session.sheet || {}} onChange={setSheet} /></div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent data-testid="submit-confirm-dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Kirim & Selesai?</DialogTitle>
            <DialogDescription>Jawaban yang telah terkirim <b>terkunci</b> oleh sistem dan tidak dapat diakses kembali.</DialogDescription>
          </DialogHeader>
          {unanswered > 0 && (
            <div data-testid="submit-unanswered-warning" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Masih ada <b>{unanswered} soal</b> belum terjawab. Pada ujian sesungguhnya, tombol ini hanya ditekan bila seluruh soal telah selesai dikerjakan.
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setShowSubmit(false)} className="border-indigo-200 font-semibold text-indigo-700">Periksa lagi</Button>
            <Button data-testid="confirm-submit-button" disabled={submitting} onClick={() => doSubmit(false)} className="bg-emerald-700 font-bold hover:bg-emerald-800">
              {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />} Kirim & Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
