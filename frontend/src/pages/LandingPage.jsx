import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Timer, StickyNote, Sheet, Scale, CloudCheck, Target,
  Flag, ListChecks, BarChart3, RotateCcw, ShieldCheck, Monitor, Sparkles, Layers, MonitorCheck, FileSearch,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { SUBJECTS, LEVELS } from "../mock";

const HERO_IMG = "https://images.unsplash.com/photo-1507206130118-b5907f817163?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBzdHVkeWluZyUyMGxhcHRvcHxlbnwwfHx8fDE3OTExNzIzMjh8MA&ixlib=rb-4.1.0&q=85";
const CAT_IMG = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxvbmxpbmUlMjBleGFtJTIwY29tcHV0ZXJ8ZW58MHx8fHwxNzkxMTcyMzI4fDA&ixlib=rb-4.1.0&q=85";
const CTA_IMG = "https://images.unsplash.com/photo-1589386417686-0d34b5903d23?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxjb25maWRlbnQlMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbHxlbnwwfHx8fDE3OTExNzIzMjh8MA&ixlib=rb-4.1.0&q=85";

const FEATURES = [
  { icon: Scale, title: "Ekstra Konten Peraturan", desc: "Buka UU, peraturan, dan formulir SPT langsung dari layar ujian, lalu kembali ke soal." },
  { icon: Sheet, title: "Lembar Kerja & Kalkulator", desc: "Lembar kerja ala Excel untuk perhitungan, ditambah kalkulator dan Note." },
  { icon: Timer, title: "Timer Mata Ujian", desc: "Hitung mundur sesuai durasi tiap mata ujian, melatih pengaturan waktu." },
  { icon: Flag, title: "Tandai Soal Ragu", desc: "Tandai soal yang masih ragu untuk ditinjau kembali sebelum dikirim." },
  { icon: ListChecks, title: "Navigasi & Statistik", desc: "Status terjawab, belum terjawab, dan ditandai dalam satu panel." },
  { icon: CloudCheck, title: "Simpan Otomatis", desc: "Jawaban tersimpan tiap menit; ujian bisa dilanjutkan setelah halaman tertutup." },
  { icon: BarChart3, title: "Penilaian Otomatis", desc: "Bobot 2,5 per jawaban benar tanpa pengurangan, nilai maksimal 100." },
  { icon: Target, title: "Rapor per Materi", desc: "Lihat persentase benar per bab untuk mengetahui bagian yang perlu diperkuat." },
];

const HOOKS = [
  { icon: MonitorCheck, text: "Alur & layar seperti ujian asli" },
  { icon: FileSearch, text: "Soal studi kasus terbaru" },
  { icon: Target, text: "Rapor per materi menunjukkan titik lemah" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFEFB]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden hero-grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 to-[#FFFEFB]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Sparkles className="h-3.5 w-3.5" /> Tingkat A · B · C
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-indigo-950 sm:text-5xl lg:text-[3.3rem]">
              Belajar Cerdas,{" "}
              <span className="relative text-indigo-700">Maju Bertahap
                <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-amber-400/70" />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Aplikasi pembelajaran untuk menghadapi Ujian Kompetensi Pajak
              Tingkat A, B, dan C. Berlatih dengan alur dan tampilan yang menyerupai ujian berbasis CAT —
              lengkap dengan ekstra konten peraturan, lembar kerja, timer, dan penilaian otomatis.
            </p>
            <div data-testid="landing-hook" className="mt-7 max-w-xl rounded-2xl border-l-4 border-amber-400 bg-white/80 p-5 shadow-sm">
              <p className="text-lg font-extrabold leading-snug text-indigo-950 sm:text-xl">
                “Jangan biarkan hari ujian menjadi pertama kalinya Anda melihat layar CAT.”
              </p>
              <ul className="mt-4 space-y-2">
                {HOOKS.map((h) => (
                  <li key={h.text} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white"><h.icon className="h-4 w-4" /></span>
                    {h.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="h-12 bg-amber-500 px-7 text-base font-bold text-indigo-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400"
              >
                Mulai Belajar <ArrowRight className="ml-1.5 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/esai")}
                className="h-12 border-indigo-300 px-7 text-base font-bold text-indigo-700 hover:bg-indigo-50"
              >
                Coba Mode Esai
              </Button>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative overflow-hidden rounded-3xl border border-indigo-100 shadow-2xl shadow-indigo-900/10">
              <img src={HERO_IMG} alt="Belajar Biar Pintar" className="h-[440px] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-indigo-50 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-950">Nilai 75 — Lulus</div>
                  <div className="text-xs text-slate-500">Penilaian otomatis</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-6 hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                <Timer className="h-5 w-5" /> 01:58:24
              </div>
              <div className="mt-0.5 text-xs text-slate-500">Sisa waktu ujian</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE SUBJECTS */}
      <div className="border-y border-indigo-100 bg-indigo-50/50 py-4">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
            {[...SUBJECTS, ...SUBJECTS].map((s, i) => (
              <span key={i} className="flex items-center gap-8 whitespace-nowrap text-sm font-semibold text-indigo-400">
                {s.name} <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* LEVELS A/B/C */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-700">
            <Layers className="h-4 w-4" /> Tiga Tingkat Kompetensi
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">
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
              className="flex flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/5"
            >
              <div className="flex items-center gap-4 p-6" style={{ backgroundColor: `${lv.accent}12` }}>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold text-white"
                  style={{ backgroundColor: lv.accent }}
                >
                  {lv.id}
                </div>
                <div>
                  <div className="text-lg font-extrabold text-indigo-950">{lv.title}</div>
                  <div className="text-sm font-medium text-slate-500">{lv.tagline}</div>
                </div>
              </div>
              <ul className="flex-1 divide-y divide-indigo-50 px-6">
                {lv.subjects.map((s) => (
                  <li key={s.name} className="flex items-center justify-between py-3">
                    <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                    <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {s.durasi}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-6 pt-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-indigo-700 font-semibold text-white hover:bg-indigo-900"
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
      <section className="bg-[#FFF8E9] py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-700">Lebih siap, lebih mantap</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">
              Berlatih seperti ujian sebenarnya
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Ujian Kompetensi Pajak dikerjakan secara online di layar komputer.
              Aplikasi ini membiasakan Anda dengan semua fiturnya sejak awal.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-indigo-100 bg-white p-7 transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-amber-500 group-hover:text-indigo-950">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-indigo-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAM PREVIEW */}
      <section className="bg-indigo-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-amber-400">Simulator ujian</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Biasakan cara mengerjakannya
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-indigo-200">
              Bukan sekadar membaca soal. Latih kebiasaan membaca soal di layar,
              berpindah antarsoal, mengatur waktu per soal, dan menjaga fokus
              sepanjang sesi ujian.
            </p>
            <ul className="mt-7 space-y-3">
              {["Detail ujian & Pakta Integritas", "Masukkan token, baca Panduan Ujian", "Kerjakan 40 soal dengan Ekstra Konten peraturan", "Kirim & Selesai, lalu lihat nilai & pembahasan"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-indigo-100">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-400" /> {t}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="mt-8 h-12 bg-amber-500 px-7 text-base font-bold text-indigo-950 hover:bg-amber-400"
            >
              Mulai Sekarang <ArrowRight className="ml-1.5 h-5 w-5" />
            </Button>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-indigo-800 shadow-2xl">
            <img src={CAT_IMG} alt="Ujian berbasis komputer" className="h-[400px] w-full object-cover opacity-90" />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-semibold"><Monitor className="h-4 w-4" /> Mode ujian aktif</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300"><ShieldCheck className="h-4 w-4" /> Terkunci</div>
            </div>
          </div>
        </div>
      </section>

      {/* EVALUATION */}
      <section className="bg-[#FFF8E9] py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-700">Evaluasi mandiri</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-indigo-950 sm:text-4xl">
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
              <div key={c.title} className="rounded-2xl border border-indigo-100 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-indigo-950">{c.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-indigo-700">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
          <div className="text-white">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Saatnya belajar biar pintar!
            </h2>
            <p className="mt-4 max-w-lg text-lg text-indigo-100">
              Mulai latihan Ujian Kompetensi Pajak dengan hasil yang bisa
              dievaluasi dan diulang berkali-kali.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="mt-8 h-12 bg-amber-500 px-7 text-base font-bold text-indigo-950 hover:bg-amber-400"
            >
              Mulai Sekarang <ArrowRight className="ml-1.5 h-5 w-5" />
            </Button>
          </div>
          <div className="relative hidden justify-end lg:flex">
            <img src={CTA_IMG} alt="Profesional" className="h-72 w-72 rounded-3xl object-cover shadow-2xl ring-4 ring-amber-400/30" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
