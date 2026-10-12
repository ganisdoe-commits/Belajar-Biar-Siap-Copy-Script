import React, { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { regulationFileUrl } from "../../api";

function ExcelView({ url }) {
  const [book, setBook] = useState(null);
  const [sheet, setSheet] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [XLSX, buf] = await Promise.all([import("xlsx"), fetch(url).then((r) => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })]);
        const wb = XLSX.read(buf, { type: "array" });
        const sheets = wb.SheetNames.map((n) => ({ name: n, html: XLSX.utils.sheet_to_html(wb.Sheets[n], { header: "", footer: "" }) }));
        if (alive) setBook(sheets);
      } catch {
        if (alive) setError(true);
      }
    })();
    return () => { alive = false; };
  }, [url]);

  if (error) return <p className="p-8 text-center font-semibold text-red-600">File Excel gagal dibuka.</p>;
  if (!book) return <div className="flex items-center justify-center gap-2 p-10 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Membuka file Excel...</div>;
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-auto bg-white p-3">
        <div data-testid="excel-sheet" className="xlsx-view" dangerouslySetInnerHTML={{ __html: book[sheet].html }} />
      </div>
      <div className="flex shrink-0 gap-1 overflow-x-auto border-t border-slate-200 bg-slate-50 px-2 py-1.5">
        {book.map((s, i) => (
          <button key={s.name} data-testid={`excel-tab-${i}`} onClick={() => setSheet(i)}
            className={`whitespace-nowrap rounded px-3 py-1 text-xs font-semibold ${i === sheet ? "bg-white text-indigo-700 shadow" : "text-slate-600 hover:bg-white"}`}>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RegulationViewer({ doc, onClose }) {
  const url = regulationFileUrl(doc.id);
  return (
    <div data-testid="regulation-viewer" className="fixed inset-x-0 bottom-0 top-[52px] z-40 flex flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-2">
        <button data-testid="regulation-back-button" onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-1.5 text-sm font-bold text-white hover:bg-indigo-900">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Soal
        </button>
        <div className="min-w-0 flex-1 truncate text-sm font-bold text-indigo-950">{doc.title}</div>
        <a href={url} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline sm:inline-flex">
          Buka di tab baru <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="min-h-0 flex-1">
        {doc.kind === "pdf" ? (
          <iframe data-testid="regulation-pdf" title={doc.title} src={`${url}#view=FitH`} className="h-full w-full border-0" />
        ) : (
          <ExcelView url={url} />
        )}
      </div>
    </div>
  );
}
