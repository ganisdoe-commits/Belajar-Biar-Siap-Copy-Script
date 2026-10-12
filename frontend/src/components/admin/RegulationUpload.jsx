import React, { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { useToast } from "../../hooks/use-toast";
import { adminUploadRegulation, apiErrorMessage } from "../../api";
import SubjectChecklist from "./SubjectChecklist";

const ACCEPT = ".pdf,.xlsx,.xlsm,.xls";

export default function RegulationUpload({ subjects, onUploaded }) {
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subjectIds, setSubjectIds] = useState([]);
  const [progress, setProgress] = useState(null);

  const pick = (f) => {
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  };

  const upload = async () => {
    try {
      setProgress(0);
      await adminUploadRegulation(file, title.trim(), subjectIds, setProgress);
      toast({ title: "Dokumen tersimpan", description: `"${title.trim()}" kini tersedia di Ekstra Konten ${subjectIds.length} mata ujian.` });
      setFile(null); setTitle(""); setSubjectIds([]);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (err) {
      toast({ title: "Gagal mengunggah", description: apiErrorMessage(err), variant: "destructive" });
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;
  return (
    <div data-testid="regulation-upload" className="rounded-2xl border border-indigo-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700 text-white"><UploadCloud className="h-5 w-5" /></div>
        <div>
          <h3 className="font-extrabold text-indigo-950">Unggah Peraturan / Formulir</h3>
          <p className="text-sm text-slate-500">PDF (UU, PP, PMK, SDSN) atau Excel (formulir SPT). Maks. 100 MB per file.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-slate-600">File</Label>
            <input ref={inputRef} data-testid="regulation-file-input" type="file" accept={ACCEPT} disabled={busy} onChange={(e) => pick(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Judul yang tampil di Ekstra Konten</Label>
            <Input data-testid="regulation-title-input" value={title} disabled={busy} onChange={(e) => setTitle(e.target.value)} placeholder="mis. SDSN UU Pajak 2023" className="mt-1" />
          </div>
          {busy && <div><Progress value={progress} /><div className="mt-1 text-xs text-slate-500">Mengunggah {progress}%{progress === 100 ? " — menyimpan..." : ""}</div></div>}
          <Button data-testid="regulation-upload-button" disabled={!file || !title.trim() || busy} onClick={upload} className="bg-indigo-700 font-bold hover:bg-indigo-900">
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-1.5 h-4 w-4" />} Unggah & Simpan
          </Button>
        </div>
        <div>
          <Label className="text-xs font-semibold text-slate-600">Tampilkan pada mata ujian</Label>
          <div className="mt-1 max-h-80 overflow-y-auto pr-1"><SubjectChecklist subjects={subjects} value={subjectIds} onChange={setSubjectIds} /></div>
        </div>
      </div>
    </div>
  );
}
