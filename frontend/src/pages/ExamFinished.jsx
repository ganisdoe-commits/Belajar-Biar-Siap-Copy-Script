import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useExam } from "../context/ExamContext";

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function ExamFinished() {
  const navigate = useNavigate();
  const { session } = useExam();

  useEffect(() => {
    if (!session?.submitted) navigate("/dashboard", { replace: true });
  }, [session, navigate]);
  if (!session?.submitted) return null;

  const r = session.result;
  const rows = [
    ["Mata Ujian", `${session.subject.name} (Tingkat ${session.subject.level || "A"})`],
    ["Waktu Mulai", fmtTime(session.startedAt)],
    ["Waktu Selesai", fmtTime(session.finishedAt)],
    ["Soal Terjawab", `${r.answered} dari ${r.total}`],
    ["Status", "Ujian telah selesai"],
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-5 py-10">
      <div data-testid="exam-finished" className="w-full max-w-xl rounded-2xl border border-indigo-800 bg-indigo-900 p-8 text-indigo-100">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"><CheckCircle2 className="h-9 w-9" /></div>
          <h1 className="mt-4 text-2xl font-extrabold text-white">Ujian Telah Selesai</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-indigo-300"><Lock className="h-4 w-4" /> Jawaban Anda telah terkirim dan terkunci oleh sistem.</p>
        </div>
        <table className="mt-6 w-full overflow-hidden rounded-xl text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-t border-indigo-800">
                <td className="w-36 py-2.5 pr-3 font-semibold text-indigo-300">{k}</td>
                <td className="py-2.5 text-white">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-5 rounded-lg bg-indigo-950/60 p-3 text-xs text-indigo-300">
          Pada ujian sesungguhnya, nilai baru dapat dilihat setelah sesi ujian berakhir dan hasil resmi diumumkan kemudian. Di simulasi ini Anda dapat langsung melihat nilai dan pembahasan.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button data-testid="view-result-button" onClick={() => navigate("/result")} className="h-11 flex-1 bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400"><BarChart3 className="mr-1.5 h-4 w-4" /> Lihat Nilai & Pembahasan</Button>
          <Button data-testid="back-to-dashboard-button" variant="outline" onClick={() => navigate("/dashboard")} className="h-11 flex-1 border-indigo-600 bg-transparent font-semibold text-indigo-100 hover:bg-indigo-800 hover:text-white"><ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Daftar Mata Ujian</Button>
        </div>
      </div>
    </div>
  );
}
