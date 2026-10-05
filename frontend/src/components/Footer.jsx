import React from "react";
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-indigo-950 bg-[#1E1B4B] text-indigo-200">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-indigo-950">
                <Brain className="h-5 w-5" />
              </div>
              <span className="text-[15px] font-extrabold tracking-tight text-white">
                Belajar Biar Pintar
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-indigo-300">
              Aplikasi pembelajaran Ujian Kompetensi Pajak Tingkat A, B, dan C —
              belajar lebih mudah, terarah, dan terukur dengan suasana ujian yang
              mendekati aslinya.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Simulator</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/dashboard" className="hover:text-amber-400">Pilih Mata Ujian</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-400">Latihan Pilihan Ganda</Link></li>
              <li><Link to="/esai" className="hover:text-amber-400">Mode Esai</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Tingkat Ujian</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-indigo-300">
              <li>Tingkat A — Dasar</li>
              <li>Tingkat B — Menengah</li>
              <li>Tingkat C — Lanjutan</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Catatan</h4>
            <p className="mt-4 text-sm leading-relaxed text-indigo-300">
              Soal yang ditampilkan saat ini adalah <span className="text-amber-300">data contoh (mock)</span> untuk
              keperluan demo simulator. Akan diganti dengan bank soal asli Anda.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-indigo-900 pt-6 text-center text-xs text-indigo-400">
          © {new Date().getFullYear()} Belajar Biar Pintar — Aplikasi Pembelajaran Ujian Kompetensi Pajak.
        </div>
      </div>
    </footer>
  );
}
