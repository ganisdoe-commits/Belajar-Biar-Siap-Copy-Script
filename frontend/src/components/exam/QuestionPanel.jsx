import React from "react";
import { ChevronLeft, ChevronRight, Flag, StickyNote, Sheet, Calculator as CalcIcon } from "lucide-react";
import { Button } from "../ui/button";

const Tool = ({ icon: Icon, label, onClick, testid }) => (
  <button data-testid={testid} onClick={onClick} title={label}
    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50">
    <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
  </button>
);

export default function QuestionPanel({ q, index, total, selected, flagged, onSelect, onFlag, onPrev, onNext, onTool }) {
  return (
    <div data-testid="question-panel" className="flex h-full flex-col rounded-xl border border-indigo-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 px-5 py-3">
        <div className="text-sm font-extrabold text-indigo-950">Soal No. <span data-testid="current-question-number">{index + 1}</span> <span className="font-semibold text-slate-400">/ {total}</span></div>
        <div className="flex gap-1.5">
          <Tool testid="tool-note" icon={StickyNote} label="Note" onClick={() => onTool("note")} />
          <Tool testid="tool-worksheet" icon={Sheet} label="Lembar Kerja" onClick={() => onTool("sheet")} />
          <Tool testid="tool-calculator" icon={CalcIcon} label="Kalkulator" onClick={() => onTool("calc")} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 lg:px-7">
        <p data-testid="question-text" className="whitespace-pre-line text-[16px] font-medium leading-relaxed text-indigo-950">{q.question}</p>
        <div className="mt-6 space-y-2.5">
          {q.options.map((o) => {
            const on = selected === o.key;
            return (
              <button key={o.key} data-testid={`option-${o.key}`} onClick={() => onSelect(o.key)}
                className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${on ? "border-indigo-700 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"}`}>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-indigo-700" : "border-slate-400"}`}>
                  {on && <span className="h-2.5 w-2.5 rounded-full bg-indigo-700" />}
                </span>
                <span className="font-bold text-slate-700">{o.key}.</span>
                <span className={`text-[15px] ${on ? "font-semibold text-indigo-950" : "text-slate-700"}`}>{o.text}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-indigo-100 px-5 py-3">
        <Button data-testid="prev-question-button" variant="outline" disabled={index === 0} onClick={onPrev} className="border-indigo-200 font-bold uppercase text-indigo-700">
          <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
        </Button>
        <Button data-testid="flag-question-button" onClick={onFlag}
          className={`font-bold uppercase ${flagged ? "bg-red-500 text-white hover:bg-red-600" : "bg-amber-400 text-indigo-950 hover:bg-amber-300"}`}>
          <Flag className={`mr-1.5 h-4 w-4 ${flagged ? "fill-white" : ""}`} /> {flagged ? "Batal Tandai" : "Tandai"}
        </Button>
        <Button data-testid="next-question-button" disabled={index === total - 1} onClick={onNext} className="bg-indigo-700 font-bold uppercase hover:bg-indigo-900">
          Lanjut <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
