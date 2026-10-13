import React from "react";
import { ArrowRight, Loader2, ScrollText } from "lucide-react";
import { Button } from "../ui/button";

export default function ExamGuide({ subject, starting, onContinue, onBack }) {
  const items = [
    `Mata ujian ini terdiri dari ${subject.totalQuestions} soal pilihan ganda.`,
    "Setiap jawaban benar bernilai 2,5 poin. Tidak ada pengurangan nilai untuk jawaban salah atau kosong.",
    `Durasi ujian ${subject.durationMin} menit. Waktu mulai berjalan setelah Anda menekan LANJUT.`,
    "Soal dapat dikerjakan secara acak dan Anda dapat kembali ke soal sebelumnya.",
    "Gunakan TANDAI untuk soal yang masih ragu-ragu; tanda tampil di panel Navigasi.",
    "Peraturan dan formulir terkait dapat dibuka melalui panel EKSTRA KONTEN di sisi kiri layar.",
    "Tersedia Note, Lembar Kerja (seperti Excel), dan Kalkulator. Pada ujian sesungguhnya kalkulator fisik dan kertas buram dilarang; yang disediakan adalah tab Excel.",
    "Jawaban tersimpan otomatis di perangkat dan dikirim ke server setiap 1 menit. Jika halaman tertutup atau di-refresh, ujian dapat dilanjutkan.",
    "Jika waktu habis, jawaban otomatis terkirim dan layar ujian tertutup.",
    "Masa toleransi 2,5 menit: bila koneksi terputus tepat saat waktu habis, kiriman yang diterima server paling lambat 2,5 menit setelah waktu habis tetap dinilai utuh. Lewat dari itu, server menutup ujian dan hanya menilai jawaban terakhir yang sudah tersimpan di server (simpan otomatis tiap 1 menit).",
    "Jika halaman ditutup dan tidak dibuka lagi, server menyelesaikan dan menilai ujian Anda secara otomatis dari jawaban yang sudah tersimpan.",
    "Tekan KIRIM & SELESAI hanya bila seluruh soal sudah dikerjakan. Jawaban yang terkirim terkunci dan tidak dapat diubah.",
  ];
  return (
    <div data-testid="exam-guide" className="mx-auto max-w-3xl rounded-2xl border border-indigo-800 bg-indigo-900 p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400"><ScrollText className="h-5 w-5" /></div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Panduan Ujian</div>
          <h2 className="text-xl font-extrabold text-white">{subject.name}</h2>
        </div>
      </div>
      <ol className="mt-6 space-y-3 text-sm text-indigo-100">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-800 text-xs font-bold text-amber-300">{i + 1}</span>
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm font-semibold text-amber-300">Baca panduan dengan saksama, lalu klik LANJUT. Kerjakan ujian dengan teliti!</p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onBack} className="border-indigo-600 bg-transparent font-semibold text-indigo-100 hover:bg-indigo-800 hover:text-white">Kembali</Button>
        <Button data-testid="guide-continue-button" disabled={starting} onClick={onContinue} className="h-11 bg-amber-500 px-8 font-extrabold uppercase text-indigo-950 hover:bg-amber-400">
          {starting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyiapkan...</> : <>Lanjut <ArrowRight className="ml-1.5 h-4 w-4" /></>}
        </Button>
      </div>
    </div>
  );
}
