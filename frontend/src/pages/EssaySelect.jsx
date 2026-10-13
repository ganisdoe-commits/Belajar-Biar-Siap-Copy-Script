import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, ArrowRight, FileText, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { LevelTabs, LevelEmpty, useLevel, useSubjects, ServerError } from "../components/LevelTabs";

export default function EssaySelect() {
  const navigate = useNavigate();
  const { subjects, loading, failed, reload } = useSubjects();
  const [level, setLevel] = useLevel();
  const shown = subjects.filter((s) => (s.level || "A") === level);

  return (
    <div className="min-h-screen bg-[#FFFEFB]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <PenLine className="h-3.5 w-3.5" /> Mode Esai (Bonus)
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">Latihan Soal Esai / Uraian</h1>
          <p className="mt-3 text-lg text-slate-600">
            Panduan resmi menggunakan format pilihan ganda. Mode esai ini disediakan sebagai latihan
            tambahan untuk melatih penjelasan dan perhitungan secara terstruktur, lengkap dengan kunci jawaban model.
          </p>
          <div className="mt-6"><LevelTabs value={level} onChange={setLevel} subjects={subjects} /></div>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat...</div>
        ) : failed ? (
          <ServerError onRetry={reload} />
        ) : shown.length === 0 ? (
          <LevelEmpty level={level} />
        ) : (
          <div data-testid="essay-subject-grid" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => (
              <div key={s.id} data-testid={`essay-card-${s.id}`} className="group flex flex-col rounded-2xl border border-indigo-100 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: s.color }}>{s.code}</span>
                  <span className="text-xs font-semibold text-slate-400">Tingkat {s.level || "A"}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-indigo-950">{s.name}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><FileText className="h-4 w-4" /> {s.essayCount || 0} soal esai</div>
                <Button data-testid={`start-essay-${s.id}`} disabled={!s.essayCount} onClick={() => navigate(`/esai/${s.id}`)} className="mt-5 w-full bg-indigo-700 font-semibold hover:bg-indigo-900 disabled:opacity-50">
                  {s.essayCount ? "Mulai Latihan" : "Belum ada soal"} {!!s.essayCount && <ArrowRight className="ml-1.5 h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
