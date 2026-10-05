import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Timer, Calculator, StickyNote,
  Flag, ListChecks, BarChart3, RotateCcw, ShieldCheck, Monitor, Sparkles, Layers,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { SUBJECTS, LANDING_STATS, PASS_RATES, TESTIMONIALS, LEVELS } from "../mock";

const HERO_IMG = "https://images.unsplash.com/photo-1507206130118-b5907f817163?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBzdHVkeWluZyUyMGxhcHRvcHxlbnwwfHx8fDE3OTExNzIzMjh8MA&ixlib=rb-4.1.0&q=85";
const CAT_IMG = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxvbmxpbmUlMjBleGFtJTIwY29tcHV0ZXJ8ZW58MHx8fHwxNzkxMTcyMzI4fDA&ixlib=rb-4.1.0&q=85";
const CTA_IMG = "https://images.unsplash.com/photo-1589386417686-0d34b5903d23?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxjb25maWRlbnQlMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbHxlbnwwfHx8fDE3OTExNzIzMjh8MA&ixlib=rb-4.1.0&q=85";

const FEATURES = [
  { icon: Timer, title: "Timer Mata Ujian", desc: "Hitung mundur sesuai durasi tiap mata ujian, melatih pengaturan waktu." },
  { icon: Flag, title: "Tandai Soal Ragu", desc: "Beri penanda pada soal yang masih ragu untuk ditinjau kembali." },
  { icon: ListChecks, title: "Navigasi Soal", desc: "Status terjawab, belum terjawab, dan ditandai dalam satu panel." },
  { icon: Calculator, title: "Kalkulator Bawaan", desc: "Kalkulator di dalam sistem untuk membantu perhitungan pajak." },
  { icon: StickyNote, title: "Catatan (Note)", desc: "Fitur catatan untuk coretan selama mengerjakan soal." },
  { icon: BarChart3, title: "Penilaian Otomatis", desc: "Skor langsung dengan bobot 2,5 per jawaban benar, nilai maksimal 100." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden hero-grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-white" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3.5 w-3.5" /> Tingkat A · B · C
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.3rem]">
              Belajar Biar{" "}
              <span className="text-blue-600">Pintar</span>, Lulus Ujian Kompetensi Pajak
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Aplikasi pembelajaran untuk menghadapi Ujian Kompetensi Pajak
              Tingkat A, B, dan C. Berlatih dalam suasana ujian yang mendekati
              aslinya — lengkap dengan timer, navigasi soal, kalkulator, dan penilaian otomatis.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="h-12 bg-blue-600 px-7 text-base font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700"
              >
                Mulai Belajar <ArrowRight className="ml-1.5 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/esai")}
                className="h-12 border-slate-300 px-7 text-base font-bold text-slate-700 hover:bg-slate-50"
              >
                Coba Mode Esai
              </Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {LANDING_STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10">
              <img src={HERO_IMG} alt="Belajar Biar Pintar" className="h-[440px] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Nilai 75 — Lulus</div>
                  <div className="text-xs text-slate-500">Penilaian otomatis</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-6 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                <Timer className="h-5 w-5" /> 01:58:24
              </div>
              <div className="mt-0.5 text-xs text-slate-500">Sisa waktu ujian</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE SUBJECTS */}
      <div className="border-y border-slate-100 bg-slate-50 py-4">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
            {[...SUBJECTS, ...SUBJECTS].map((s, i) => (
              <span key={i} className="flex items-center gap-8 whitespace-nowrap text-sm font-semibold text-slate-500">
                {s.name} <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* LEVELS A/B/C */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">
            <Layers className="h-4 w-4" /> Tiga Tingkat Kompetensi
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Satu aplikasi untuk Tingkat A, B, dan C
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Pilih tingkat sesuai jenjang Anda. Setiap tingkat memiliki susunan
            mata ujian dan durasi tersendiri.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {LEVELS.map((lv) => (
            <div
              key={lv.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div className="flex items-center gap-4 p-6" style={{ backgroundColor: `${lv.accent}10` }}>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold text-white"
                  style={{ backgroundColor: lv.accent }}
                >
                  {lv.id}
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900">{lv.title}</div>
                  <div className="text-sm font-medium text-slate-500">{lv.tagline}</div>
                </div>
              </div>
              <ul className="flex-1 divide-y divide-slate-100 px-6">
                {lv.subjects.map((s) => (
                  <li key={s.name} className="flex items-center justify-between py-3">
                    <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {s.durasi}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-6 pt-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="w-full border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Mulai Tingkat {lv.id} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Catatan: bank soal & simulator Tingkat A tersedia lebih dulu; Tingkat B & C menyusul.
        </p>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">Lebih siap, lebih mantap</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Berlatih seperti ujian sebenarnya
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Ujian Kompetensi Pajak dikerjakan secara online di layar komputer.
              Aplikasi ini membiasakan Anda dengan semua fiturnya sejak awal.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAM PREVIEW */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-blue-400">Simulator ujian</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Biasakan cara mengerjakannya
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              Bukan sekadar membaca soal. Latih kebiasaan membaca soal di layar,
              berpindah antarsoal, mengatur waktu per soal, dan menjaga fokus
              sepanjang sesi ujian.
            </p>
            <ul className="mt-7 space-y-3">
              {["Masuk & pilih mata ujian", "Masukkan token untuk memulai", "Kerjakan soal pilihan ganda", "Kirim, kunci, lalu lihat hasil"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-slate-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-400" /> {t}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="mt-8 h-12 bg-blue-600 px-7 text-base font-bold hover:bg-blue-500"
            >
              Mulai Sekarang <ArrowRight className="ml-1.5 h-5 w-5" />
            </Button>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-700 shadow-2xl">
            <img src={CAT_IMG} alt="Ujian berbasis komputer" className="h-[400px] w-full object-cover opacity-90" />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-semibold"><Monitor className="h-4 w-4" /> Mode ujian aktif</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-300"><ShieldCheck className="h-4 w-4" /> Terkunci</div>
            </div>
          </div>
        </div>
      </section>

      {/* PASS RATE INFOGRAPHIC */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-blue-600">Infografis kelulusan</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Belajar lebih terarah dengan data
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Kenali mata ujian yang perlu dipersiapkan lebih matang berdasarkan
            gambaran tingkat kelulusan (data contoh).
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PASS_RATES.map((p) => (
            <div key={p.subject} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold text-slate-900">{p.subject}</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-green-600">Lulus</span>
                    <span className="font-bold text-slate-900">{p.lulus}%</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${p.lulus}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-amber-600">Mengulang</span>
                    <span className="font-bold text-slate-900">{p.ulang}%</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${p.ulang}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVALUATION */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">Evaluasi mandiri</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ukur kesiapan lebih objektif
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BarChart3, title: "Hasil latihan", desc: "Lihat skor sesi sebagai dasar evaluasi." },
              { icon: ListChecks, title: "Review jawaban", desc: "Tinjau kembali pilihan yang sudah dikerjakan." },
              { icon: CheckCircle2, title: "Pembahasan", desc: "Pelajari logika & dasar hukum di balik jawaban." },
              { icon: RotateCcw, title: "Ulangi latihan", desc: "Latihan dapat diulang tanpa batas." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{c.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Kata mereka yang sudah berlatih
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} className="rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-700">"{t.text}"</blockquote>
              <figcaption className="mt-4 text-xs font-semibold text-slate-500">— {t.author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-blue-600">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
          <div className="text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Saatnya belajar biar pintar!
            </h2>
            <p className="mt-4 max-w-lg text-lg text-blue-100">
              Mulai latihan Ujian Kompetensi Pajak dengan hasil yang bisa
              dievaluasi dan diulang berkali-kali.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="mt-8 h-12 bg-white px-7 text-base font-bold text-blue-700 hover:bg-blue-50"
            >
              Mulai Sekarang <ArrowRight className="ml-1.5 h-5 w-5" />
            </Button>
          </div>
          <div className="relative hidden justify-end lg:flex">
            <img src={CTA_IMG} alt="Profesional" className="h-72 w-72 rounded-2xl object-cover shadow-2xl" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
