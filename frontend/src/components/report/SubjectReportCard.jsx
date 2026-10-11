import React, { useState } from "react";
import { ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import MateriBars from "./MateriBars";

const Mini = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
    <div className="text-lg font-extrabold text-indigo-950">{value}</div>
  </div>
);

export default function SubjectReportCard({ s }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid={`subject-report-${s.subject_id}`} className="rounded-2xl border border-indigo-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: s.color }}>{s.code}</span>
          <h3 className="mt-2 font-bold text-indigo-950">{s.subject_name}</h3>
          <div className="text-xs text-slate-500">Terakhir: {new Date(s.last_date).toLocaleDateString("id-ID")}</div>
        </div>
        {s.passed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Pernah lulus</span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"><XCircle className="h-3.5 w-3.5" /> Belum lulus</span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        <Mini label="Percobaan" value={s.attempts} />
        <Mini label="Terbaik" value={s.best} />
        <Mini label="Rata-rata" value={s.avg} />
        <Mini label="Terakhir" value={s.last} />
      </div>
      {s.materi.length > 0 ? (
        <>
          <button data-testid={`toggle-materi-${s.subject_id}`} onClick={() => setOpen((o) => !o)} className="mt-4 flex items-center gap-1 text-sm font-bold text-indigo-700 hover:text-indigo-900">
            Rincian per materi ({s.materi.length}) <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && <div className="mt-4"><MateriBars items={s.materi} testid={`materi-bars-${s.subject_id}`} /></div>}
        </>
      ) : (
        <p className="mt-4 text-xs text-slate-400">Rincian per materi belum tersedia untuk mata ujian ini.</p>
      )}
    </div>
  );
}
