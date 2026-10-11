import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, Save, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../ui/alert-dialog";
import { useToast } from "../../hooks/use-toast";
import { adminImportPreview, adminImportCommit, apiErrorMessage } from "../../api";
import ImportReport from "./ImportReport";
import ImportTarget from "./ImportTarget";

const COLORS = { A: "#4338CA", B: "#D97706", C: "#15803D" };
const initialTarget = (report, subjects) => {
  const lv = report.meta.level || "A";
  const next = subjects.filter((s) => (s.level || "A") === lv).length + 1;
  return {
    mode: report.suggested_subject_id ? "existing" : "new",
    subjectId: report.suggested_subject_id || "",
    newSubject: { name: report.meta.name || "", level: lv, code: `${lv}${next}`, durationMin: 90, examCount: 40, desc: "" },
  };
};

export default function ImportWord({ subjects, onImported }) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState(null);
  const [target, setTarget] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => { setFile(null); setReport(null); setTarget(null); setProgress(0); if (inputRef.current) inputRef.current.value = ""; };

  const check = async () => {
    if (!file) return;
    try {
      setChecking(true); setProgress(0);
      const rep = await adminImportPreview(file, setProgress);
      setReport(rep);
      setTarget(initialTarget(rep, subjects));
    } catch (err) {
      toast({ title: "File tidak dapat diperiksa", description: apiErrorMessage(err), variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  const targetSubject = target?.mode === "existing" ? subjects.find((s) => s.id === target.subjectId) : null;
  const canSave = report && (report.mcq_valid > 0 || report.essay_valid > 0) &&
    (target?.mode === "existing" ? !!targetSubject : target?.newSubject.name.trim() && target?.newSubject.code.trim());

  const save = async () => {
    const ns = target.newSubject;
    const payload = target.mode === "existing" ? { draft_id: report.draft_id, subject_id: target.subjectId } : {
      draft_id: report.draft_id,
      new_subject: { ...ns, durationMin: Number(ns.durationMin) || 90, examCount: Number(ns.examCount) || 40, color: COLORS[ns.level], short: "" },
    };
    try {
      setSaving(true);
      const res = await adminImportCommit(payload);
      const kept = [res.mcq_kept && "PG lama dipertahankan", res.essays_kept && "esai lama dipertahankan"].filter(Boolean).join(", ");
      toast({ title: "Bank soal tersimpan", description: `${res.mcq_saved} PG dan ${res.essays_saved} esai disimpan${kept ? ` (${kept})` : ""}.` });
      reset();
      onImported && onImported(res.subject_id);
    } catch (err) {
      toast({ title: "Gagal menyimpan", description: apiErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false); setConfirm(false);
    }
  };

  return (
    <div data-testid="import-word-panel" className="space-y-5">
      <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-700 text-white"><UploadCloud className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-indigo-950">Unggah Bank Soal (Word .docx)</div>
            <p className="text-sm text-slate-600">Format sama seperti file bank soal sebelumnya: "Materi:", "Soal 1.", opsi A–D, "Kunci Jawaban:", "Bagian II", "Esai 1 —".</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={inputRef} data-testid="import-file-input" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setReport(null); }}
            className="block w-full max-w-md text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-50" />
          <Button data-testid="import-check-button" onClick={check} disabled={!file || checking} className="bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400">
            {checking ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-1.5 h-4 w-4" />} Periksa File
          </Button>
        </div>
        {checking && <div className="mt-3 max-w-md"><Progress value={progress} /><div className="mt-1 text-xs text-slate-500">{progress < 100 ? `Mengunggah ${progress}%` : "Memeriksa isi dokumen..."}</div></div>}
      </div>

      {report && target && (
        <>
          <ImportReport report={report} />
          <ImportTarget subjects={subjects} target={target} setTarget={setTarget} />
          <div className="flex flex-wrap gap-3">
            <Button data-testid="import-save-button" disabled={!canSave || saving} onClick={() => setConfirm(true)} className="bg-indigo-700 font-bold hover:bg-indigo-900">
              <Save className="mr-1.5 h-4 w-4" /> Simpan ke Database
            </Button>
            <Button data-testid="import-cancel-button" variant="outline" onClick={reset} className="border-indigo-200 font-semibold text-indigo-700">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Batal
            </Button>
          </div>
        </>
      )}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent data-testid="import-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Ganti bank soal?</AlertDialogTitle>
            <AlertDialogDescription>
              {targetSubject
                ? `Seluruh soal PG${report?.essay_valid ? " dan esai" : ""} pada "${targetSubject.name}" (Tingkat ${targetSubject.level || "A"}) akan diganti dengan isi file ini.`
                : `Mata ujian baru "${target?.newSubject.name}" (Tingkat ${target?.newSubject.level}) akan dibuat.`}
              {` Disimpan: ${report?.mcq_valid || 0} PG dan ${report?.essay_valid || 0} esai. Riwayat nilai peserta tetap tersimpan.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="import-confirm-cancel">Batal</AlertDialogCancel>
            <AlertDialogAction data-testid="import-confirm-ok" onClick={(e) => { e.preventDefault(); save(); }} disabled={saving} className="bg-indigo-700 hover:bg-indigo-900">
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
