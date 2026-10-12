// Mesin rumus sederhana untuk Lembar Kerja (tanpa eval). Gaya Excel Indonesia: pemisah argumen ";", desimal ",".
export const COLS = "ABCDEFGHIJ".split("");
export const ROWS = 30;

const ERR = (code) => ({ error: code });
const isErr = (v) => v && typeof v === "object" && "error" in v;

export function parseLiteral(raw) {
  const t = String(raw ?? "").trim();
  if (t === "") return null;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, "").replace(",", "."));
  const n = t.replace(",", ".");
  if (/^-?\d*\.?\d+%$/.test(n)) return Number(n.slice(0, -1)) / 100;
  if (/^-?\d*\.?\d+$/.test(n)) return Number(n);
  return t;
}

function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " ") { i++; continue; }
    const num = /^\d+([.,]\d+)?/.exec(src.slice(i));
    if (num && !/[A-Z]/i.test(src[i - 1] || "")) { out.push({ t: "num", v: Number(num[0].replace(",", ".")) }); i += num[0].length; continue; }
    const id = /^[A-Z]+\d*/i.exec(src.slice(i));
    if (id) { out.push({ t: "id", v: id[0].toUpperCase() }); i += id[0].length; continue; }
    if ("+-*/^()%:;,".includes(c)) { out.push({ t: c }); i++; continue; }
    throw new Error("token");
  }
  return out;
}

const FUNCS = {
  SUM: (xs) => xs.reduce((a, b) => a + b, 0),
  AVERAGE: (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : ERR("#DIV/0")),
  MIN: (xs) => (xs.length ? Math.min(...xs) : 0),
  MAX: (xs) => (xs.length ? Math.max(...xs) : 0),
  COUNT: (xs) => xs.length,
  ABS: (xs) => Math.abs(xs[0] ?? 0),
  ROUND: (xs) => { const p = 10 ** (xs[1] ?? 0); return Math.round((xs[0] ?? 0) * p) / p; },
  ROUNDDOWN: (xs) => { const p = 10 ** (xs[1] ?? 0); return Math.trunc((xs[0] ?? 0) * p) / p; },
  ROUNDUP: (xs) => { const p = 10 ** (xs[1] ?? 0); const v = (xs[0] ?? 0) * p; return (v < 0 ? Math.floor(v) : Math.ceil(v)) / p; },
};

function expandRange(a, b) {
  const pa = /^([A-Z]+)(\d+)$/.exec(a), pb = /^([A-Z]+)(\d+)$/.exec(b);
  if (!pa || !pb) throw new Error("ref");
  const c1 = COLS.indexOf(pa[1]), c2 = COLS.indexOf(pb[1]);
  if (c1 < 0 || c2 < 0) throw new Error("ref");
  const ids = [];
  for (let r = Math.min(+pa[2], +pb[2]); r <= Math.max(+pa[2], +pb[2]); r++)
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) ids.push(COLS[c] + r);
  return ids;
}

export function evaluateCell(id, cells, stack = []) {
  const raw = cells[id];
  if (raw === undefined || raw === "") return null;
  if (!String(raw).startsWith("=")) return parseLiteral(raw);
  if (stack.includes(id)) return ERR("#CIRC");
  try {
    const toks = tokenize(String(raw).slice(1));
    let p = 0;
    const peek = () => toks[p];
    const eat = (t) => { if (toks[p]?.t !== t) throw new Error("syntax"); return toks[p++]; };
    const ref = (cid) => {
      if (!/^[A-J]([1-9]|[12]\d|30)$/.test(cid)) throw new Error("ref");
      const v = evaluateCell(cid, cells, [...stack, id]);
      if (isErr(v)) throw v;
      if (v === null) return 0;
      if (typeof v !== "number") throw ERR("#VALUE");
      return v;
    };
    const values = (cid) => {
      const v = evaluateCell(cid, cells, [...stack, id]);
      if (isErr(v)) throw v;
      return typeof v === "number" ? [v] : [];
    };
    const primary = () => {
      const tk = peek();
      if (!tk) throw new Error("syntax");
      if (tk.t === "num") { p++; return tk.v; }
      if (tk.t === "(") { p++; const v = expr(); eat(")"); return v; }
      if (tk.t === "id") {
        p++;
        if (peek()?.t === "(") {
          const fn = FUNCS[tk.v];
          if (!fn) throw ERR("#NAME");
          p++;
          const args = [];
          while (peek() && peek().t !== ")") {
            if (peek().t === "id" && toks[p + 1]?.t === ":") {
              const a = toks[p].v; p += 2; const b = eat("id").v;
              expandRange(a, b).forEach((c) => args.push(...values(c)));
            } else args.push(expr());
            if (peek()?.t === ";" || peek()?.t === ",") p++;
          }
          eat(")");
          const r = fn(args);
          if (isErr(r)) throw r;
          return r;
        }
        return ref(tk.v);
      }
      throw new Error("syntax");
    };
    const postfix = () => { let v = primary(); while (peek()?.t === "%") { p++; v /= 100; } return v; };
    const unary = () => {
      if (peek()?.t === "-") { p++; return -unary(); }
      if (peek()?.t === "+") { p++; return unary(); }
      return postfix();
    };
    const power = () => { let v = unary(); while (peek()?.t === "^") { p++; v = v ** unary(); } return v; };
    const term = () => {
      let v = power();
      while (peek()?.t === "*" || peek()?.t === "/") {
        const op = toks[p++].t; const r = power();
        if (op === "/" && r === 0) throw ERR("#DIV/0");
        v = op === "*" ? v * r : v / r;
      }
      return v;
    };
    const expr = () => {
      let v = term();
      while (peek()?.t === "+" || peek()?.t === "-") { const op = toks[p++].t; const r = term(); v = op === "+" ? v + r : v - r; }
      return v;
    };
    const v = expr();
    if (p !== toks.length) throw new Error("syntax");
    return Number.isFinite(v) ? v : ERR("#NUM");
  } catch (e) {
    if (isErr(e)) return e;
    return ERR(e.message === "ref" ? "#REF" : "#ERR");
  }
}

export function displayValue(v) {
  if (v === null) return "";
  if (isErr(v)) return v.error;
  if (typeof v === "number") return v.toLocaleString("id-ID", { maximumFractionDigits: 6 });
  return v;
}
