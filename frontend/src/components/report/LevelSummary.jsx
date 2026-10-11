import React from "react";
import { Target, TrendingUp, Award, Repeat, AlertTriangle } from "lucide-react";
import MateriBars from "./MateriBars";

const Card = ({ icon: Icon, label, value, sub, testid }) => (
  <div data-testid={testid} className="rounded-2xl border border-indigo-100 bg-white p-5">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><Icon className="h-4 w-4 text-indigo-500" /> {label}</div>
    <div className="mt-2 text-3xl font-extrabold text-indigo-950">{value}</div>
    {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
  </div>
);

export default function LevelSummary({ lv }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card testid="level-avg" icon={TrendingUp} label="Rata-rata nilai" value={lv.avg} sub="dari seluruh percobaan" />
        <Card testid="level-best" icon={Award} label="Nilai terbaik" value={lv.best} />
        <Card testid="level-attempts" icon={Repeat} label="Percobaan" value={lv.attempts} sub={`${lv.subjects_attempted} dari ${lv.subjects_total} mata ujian dicoba`} />
        <Card testid="level-passed" icon={Target} label="Mata ujian lulus" value={`${lv.subjects_passed}/${lv.subjects_total}`} sub="nilai terbaik ≥ 60" />
      </div>
      {lv.weakest.length > 0 && (
        <div data-testid="weakest-materi" className="rounded-2xl border border-red-100 bg-white p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-extrabold text-indigo-950">Materi yang perlu diperkuat</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">Materi dengan persentase benar di bawah 60% pada Tingkat {lv.level}.</p>
          <div className="mt-5"><MateriBars items={lv.weakest} showSubject testid="weakest-materi-bars" /></div>
        </div>
      )}
    </div>
  );
}
