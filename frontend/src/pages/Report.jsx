import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Loader2, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { useExam } from "../context/ExamContext";
import { getReport } from "../api";
import { LevelTabs, useLevel } from "../components/LevelTabs";
import LevelSummary from "../components/report/LevelSummary";
import SubjectReportCard from "../components/report/SubjectReportCard";

const Empty = ({ text, onStart }) => (
  <div data-testid="report-empty" className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-[#FFF3D6]/60 p-10 text-center">
    <p className="font-semibold text-indigo-950">{text}</p>
    <Button onClick={onStart} className="mt-4 bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400">Mulai Simulasi <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
  </div>
);

export default function Report() {
  const navigate = useNavigate();
  const { candidate } = useExam();
  const [level, setLevel] = useLevel();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!candidate?.id) return;
    getReport(candidate.id).then(setData).catch(() => setFailed(true));
  }, [candidate]);

  const lv = data?.levels.find((l) => l.level === level);
  const subs = (data?.subjects || []).filter((s) => s.level === level);

  return (
    <div className="min-h-screen bg-[#FFFEFB]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700"><BarChart3 className="h-4 w-4" /> Rapor Belajar</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">Rapor {candidate ? candidate.name : "Peserta"}</h1>
        <p className="mt-2 text-slate-600">Ringkasan nilai per tingkat, per mata ujian, dan per materi — agar Anda tahu bagian mana yang perlu diperkuat.</p>

        {!candidate ? (
          <Empty text="Masuk ke simulator terlebih dahulu untuk melihat rapor Anda." onStart={() => navigate("/dashboard")} />
        ) : failed ? (
          <p data-testid="report-error" className="mt-10 text-center font-semibold text-red-600">Rapor gagal dimuat. Periksa koneksi lalu muat ulang halaman.</p>
        ) : !data ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat rapor...</div>
        ) : (
          <>
            <div className="mt-6"><LevelTabs value={level} onChange={setLevel} subjects={data.subjects} /></div>
            {!lv || lv.attempts === 0 ? (
              <Empty text={`Belum ada latihan di Tingkat ${level}.`} onStart={() => navigate("/dashboard")} />
            ) : (
              <div className="mt-6 space-y-8">
                <LevelSummary lv={lv} />
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-indigo-950">Per mata ujian</h2>
                  <div className="mt-4 grid gap-5 lg:grid-cols-2">
                    {subs.map((s) => <SubjectReportCard key={s.subject_id} s={s} />)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
