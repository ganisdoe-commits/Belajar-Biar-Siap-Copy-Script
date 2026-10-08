import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, ArrowRight, User, LogOut, History, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useExam } from "../context/ExamContext";
import { getSubjects, getResults } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { candidate, loginCandidate, logoutCandidate } = useExam();
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getSubjects()
      .then((d) => setSubjects(d))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (candidate?.id) {
      getResults(candidate.id).then((d) => setHistory(d)).catch(() => setHistory([]));
    }
  }, [candidate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    loginCandidate({ name: name.trim(), id: "BBP-" + Math.floor(100000 + Math.random() * 900000) });
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-[#FFFEFB]">
        <Navbar />
        <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20">
          <div className="w-full rounded-2xl border border-indigo-100 bg-white p-8 shadow-xl shadow-indigo-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-700 text-white">
              <User className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-indigo-950">Masuk ke Simulator</h1>
            <p className="mt-2 text-sm text-slate-600">
              Meniru login ujian dengan akun peserta. Masukkan nama Anda untuk memulai simulasi.
            </p>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nama Peserta</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Budi Santoso" className="mt-1.5 h-11" />
              </div>
              <Button type="submit" className="h-11 w-full bg-indigo-700 font-bold hover:bg-indigo-900">
                Masuk <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-400">Data hanya disimpan di browser Anda (demo).</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFEFB]">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-[#FFF8E9] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-700 text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Selamat datang</div>
              <div className="text-lg font-extrabold text-indigo-950">{candidate.name}</div>
              <div className="text-xs text-slate-500">ID: {candidate.id}</div>
            </div>
          </div>
          <Button variant="outline" onClick={() => { logoutCandidate(); navigate("/"); }} className="border-indigo-200 font-semibold text-indigo-700 hover:bg-indigo-50">
            <LogOut className="mr-1.5 h-4 w-4" /> Keluar
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-indigo-950">Pilih Mata Ujian</h2>
          <p className="mt-1.5 text-slate-600">Pilih mata ujian untuk mulai simulasi.</p>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat mata ujian...</div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <div key={s.id} className="group flex flex-col rounded-2xl border border-indigo-100 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: s.color }}>{s.code}</span>
                  <span className="text-xs font-semibold text-slate-400">{s.totalQuestions} soal</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-indigo-950">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {s.durationMin} menit</span>
                  <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Pilihan ganda</span>
                </div>
                <Button onClick={() => navigate(`/pre-exam/${s.id}`)} disabled={!s.totalQuestions} className="mt-5 w-full bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400 disabled:opacity-50">
                  {s.totalQuestions ? "Mulai Ujian" : "Belum ada soal"} {!!s.totalQuestions && <ArrowRight className="ml-1.5 h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              <h2 className="text-xl font-extrabold tracking-tight text-indigo-950">Riwayat Latihan</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-indigo-50 text-xs font-semibold uppercase tracking-wider text-indigo-500">
                  <tr>
                    <th className="px-5 py-3">Mata Ujian</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3 text-center">Benar</th>
                    <th className="px-5 py-3 text-center">Nilai</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-5 py-3 font-semibold text-slate-800">{h.subject_name}</td>
                      <td className="px-5 py-3 text-slate-500">{new Date(h.date).toLocaleDateString("id-ID")}</td>
                      <td className="px-5 py-3 text-center text-slate-700">{h.correct}/{h.total}</td>
                      <td className="px-5 py-3 text-center font-bold text-indigo-950">{h.score}</td>
                      <td className="px-5 py-3 text-center">
                        {h.passed ? (
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
          </div>
        )}
      </div>
    </div>
  );
}
