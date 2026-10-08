import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { adminGetResults } from "../../api";

export default function ResultsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetResults().then((d) => setRows(d)).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat...</div>;

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold text-indigo-950">Hasil Ujian Peserta <span className="text-slate-400">({rows.length})</span></h3>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center text-slate-500">Belum ada hasil ujian.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-indigo-50 text-xs font-semibold uppercase tracking-wider text-indigo-500">
              <tr>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3">Mata Ujian</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-center">Benar</th>
                <th className="px-4 py-3 text-center">Nilai</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3"><div className="font-semibold text-slate-800">{r.candidate_name}</div><div className="text-xs text-slate-400">{r.candidate_id}</div></td>
                  <td className="px-4 py-3 text-slate-700">{r.subject_name}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.date).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{r.correct}/{r.total}</td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-950">{r.score}</td>
                  <td className="px-4 py-3 text-center">
                    {r.passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Lulus</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"><XCircle className="h-3.5 w-3.5" /> Belum</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
