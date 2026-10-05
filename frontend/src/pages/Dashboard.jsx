import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, ArrowRight, User, LogOut, History, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useExam } from "../context/ExamContext";
import { SUBJECTS } from "../mock";

export default function Dashboard() {
  const navigate = useNavigate();
  const { candidate, loginCandidate, logoutCandidate, history } = useExam();
  const [name, setName] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    loginCandidate({ name: name.trim(), id: "KMKID-" + Math.floor(100000 + Math.random() * 900000) });
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <User className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">Masuk ke Simulator</h1>
            <p className="mt-2 text-sm text-slate-600">
              Meniru login CAT dengan akun KemenkeuID/SSO. Masukkan nama peserta untuk memulai simulasi.
            </p>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Nama Peserta</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Budi Santoso"
                  className="mt-1.5 h-11"
                />
              </div>
              <Button type="submit" className="h-11 w-full bg-blue-600 font-bold hover:bg-blue-700">
                Masuk <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-400">
              Data hanya disimpan di browser Anda (demo).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selamat datang</div>
              <div className="text-lg font-extrabold text-slate-900">{candidate.name}</div>
              <div className="text-xs text-slate-500">ID: {candidate.id}</div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => { logoutCandidate(); navigate("/"); }}
            className="border-slate-300 font-semibold text-slate-700"
          >
            <LogOut className="mr-1.5 h-4 w-4" /> Keluar
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Pilih Mata Ujian</h2>
          <p className="mt-1.5 text-slate-600">Enam mata ujian USKP Tingkat A. Pilih untuk mulai simulasi CAT.</p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <div
              key={s.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: s.color }}
                >
                  {s.code}
                </span>
                <span className="text-xs font-semibold text-slate-400">{s.totalQuestions} soal</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {s.durationMin} menit</span>
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Pilihan ganda</span>
              </div>
              <Button
                onClick={() => navigate(`/pre-exam/${s.id}`)}
                className="mt-5 w-full bg-slate-900 font-semibold hover:bg-slate-800"
              >
                Mulai Ujian <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Riwayat */}
        {history.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Riwayat Latihan</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Mata Ujian</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3 text-center">Benar</th>
                    <th className="px-5 py-3 text-center">Nilai</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-5 py-3 font-semibold text-slate-800">{h.subjectName}</td>
                      <td className="px-5 py-3 text-slate-500">{new Date(h.date).toLocaleDateString("id-ID")}</td>
                      <td className="px-5 py-3 text-center text-slate-700">{h.correct}/{h.total}</td>
                      <td className="px-5 py-3 text-center font-bold text-slate-900">{h.score}</td>
                      <td className="px-5 py-3 text-center">
                        {h.passed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Lulus
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                            <XCircle className="h-3.5 w-3.5" /> Belum
                          </span>
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
