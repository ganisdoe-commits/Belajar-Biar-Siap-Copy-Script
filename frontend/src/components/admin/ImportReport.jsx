import React from "react";
import { AlertTriangle, CheckCircle2, Info, FileText } from "lucide-react";

const Stat = ({ label, valid, total, testid }) => (
  <div data-testid={testid} className="rounded-xl border border-indigo-100 bg-white p-4">
    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-extrabold text-indigo-950">{valid}<span className="text-base font-semibold text-slate-400"> / {total}</span></div>
    <div className={`text-xs font-semibold ${valid === total ? "text-emerald-700" : "text-orange-600"}`}>{valid === total ? "Semua valid" : `${total - valid} bermasalah, tidak disimpan`}</div>
  </div>
);

const Notes = ({ items, tone, testid }) => {
  if (!items.length) return null;
  const err = tone === "error";
  return (
    <div data-testid={testid} className={`rounded-xl border p-4 ${err ? "border-red-200 bg-red-50" : "border-amber-200 bg-[#FFF3D6]/60"}`}>
      <div className={`flex items-center gap-1.5 text-sm font-bold ${err ? "text-red-700" : "text-orange-700"}`}>
        {err ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
        {err ? `${items.length} soal bermasalah (tidak akan disimpan)` : `${items.length} catatan`}
      </div>
      <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-sm text-slate-700">
        {items.map((it, i) => (
          <li key={i}>{it.type}{it.number ? ` ${it.number}` : ""}: {it.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default function ImportReport({ report }) {
  const r = report;
  const ok = !r.issues.length && !r.warnings.length;
  return (
    <div data-testid="import-report" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <FileText className="h-4 w-4 text-indigo-500" />
        <span className="font-semibold text-indigo-950">{r.filename}</span>
        {r.meta.level && <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-bold text-indigo-950">Tingkat {r.meta.level}</span>}
        {r.meta.name && <span className="text-slate-500">· {r.meta.name}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat testid="import-mcq-count" label="Pilihan ganda" valid={r.mcq_valid} total={r.mcq_total} />
        <Stat testid="import-essay-count" label="Esai" valid={r.essay_valid} total={r.essay_total} />
        <div className="rounded-xl border border-indigo-100 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Materi / bab</div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-950">{r.materi.length}</div>
          <div className="text-xs text-slate-500">{r.key_table_found ? "Kunci dicek dgn tabel ringkasan" : "Tabel kunci tidak ditemukan"}</div>
        </div>
      </div>
      {ok && (
        <div data-testid="import-all-ok" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> Tidak ada soal bermasalah. File siap disimpan.
        </div>
      )}
      <Notes testid="import-issues" items={r.issues} tone="error" />
      <Notes testid="import-warnings" items={r.warnings} tone="warn" />
      {r.materi.length > 0 && (
        <details className="rounded-xl border border-indigo-100 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-bold text-indigo-950">Daftar materi ({r.materi.length})</summary>
          <ul className="mt-2 space-y-1 text-slate-600">
            {r.materi.map((m) => <li key={m.name}>{m.name} — <b>{m.count}</b> soal</li>)}
          </ul>
        </details>
      )}
      {r.sample && (
        <details className="rounded-xl border border-indigo-100 bg-white p-4 text-sm">
          <summary className="cursor-pointer font-bold text-indigo-950">Contoh soal no. {r.sample.number}</summary>
          <p className="mt-2 text-slate-700">{r.sample.question}</p>
          <ul className="mt-2 space-y-1">
            {Object.entries(r.sample.options).map(([k, v]) => (
              <li key={k} className={k === r.sample.answer ? "font-semibold text-emerald-700" : "text-slate-600"}>{k}. {v}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
