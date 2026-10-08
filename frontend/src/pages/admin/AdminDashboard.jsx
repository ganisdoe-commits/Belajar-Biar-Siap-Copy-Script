import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Brain, ListChecks, PenLine, BarChart3, Loader2, Home } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { adminGetSubjects, getAdminToken, clearAdminToken } from "../../api";
import QuestionManager from "../../components/admin/QuestionManager";
import EssayManager from "../../components/admin/EssayManager";
import ResultsTable from "../../components/admin/ResultsTable";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSubjects = useCallback(() => {
    adminGetSubjects()
      .then((d) => {
        setSubjects(d);
        setSubjectId((prev) => prev || (d[0] && d[0].id) || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadSubjects();
  }, [navigate, loadSubjects]);

  const logout = () => { clearAdminToken(); navigate("/admin/login"); };
  const selected = subjects.find((s) => s.id === subjectId);

  return (
    <div className="min-h-screen bg-[#FFFEFB]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-indigo-100 bg-white px-5 py-3 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white"><Brain className="h-5 w-5" /></div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-indigo-950">Panel Admin</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Belajar Biar Pintar</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/")} className="border-indigo-200 font-semibold text-indigo-700"><Home className="mr-1.5 h-4 w-4" /> Situs</Button>
          <Button variant="outline" onClick={logout} className="border-indigo-200 font-semibold text-indigo-700"><LogOut className="mr-1.5 h-4 w-4" /> Keluar</Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat...</div>
        ) : (
          <Tabs defaultValue="pg" className="w-full">
            <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="pg"><ListChecks className="mr-1.5 h-4 w-4" /> Soal PG</TabsTrigger>
              <TabsTrigger value="esai"><PenLine className="mr-1.5 h-4 w-4" /> Esai</TabsTrigger>
              <TabsTrigger value="hasil"><BarChart3 className="mr-1.5 h-4 w-4" /> Hasil</TabsTrigger>
            </TabsList>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">Mata Ujian:</span>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="w-[320px]"><SelectValue placeholder="Pilih mata ujian" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} · {s.totalQuestions} PG / {s.essayCount} esai</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="pg">
              {selected ? <QuestionManager subjectId={subjectId} onChanged={loadSubjects} /> : <p className="text-slate-500">Pilih mata ujian.</p>}
            </TabsContent>
            <TabsContent value="esai">
              {selected ? <EssayManager subjectId={subjectId} onChanged={loadSubjects} /> : <p className="text-slate-500">Pilih mata ujian.</p>}
            </TabsContent>
            <TabsContent value="hasil">
              <ResultsTable />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
