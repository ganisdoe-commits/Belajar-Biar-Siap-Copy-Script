import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Eye, EyeOff, CheckCircle2, BookOpen, PenLine,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import Navbar from "../components/Navbar";
import { SUBJECTS, ESSAY_BANK } from "../mock";

export default function EssayScreen() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const questions = ESSAY_BANK[subjectId] || [];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reveal, setReveal] = useState({});

  if (!subject || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFEFB] px-5">
        <p className="text-slate-600">Soal esai tidak ditemukan.</p>
        <Button onClick={() => navigate("/esai")} className="bg-indigo-700 hover:bg-indigo-900">Kembali</Button>
      </div>
    );
  }

  const q = questions[current];
  const showKey = reveal[current];

  return (
    <div className="min-h-screen bg-[#FFFEFB]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
        <button
          onClick={() => navigate("/esai")}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-900"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
              <PenLine className="h-3.5 w-3.5" /> {subject.name}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Soal <span className="text-indigo-950">{current + 1}</span> / {questions.length}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-indigo-100 bg-white p-6 lg:p-8">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
            <BookOpen className="h-4 w-4" /> Soal Uraian
          </div>
          <p className="mt-2 text-[17px] font-semibold leading-relaxed text-indigo-950">{q.q}</p>

          <label className="mt-6 block text-sm font-semibold text-slate-700">Jawaban Anda</label>
          <Textarea
            value={answers[current] || ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [current]: e.target.value }))}
            placeholder="Tulis jawaban dan langkah perhitungan Anda di sini..."
            className="mt-1.5 min-h-[200px] resize-none"
          />

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setReveal((r) => ({ ...r, [current]: !r[current] }))}
              className="border-indigo-200 font-semibold text-indigo-700"
            >
              {showKey ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
              {showKey ? "Sembunyikan Kunci" : "Lihat Kunci Jawaban"}
            </Button>
          </div>

          {showKey && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 animate-fade-up">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Kunci Jawaban Model
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{q.model}</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            className="border-indigo-200 font-semibold text-indigo-700"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Sebelumnya
          </Button>
          <Button
            disabled={current === questions.length - 1}
            onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            className="bg-indigo-700 font-semibold hover:bg-indigo-900"
          >
            Berikutnya <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
