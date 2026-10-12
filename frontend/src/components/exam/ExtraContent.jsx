import React from "react";
import { FileText, Sheet, BookOpen } from "lucide-react";

export default function ExtraContent({ docs, onOpen }) {
  return (
    <div data-testid="extra-content-panel" className="rounded-xl border border-indigo-100 bg-white">
      <div className="border-b border-indigo-100 bg-indigo-950 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white">Ekstra Konten</div>
      <div className="space-y-4 p-4 text-sm">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-indigo-950"><BookOpen className="h-4 w-4 text-indigo-600" /> Petunjuk</div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-slate-600">
            <li>Pilih satu jawaban yang paling tepat.</li>
            <li>Benar = 2,5 poin. Salah atau kosong = 0, tanpa pengurangan.</li>
            <li>Untuk membantu menjawab, buka peraturan/formulir di bawah, lalu klik <b>Kembali ke Soal</b>.</li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-indigo-950">Peraturan & Formulir</div>
          {docs.length ? (
            <ul className="mt-2 space-y-1.5">
              {docs.map((d) => (
                <li key={d.id}>
                  <button data-testid={`regulation-link-${d.id}`} onClick={() => onOpen(d)}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold uppercase text-indigo-700 underline-offset-2 hover:bg-indigo-50 hover:underline">
                    {d.kind === "pdf" ? <FileText className="mt-0.5 h-4 w-4 shrink-0" /> : <Sheet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />}
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p data-testid="extra-content-empty" className="mt-2 text-[13px] text-slate-400">Belum ada dokumen peraturan untuk mata ujian ini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
