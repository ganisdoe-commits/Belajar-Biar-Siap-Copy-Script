import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Printer, Loader2, BookText } from "lucide-react";
import { Button } from "../ui/button";
import { adminGetPrototypeDoc } from "../../api";

export default function DocsViewer() {
  const [doc, setDoc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { adminGetPrototypeDoc().then(setDoc).catch(() => setFailed(true)); }, []);

  const download = () => {
    const url = URL.createObjectURL(new Blob([doc.content], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (failed) return <p data-testid="docs-error" className="text-sm font-semibold text-red-600">Dokumentasi gagal dimuat.</p>;
  if (!doc) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Memuat dokumentasi...</div>;

  return (
    <div data-testid="docs-viewer" className="rounded-2xl border border-indigo-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 px-6 py-4 print:hidden">
        <div className="flex items-center gap-2 font-extrabold text-indigo-950">
          <BookText className="h-5 w-5 text-indigo-600" /> {doc.filename}
          <span className="text-xs font-medium text-slate-400">· diperbarui {new Date(doc.updated_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
        </div>
        <div className="flex gap-2">
          <Button data-testid="docs-print-button" variant="outline" onClick={() => window.print()} className="border-indigo-200 font-semibold text-indigo-700"><Printer className="mr-1.5 h-4 w-4" /> Cetak / PDF</Button>
          <Button data-testid="docs-download-button" onClick={download} className="bg-indigo-700 font-bold hover:bg-indigo-900"><Download className="mr-1.5 h-4 w-4" /> Unduh .md</Button>
        </div>
      </div>
      <article data-testid="docs-content" className="md-doc px-6 py-6 lg:px-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
      </article>
    </div>
  );
}
