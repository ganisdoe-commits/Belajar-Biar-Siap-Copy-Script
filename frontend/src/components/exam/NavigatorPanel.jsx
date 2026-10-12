import React from "react";
import { Send, Flag, Wifi, WifiOff, CloudCheck } from "lucide-react";
import { Button } from "../ui/button";

const Stat = ({ color, label, value, testid }) => (
  <div className="flex items-center justify-between text-[13px]">
    <span className="flex items-center gap-2 text-slate-600"><span className={`h-3.5 w-3.5 rounded ${color}`} /> {label}</span>
    <span data-testid={testid} className="font-extrabold text-indigo-950">{value}</span>
  </div>
);

export default function NavigatorPanel({ questions, answers, flags, current, online, savedAt, onJump, onSubmit }) {
  const answered = questions.filter((q) => answers[q.id]).length;
  const flagged = questions.filter((q) => flags[q.id]).length;
  return (
    <div data-testid="navigator-panel" className="rounded-xl border border-indigo-100 bg-white">
      <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-950 px-4 py-2.5 text-white">
        <span className="text-xs font-extrabold uppercase tracking-wider">Navigasi</span>
        <span data-testid="online-status" className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${online ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} {online ? "online" : "offline"}
        </span>
      </div>
      <div className="p-4">
        <div className="grid max-h-[40vh] grid-cols-5 gap-1.5 overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <button key={q.id} data-testid={`nav-question-${i + 1}`} onClick={() => onJump(i)}
              className={`relative flex h-9 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                i === current ? "ring-2 ring-amber-500 ring-offset-1" : ""
              } ${answers[q.id] ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-indigo-50"}`}>
              {i + 1}
              {flags[q.id] && <Flag className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-red-500 text-red-500" />}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Statistik</div>
          <Stat testid="stat-answered" color="bg-indigo-700" label="Soal terjawab" value={answered} />
          <Stat testid="stat-unanswered" color="border border-slate-300 bg-white" label="Belum terjawab" value={questions.length - answered} />
          <Stat testid="stat-flagged" color="bg-red-500" label="Ditandai (ragu)" value={flagged} />
        </div>
        <div data-testid="autosave-status" className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
          <CloudCheck className="h-3.5 w-3.5 text-emerald-600" />
          {savedAt ? `Tersimpan otomatis ke server pukul ${new Date(savedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : "Simpan otomatis setiap 1 menit"}
          {!online && " · disimpan di perangkat"}
        </div>
        <Button data-testid="submit-exam-button" onClick={onSubmit} className="mt-4 h-11 w-full bg-emerald-700 font-extrabold uppercase tracking-wide hover:bg-emerald-800">
          <Send className="mr-1.5 h-4 w-4" /> Kirim & Selesai
        </Button>
      </div>
    </div>
  );
}
