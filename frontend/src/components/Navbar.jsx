import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Brain } from "lucide-react";
import { Button } from "./ui/button";

const NAV_LINKS = [
  { label: "Beranda", to: "/" },
  { label: "Simulator", to: "/dashboard" },
  { label: "Mode Esai", to: "/esai" },
  { label: "Rapor", to: "/rapor" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-100 bg-[#FFFEFB]/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-sm shadow-indigo-700/30">
            <Brain className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-indigo-950">
              Belajar Biar Siap
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-600">
              Ujian Kompetensi Pajak
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-amber-500 font-bold text-indigo-950 shadow-sm shadow-amber-500/30 hover:bg-amber-400"
          >
            Mulai Simulasi
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-indigo-900 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-indigo-100 bg-[#FFFEFB] px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50"
              >
                {l.label}
              </Link>
            ))}
            <Button
              onClick={() => {
                setOpen(false);
                navigate("/dashboard");
              }}
              className="mt-2 bg-amber-500 font-bold text-indigo-950 hover:bg-amber-400"
            >
              Mulai Simulasi
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
