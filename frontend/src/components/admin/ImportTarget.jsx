import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

const F = ({ label, children }) => (
  <div>
    <Label className="text-xs font-semibold text-slate-600">{label}</Label>
    <div className="mt-1">{children}</div>
  </div>
);

export default function ImportTarget({ subjects, target, setTarget }) {
  const ns = target.newSubject;
  const setNs = (k, v) => setTarget({ ...target, newSubject: { ...ns, [k]: v } });

  return (
    <div data-testid="import-target" className="rounded-2xl border border-indigo-100 bg-white p-5">
      <div className="text-sm font-bold text-indigo-950">Simpan ke mata ujian</div>
      <RadioGroup value={target.mode} onValueChange={(v) => setTarget({ ...target, mode: v })} className="mt-3 flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <RadioGroupItem data-testid="import-mode-existing" value="existing" /> Mata ujian yang sudah ada
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <RadioGroupItem data-testid="import-mode-new" value="new" /> Buat mata ujian baru
        </label>
      </RadioGroup>

      {target.mode === "existing" ? (
        <div className="mt-4">
          <Select value={target.subjectId} onValueChange={(v) => setTarget({ ...target, subjectId: v })}>
            <SelectTrigger data-testid="import-subject-select" className="w-full sm:w-[480px]"><SelectValue placeholder="Pilih mata ujian" /></SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>[Tk. {s.level || "A"}] {s.name} · {s.totalQuestions} PG / {s.essayCount} esai</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <F label="Nama mata ujian"><Input data-testid="new-subject-name" value={ns.name} onChange={(e) => setNs("name", e.target.value)} /></F>
          </div>
          <F label="Tingkat">
            <Select value={ns.level} onValueChange={(v) => setNs("level", v)}>
              <SelectTrigger data-testid="new-subject-level"><SelectValue /></SelectTrigger>
              <SelectContent>{["A", "B", "C"].map((l) => <SelectItem key={l} value={l}>Tingkat {l}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Kode (mis. C3)"><Input data-testid="new-subject-code" value={ns.code} onChange={(e) => setNs("code", e.target.value)} /></F>
          <F label="Durasi (menit)"><Input data-testid="new-subject-duration" type="number" min={10} max={300} value={ns.durationMin} onChange={(e) => setNs("durationMin", e.target.value)} /></F>
          <F label="Jumlah soal per sesi"><Input data-testid="new-subject-examcount" type="number" min={1} max={200} value={ns.examCount} onChange={(e) => setNs("examCount", e.target.value)} /></F>
          <div className="sm:col-span-2">
            <F label="Deskripsi singkat (opsional)"><Input data-testid="new-subject-desc" value={ns.desc} onChange={(e) => setNs("desc", e.target.value)} /></F>
          </div>
        </div>
      )}
    </div>
  );
}
