import React, { useState } from "react";

const BTNS = [
  "C", "±", "%", "÷",
  "7", "8", "9", "×",
  "4", "5", "6", "−",
  "1", "2", "3", "+",
  "0", ".", "=",
];

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const calc = (a, b, operator) => {
    switch (operator) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
      default: return b;
    }
  };

  const press = (b) => {
    if (b === "C") { setDisplay("0"); setPrev(null); setOp(null); setFresh(true); return; }
    if (b === "±") { setDisplay((d) => (parseFloat(d) * -1).toString()); return; }
    if (b === "%") { setDisplay((d) => (parseFloat(d) / 100).toString()); return; }
    if (["+", "−", "×", "÷"].includes(b)) {
      const cur = parseFloat(display);
      if (prev !== null && op && !fresh) {
        const res = calc(prev, cur, op);
        setPrev(res); setDisplay(String(res));
      } else {
        setPrev(cur);
      }
      setOp(b); setFresh(true); return;
    }
    if (b === "=") {
      if (op !== null && prev !== null) {
        const res = calc(prev, parseFloat(display), op);
        setDisplay(String(res)); setPrev(null); setOp(null); setFresh(true);
      }
      return;
    }
    if (b === ".") {
      if (fresh) { setDisplay("0."); setFresh(false); return; }
      if (!display.includes(".")) setDisplay(display + ".");
      return;
    }
    // digit
    if (fresh) { setDisplay(b); setFresh(false); }
    else setDisplay(display === "0" ? b : display + b);
  };

  return (
    <div className="w-full">
      <div className="mb-3 overflow-hidden rounded-xl bg-slate-900 px-4 py-4 text-right">
        <div className="truncate text-3xl font-bold text-white">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BTNS.map((b) => {
          const isOp = ["÷", "×", "−", "+", "="].includes(b);
          const isFn = ["C", "±", "%"].includes(b);
          return (
            <button
              key={b}
              onClick={() => press(b)}
              className={`h-12 rounded-lg text-lg font-bold transition-colors ${
                b === "0" ? "col-span-1" : ""
              } ${
                isOp
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : isFn
                  ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200"
              }`}
            >
              {b}
            </button>
          );
        })}
      </div>
    </div>
  );
}
