import React from "react";

const tone = (p) => (p < 60 ? { bar: "bg-red-500", text: "text-red-700" } : p < 75 ? { bar: "bg-amber-500", text: "text-orange-700" } : { bar: "bg-emerald-600", text: "text-emerald-700" });

export const pctOf = (m) => (m.pct !== undefined ? m.pct : m.total ? Math.round((m.correct / m.total) * 100) : 0);

export default function MateriBars({ items, showSubject = false, testid = "materi-bars" }) {
  return (
    <ul data-testid={testid} className="space-y-3">
      {items.map((m, i) => {
        const p = pctOf(m);
        const t = tone(p);
        return (
          <li key={`${m.materi}-${i}`}>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 font-semibold text-slate-700">
                {m.materi}
                {showSubject && m.subject_name && <span className="block text-xs font-normal text-slate-400">{m.subject_name}</span>}
              </span>
              <span className={`shrink-0 font-bold ${t.text}`}>{p}% <span className="text-xs font-medium text-slate-400">({m.correct}/{m.total})</span></span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-indigo-50">
              <div className={`h-full rounded-full ${t.bar} transition-[width] duration-700`} style={{ width: `${Math.max(p, 3)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
