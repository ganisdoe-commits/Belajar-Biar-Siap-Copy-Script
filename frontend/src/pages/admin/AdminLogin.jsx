import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, Brain } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import { adminLogin, setAdminToken } from "../../api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      setAdminToken(token);
      navigate("/admin");
    } catch (err) {
      toast({ title: "Login gagal", description: "Kata sandi admin salah.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-indigo-950 px-5">
      <div className="w-full max-w-sm rounded-2xl border border-indigo-800 bg-indigo-900 p-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-indigo-950"><Brain className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-extrabold text-white">Belajar Biar Pintar</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Panel Admin</div>
          </div>
        </div>
        <h1 className="mt-6 text-xl font-extrabold text-white">Masuk Admin</h1>
        <p className="mt-1.5 text-sm text-indigo-300">Kelola soal, kunci jawaban, dan lihat hasil peserta.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-sm font-semibold text-indigo-200">Kata Sandi Admin</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan kata sandi" className="mt-1.5 h-11 border-indigo-700 bg-indigo-950 text-white placeholder:text-indigo-500" />
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}
