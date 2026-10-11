import React, { useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { adminChangePassword, setAdminToken, apiErrorMessage } from "../../api";

const RULES = [
  { test: (p) => p.length >= 10, label: "Minimal 10 karakter" },
  { test: (p) => /[A-Za-z]/.test(p) && /\d/.test(p), label: "Mengandung huruf dan angka" },
];

const Field = ({ id, label, value, onChange }) => (
  <div>
    <Label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</Label>
    <Input id={id} data-testid={id} type="password" autoComplete="new-password" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-11" />
  </div>
);

export default function ChangePassword() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const rulesOk = RULES.every((r) => r.test(form.next));
  const match = form.next && form.next === form.confirm;

  const submit = async (e) => {
    e.preventDefault();
    if (!rulesOk || !match) return;
    try {
      setSaving(true);
      const { token } = await adminChangePassword({ current_password: form.current, new_password: form.next });
      setAdminToken(token);
      setForm({ current: "", next: "", confirm: "" });
      toast({ title: "Password berhasil diganti", description: "Sesi admin di perangkat lain otomatis keluar." });
    } catch (err) {
      toast({ title: "Gagal mengganti password", description: apiErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="change-password-panel" className="max-w-lg rounded-2xl border border-indigo-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700 text-white"><KeyRound className="h-5 w-5" /></div>
        <div>
          <h3 className="text-lg font-extrabold text-indigo-950">Ganti Password Admin</h3>
          <p className="text-sm text-slate-500">Password disimpan terenkripsi dan tidak pernah ditampilkan.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field id="current-password-input" label="Password saat ini" value={form.current} onChange={set("current")} />
        <Field id="new-password-input" label="Password baru" value={form.next} onChange={set("next")} />
        <Field id="confirm-password-input" label="Ulangi password baru" value={form.confirm} onChange={set("confirm")} />
        <ul className="space-y-1 text-xs">
          {RULES.map((r) => (
            <li key={r.label} className={r.test(form.next) ? "font-semibold text-emerald-700" : "text-slate-500"}>
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />{r.label}
            </li>
          ))}
          <li className={match ? "font-semibold text-emerald-700" : "text-slate-500"}><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Kedua password baru sama</li>
        </ul>
        <Button data-testid="change-password-submit" type="submit" disabled={saving || !rulesOk || !match || !form.current} className="h-11 w-full bg-indigo-700 font-bold hover:bg-indigo-900">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Password Baru
        </Button>
      </form>
    </div>
  );
}
