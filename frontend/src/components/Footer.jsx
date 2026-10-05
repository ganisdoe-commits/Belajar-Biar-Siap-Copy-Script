import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-[15px] font-extrabold tracking-tight text-white">
                MyConsultant
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Simulator persiapan mandiri USKP Tingkat A — mudah, terarah, dan
              terukur dengan suasana ujian CAT yang mendekati aslinya.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Simulator</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/dashboard" className="hover:text-white">Pilih Mata Ujian</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Latihan Pilihan Ganda</Link></li>
              <li><Link to="/esai" className="hover:text-white">Mode Esai</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Mata Ujian USKP A</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>PPh OP & SPT PPh OP</li>
              <li>KUP, PPSP, PP</li>
              <li>PPh Pot/Put</li>
              <li>PPN & SPT PPN</li>
              <li>PBB-P5L & Bea Meterai</li>
              <li>Kode Etik Profesi</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">Catatan</h4>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Soal yang ditampilkan saat ini adalah <span className="text-slate-200">data contoh (mock)</span> untuk
              keperluan demo simulator. Akan diganti dengan bank soal asli Anda.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} MyConsultant — Simulator USKP A. Dibuat untuk persiapan mandiri.
        </div>
      </div>
    </footer>
  );
}
