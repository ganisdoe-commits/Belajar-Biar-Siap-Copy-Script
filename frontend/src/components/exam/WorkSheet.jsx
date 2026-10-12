import React, { useMemo, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { COLS, ROWS, evaluateCell, displayValue } from "../../lib/sheetFormula";

export default function WorkSheet({ cells, onChange }) {
  const [active, setActive] = useState("A1");
  const refs = useRef({});
  const computed = useMemo(() => {
    const out = {};
    Object.keys(cells).forEach((id) => { out[id] = displayValue(evaluateCell(id, cells)); });
    return out;
  }, [cells]);

  const setCell = (id, val) => {
    const next = { ...cells };
    if (val === "") delete next[id];
    else next[id] = val;
    onChange(next);
  };

  const move = (id, dr) => {
    const col = id.match(/[A-Z]+/)[0];
    const row = Math.min(ROWS, Math.max(1, Number(id.match(/\d+/)[0]) + dr));
    refs.current[col + row]?.focus();
  };

  return (
    <div data-testid="worksheet" className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <span className="w-12 rounded bg-indigo-50 px-2 py-1 text-center text-xs font-bold text-indigo-700">{active}</span>
        <input data-testid="worksheet-formula-bar" value={cells[active] || ""} onChange={(e) => setCell(active, e.target.value)}
          placeholder="Ketik angka atau rumus, mis. =B3*5% atau =SUM(B2:B6)"
          className="h-8 min-w-0 flex-1 rounded border border-slate-300 px-2 font-mono text-sm focus:border-indigo-500 focus:outline-none" />
        <button data-testid="worksheet-clear" onClick={() => onChange({})} className="inline-flex h-8 items-center gap-1 rounded border border-slate-300 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <Eraser className="h-3.5 w-3.5" /> Bersihkan
        </button>
      </div>
      <div className="mt-2 min-h-0 flex-1 overflow-auto rounded border border-slate-300">
        <table className="border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 z-20 w-10 border border-slate-300 bg-slate-100" />
              {COLS.map((c) => <th key={c} className="min-w-[110px] border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, r) => r + 1).map((r) => (
              <tr key={r}>
                <td className="sticky left-0 border border-slate-300 bg-slate-100 px-1 text-center text-xs font-semibold text-slate-500">{r}</td>
                {COLS.map((c) => {
                  const id = c + r;
                  const isActive = id === active;
                  const val = isActive ? cells[id] || "" : computed[id] ?? "";
                  const isNum = !isActive && /^-?[\d.,]+$/.test(String(val));
                  return (
                    <td key={id} className={`border border-slate-200 p-0 ${isActive ? "outline outline-2 -outline-offset-2 outline-indigo-600" : ""}`}>
                      <input ref={(el) => (refs.current[id] = el)} data-testid={`cell-${id}`} value={val}
                        onFocus={() => setActive(id)} onChange={(e) => setCell(id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); move(id, 1); }
                          if (e.key === "ArrowUp") { e.preventDefault(); move(id, -1); }
                        }}
                        className={`h-7 w-full bg-transparent px-1.5 focus:outline-none ${isNum ? "text-right tabular-nums" : ""} ${String(val).startsWith("#") && !isActive ? "text-red-600" : ""}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Rumus diawali "=". Fungsi: SUM, AVERAGE, MIN, MAX, COUNT, ROUND, ROUNDDOWN, ROUNDUP, ABS. Pemisah argumen ";" (contoh =ROUND(B5*2,5%;0)). Isi lembar kerja tersimpan selama sesi ujian dan tidak dinilai.
      </p>
    </div>
  );
}
