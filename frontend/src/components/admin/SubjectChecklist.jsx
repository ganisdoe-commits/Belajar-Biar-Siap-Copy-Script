import React from "react";

export default function SubjectChecklist({ subjects, value, onChange }) {
  const set = new Set(value);
  const toggle = (id) => { set.has(id) ? set.delete(id) : set.add(id); onChange([...set]); };
  const toggleLevel = (ids, all) => { ids.forEach((id) => (all ? set.delete(id) : set.add(id))); onChange([...set]); };
  const levels = ["A", "B", "C"].map((l) => ({ l, items: subjects.filter((s) => (s.level || "A") === l) })).filter((g) => g.items.length);

  return (
    <div data-testid="subject-checklist" className="space-y-3">
      <div className="flex gap-2 text-xs">
        <button type="button" data-testid="checklist-all" onClick={() => onChange(subjects.map((s) => s.id))} className="rounded-md border border-indigo-200 px-2.5 py-1 font-semibold text-indigo-700 hover:bg-indigo-50">Pilih semua</button>
        <button type="button" data-testid="checklist-none" onClick={() => onChange([])} className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50">Kosongkan</button>
      </div>
      {levels.map(({ l, items }) => {
        const ids = items.map((s) => s.id);
        const all = ids.every((id) => set.has(id));
        return (
          <div key={l} className="rounded-lg border border-indigo-100 p-3">
            <label className="flex items-center gap-2 text-sm font-bold text-indigo-950">
              <input type="checkbox" data-testid={`checklist-level-${l}`} checked={all} onChange={() => toggleLevel(ids, all)} className="h-4 w-4 accent-indigo-700" /> Tingkat {l}
            </label>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {items.map((s) => (
                <label key={s.id} className="flex items-start gap-2 text-[13px] text-slate-700">
                  <input type="checkbox" data-testid={`checklist-subject-${s.id}`} checked={set.has(s.id)} onChange={() => toggle(s.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-700" />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
