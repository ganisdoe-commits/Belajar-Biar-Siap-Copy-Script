import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { adminGetQuestions, adminCreateQuestion, adminUpdateQuestion, adminDeleteQuestion } from "../../api";

const KEYS = ["A", "B", "C", "D"];
const emptyForm = () => ({ question: "", A: "", B: "", C: "", D: "", answer: "A", pembahasan: "" });

export default function QuestionManager({ subjectId, onChanged }) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminGetQuestions(subjectId).then((d) => setItems(d)).catch(() => setItems([])).finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (q) => {
    const opt = {};
    KEYS.forEach((k) => { opt[k] = (q.options.find((o) => o.key === k) || {}).text || ""; });
    setEditId(q.id);
    setForm({ question: q.question, ...opt, answer: q.answer, pembahasan: q.pembahasan || "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.question.trim()) { toast({ title: "Pertanyaan wajib diisi", variant: "destructive" }); return; }
    const payload = {
      subject_id: subjectId,
      question: form.question,
      options: KEYS.map((k) => ({ key: k, text: form[k] })),
      answer: form.answer,
      pembahasan: form.pembahasan,
    };
    try {
      setSaving(true);
      if (editId) await adminUpdateQuestion(editId, payload);
      else await adminCreateQuestion(payload);
      setOpen(false);
      load();
      onChanged && onChanged();
      toast({ title: editId ? "Soal diperbarui" : "Soal ditambahkan" });
    } catch (e) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus soal ini?")) return;
    await adminDeleteQuestion(id);
    load();
    onChanged && onChanged();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-indigo-950">Soal Pilihan Ganda <span className="text-slate-400">({items.length})</span></h3>
        <Button onClick={openCreate} className="bg-indigo-700 font-semibold hover:bg-indigo-900"><Plus className="mr-1.5 h-4 w-4" /> Tambah Soal</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat...</div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center text-slate-500">Belum ada soal. Klik "Tambah Soal".</p>
      ) : (
        <div className="space-y-3">
          {items.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-indigo-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-indigo-950"><span className="mr-2 text-indigo-400">{i + 1}.</span>{q.question}</p>
                  <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {q.options.map((o) => (
                      <div key={o.key} className={`flex items-center gap-2 text-sm ${o.key === q.answer ? "font-bold text-emerald-700" : "text-slate-600"}`}>
                        <span className="font-bold">{o.key}.</span> {o.text}
                        {o.key === q.answer && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="icon" variant="outline" onClick={() => openEdit(q)} className="h-8 w-8 border-indigo-200 text-indigo-700"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => remove(q.id)} className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Soal" : "Tambah Soal"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Pertanyaan</Label>
              <Textarea value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} className="mt-1.5 min-h-[90px]" />
            </div>
            {KEYS.map((k) => (
              <div key={k}>
                <Label className="text-sm font-semibold">Opsi {k}</Label>
                <Input value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="mt-1.5" />
              </div>
            ))}
            <div>
              <Label className="text-sm font-semibold">Jawaban Benar</Label>
              <Select value={form.answer} onValueChange={(v) => setForm((f) => ({ ...f, answer: v }))}>
                <SelectTrigger className="mt-1.5 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>{KEYS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Pembahasan</Label>
              <Textarea value={form.pembahasan} onChange={(e) => setForm((f) => ({ ...f, pembahasan: e.target.value }))} className="mt-1.5 min-h-[80px]" />
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
