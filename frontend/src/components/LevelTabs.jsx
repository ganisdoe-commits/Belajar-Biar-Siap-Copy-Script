import React, { useState } from "react";

export const LEVEL_OPTIONS = [
  { id: "A", label: "Tingkat A", tagline: "Dasar" },
  { id: "B", label: "Tingkat B", tagline: "Menengah" },
  { id: "C", label: "Tingkat C", tagline: "Lanjutan" },
];

const KEY = "bbp-level";

export function useLevel() {
  const [level, setLevelState] = useState(() => localStorage.getItem(KEY) || "A");
  const setLevel = (l) => {
    localStorage.setItem(KEY, l);
    setLevelState(l);
  };
  return [level, setLevel];
}

export const LevelTabs = ({ value, onChange, subjects }) => (
  <div data-testid="level-tabs" className="inline-flex flex-wrap gap-2 rounded-2xl border border-indigo-100 bg-white p-1.5">
    {LEVEL_OPTIONS.map((l) => {
      const count = subjects.filter((s) => (s.level || "A") === l.id).length;
      const active = value === l.id;
      return (
        <button
          key={l.id}
          type="button"
          data-testid={`level-tab-${l.id}`}
          onClick={() => onChange(l.id)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
            active ? "bg-indigo-700 text-white shadow-md shadow-indigo-900/20" : "text-indigo-900 hover:bg-indigo-50"
          }`}
        >
          {l.label}
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-amber-400 text-indigo-950" : "bg-indigo-50 text-indigo-500"}`}>
            {count}
          </span>
        </button>
      );
    })}
  </div>
);

export const LevelEmpty = ({ level }) => (
  <div data-testid="level-empty-state" className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-[#FFF3D6]/60 p-10 text-center">
    <div className="text-lg font-extrabold text-indigo-950">Tingkat {level} segera hadir</div>
    <p className="mt-2 text-sm text-slate-600">Bank soal untuk tingkat ini sedang disiapkan. Silakan berlatih di tingkat lain terlebih dahulu.</p>
  </div>
);

export function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const load = React.useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const { getSubjects } = await import("../api");
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        setSubjects(await getSubjects());
        setLoading(false);
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    setFailed(true);
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);
  return { subjects, loading, failed, reload: load };
}

export const ServerError = ({ onRetry }) => (
  <div data-testid="server-error-state" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
    <div className="text-lg font-extrabold text-red-700">Server sedang tidak aktif</div>
    <p className="mt-2 text-sm text-slate-600">Bank soal Anda aman tersimpan, tetapi data belum bisa dimuat. Tunggu sebentar lalu coba lagi.</p>
    <button data-testid="server-retry-button" onClick={onRetry} className="mt-4 rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-900">Coba Lagi</button>
  </div>
);
