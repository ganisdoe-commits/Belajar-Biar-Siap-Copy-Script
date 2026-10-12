import React, { useCallback, useEffect, useState } from "react";
import { FileText, Sheet, Trash2, Settings2, ExternalLink, Info, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../ui/alert-dialog";
import { useToast } from "../../hooks/use-toast";
import { adminListRegulations, adminUpdateRegulation, adminDeleteRegulation, regulationFileUrl, apiErrorMessage } from "../../api";
import RegulationUpload from "./RegulationUpload";
import SubjectChecklist from "./SubjectChecklist";

const OFFICIAL_MAP = [
  ["PPh OP / Badan", "SDSN UU Pajak, SPT PPh OP/Badan Coretax"],
  ["KUP, PPSP, PP", "SDSN UU Pajak, UU PPSP, UU Pengadilan Pajak"],
  ["PPh Pot/Put", "SDSN UU Pajak, Lampiran Tarif PP 58/2023, Lampiran PER-11/2025"],
  ["PPN", "SDSN UU Pajak, SPT Masa PPN (PER-11/2025)"],
  ["Akuntansi Perpajakan / Pajak Internasional", "SDSN UU Pajak"],
];

export default function RegulationManager({ subjects }) {
  const { toast } = useToast();
  const [docs, setDocs] = useState(null);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => adminListRegulations().then(setDocs).catch(() => setDocs([])), []);
  useEffect(() => { load(); }, [load]);

  const saveEdit = async () => {
    try {
      setSaving(true);
      await adminUpdateRegulation(edit.id, { title: edit.title, subject_ids: edit.subject_ids });
      toast({ title: "Perubahan disimpan" });
      setEdit(null); load();
    } catch (err) {
      toast({ title: "Gagal menyimpan", description: apiErrorMessage(err), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try {
      await adminDeleteRegulation(del.id);
      toast({ title: "Dokumen dihapus" });
      setDel(null); load();
    } catch (err) {
      toast({ title: "Gagal menghapus", description: apiErrorMessage(err), variant: "destructive" });
    }
  };

  return (
    <div data-testid="regulation-manager" className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-[#FFF3D6]/60 p-5 text-sm">
        <div className="flex items-center gap-2 font-bold text-indigo-950"><Info className="h-4 w-4 text-amber-600" /> Acuan panduan ujian (daftar peraturan per mata ujian)</div>
        <ul className="mt-2 grid gap-1 text-slate-700 sm:grid-cols-2">
          {OFFICIAL_MAP.map(([m, p]) => <li key={m}><b>{m}:</b> {p}</li>)}
        </ul>
      </div>

      <RegulationUpload subjects={subjects} onUploaded={load} />

      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white">
        <div className="border-b border-indigo-100 px-5 py-3 font-extrabold text-indigo-950">Dokumen tersimpan</div>
        {!docs ? (
          <div className="flex items-center gap-2 p-6 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Memuat...</div>
        ) : docs.length === 0 ? (
          <p data-testid="regulation-empty" className="p-6 text-sm text-slate-500">Belum ada dokumen. Unggah PDF atau Excel di atas.</p>
        ) : (
          <ul className="divide-y divide-indigo-50">
            {docs.map((d) => (
              <li key={d.id} data-testid={`regulation-row-${d.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3">
                {d.kind === "pdf" ? <FileText className="h-5 w-5 text-red-600" /> : <Sheet className="h-5 w-5 text-emerald-700" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-indigo-950">{d.title}</div>
                  <div className="text-xs text-slate-500">{d.filename} · {(d.size / 1048576).toFixed(1)} MB · {d.subject_ids.length} mata ujian</div>
                </div>
                <a href={regulationFileUrl(d.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"><ExternalLink className="h-3.5 w-3.5" /> Lihat</a>
                <Button data-testid={`regulation-edit-${d.id}`} size="sm" variant="outline" onClick={() => setEdit({ ...d })} className="border-indigo-200 text-indigo-700"><Settings2 className="mr-1 h-3.5 w-3.5" /> Atur</Button>
                <Button data-testid={`regulation-delete-${d.id}`} size="sm" variant="outline" onClick={() => setDel(d)} className="border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Atur Dokumen</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <Input data-testid="regulation-edit-title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
              <div className="max-h-[50vh] overflow-y-auto pr-1"><SubjectChecklist subjects={subjects} value={edit.subject_ids} onChange={(ids) => setEdit({ ...edit, subject_ids: ids })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button data-testid="regulation-edit-save" disabled={saving || !edit?.title.trim()} onClick={saveEdit} className="bg-indigo-700 font-bold hover:bg-indigo-900">{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dokumen?</AlertDialogTitle>
            <AlertDialogDescription>"{del?.title}" tidak akan tampil lagi di Ekstra Konten peserta.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction data-testid="regulation-delete-confirm" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
