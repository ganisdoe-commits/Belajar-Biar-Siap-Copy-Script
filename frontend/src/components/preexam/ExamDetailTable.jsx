import React, { useEffect, useState } from "react";
import { getClientInfo } from "../../api";

const zoneLabel = () => {
  const off = -new Date().getTimezoneOffset() / 60;
  return { 7: "WIB (UTC+7)", 8: "WITA (UTC+8)", 9: "WIT (UTC+9)" }[off] || `UTC${off >= 0 ? "+" : ""}${off}`;
};

const browserName = () => {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Mozilla Firefox";
  if (/Chrome\//.test(ua)) return "Google Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Lainnya";
};

export default function ExamDetailTable({ subject }) {
  const [ip, setIp] = useState("—");
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    getClientInfo().then((d) => setIp(d.ip)).catch(() => {});
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const rows = [
    ["Nama Ujian", `Simulasi Ujian Kompetensi Pajak Tingkat ${subject.level || "A"}`],
    ["Mata Ujian", subject.name],
    ["Durasi Awal", `${subject.durationMin} menit`],
    ["Sisa Waktu", `${subject.durationMin} menit (dimulai setelah token & panduan)`],
    ["Jumlah Soal", `${subject.totalQuestions} soal pilihan ganda (acak dari ${subject.bankSize} soal)`],
    ["Jadwal", "Latihan mandiri — dapat dimulai kapan saja"],
    ["Waktu Perangkat", clock.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" })],
    ["Zona Waktu", zoneLabel()],
    ["Browser", browserName()],
    ["Alamat IP", ip],
  ];
  return (
    <div data-testid="exam-detail-table" className="overflow-hidden rounded-xl border border-indigo-800">
      <div className="bg-indigo-900 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider text-white">Detail Ujian</div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-indigo-800/70">
              <td className="w-40 bg-indigo-900/40 px-4 py-2 font-semibold text-indigo-300">{k}</td>
              <td className="px-4 py-2 text-indigo-50">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
