import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { adminGetEssays, adminCreateEssay, adminUpdateEssay, adminDeleteEssay } from "../../api";

export default function EssayManager({ subjectId, onChanged }) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ question: "", model_answer: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminGetEssays(subjectId).then((d) => setItems(d)).catch(() => setItems([])).finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm({ question: "", model_answer: "" }); setOpen(true); };
  const openEdit = (e) => { setEditId(e.id); setForm({ question: e.question, model_answer: e.model_answer || "" }); setOpen(true); };

  const save = async () => {
    if (!form.question.trim()) { toast({ title: "Pertanyaan wajib diisi", variant: "destructive" }); return; }
    const payload = { subject_id: subjectId, question: form.question, model_answer: form.model_answer };
    try {
      setSaving(true);
      if (editId) await adminUpdateEssay(editId, payload);
      else await adminCreateEssay(payload);
      setOpen(false);
      load();
      onChanged && onChanged();
      toast({ title: editId ? "Soal esai diperbarui" : "Soal esai ditambahkan" });
    } catch (e) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus soal esai ini?")) return;
    await adminDeleteEssay(id);
    load();
    onChanged && onChanged();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-indigo-950">Soal Esai <span className="text-slate-400">({items.length})</span></h3>
        <Button onClick={openCreate} className="bg-indigo-700 font-semibold hover:bg-indigo-900"><Plus className="mr-1.5 h-4 w-4" /> Tambah Esai</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat...</div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center text-slate-500">Belum ada soal esai. Klik "Tambah Esai".</p>
      ) : (
        <div className="space-y-3">
          {items.map((e, i) => (
            <div key={e.id} className="rounded-xl border border-indigo-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-indigo-950"><span className="mr-2 text-indigo-400">{i + 1}.</span>{e.question}</p>
                  {e.model_answer && <p className="mt-2 rounded-lg bg-emerald-50 p-3 text-sm text-slate-700"><span className="font-bold text-emerald-700">Kunci: </span>{e.model_answer}</p>}
                </div>
                <div className="flex gap-1.5">
                  <Button size="icon" variant="outline" onClick={() => openEdit(e)} className="h-8 w-8 border-indigo-200 text-indigo-700"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => remove(e.id)} className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Soal Esai" : "Tambah Soal Esai"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Pertanyaan</Label>
              <Textarea value={form.question} onChange={(ev) => setForm((f) => ({ ...f, question: ev.target.value }))} className="mt-1.5 min-h-[100px]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Kunci Jawaban Model</Label>
              <Textarea value={form.model_answer} onChange={(ev) => setForm((f) => ({ ...f, model_answer: ev.target.value }))} className="mt-1.5 min-h-[120px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving} className="bg-indigo-700 font-bold hover:bg-indigo-900">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
