"use client";
import { useRef, useState, useEffect } from "react";
import { useScoring } from "@/lib/store/scoring-store";
import { LEAD_TREE, VAR_COLOR_MAP } from "@/lib/mock/config";
import type { ResourceNode } from "@/lib/scoring/types";

const FUNCTIONS = [
  "MAX", "MIN", "LOG10", "SUM", "MINUS", "LOGN", "TIME",
  "DIVIDE", "POWER", "FACTOR", "IF", "CASE",
  "GEO_DIST", "GEO_MIN_DIST", "MAP_VALUE",
];

const FN_SIGNATURES: Record<string, string> = {
  MAX: "MAX(a, b, ...)", MIN: "MIN(a, b, ...)", LOG10: "LOG10(x)", SUM: "SUM(a, b, ...)",
  MINUS: "MINUS(a, b)", LOGN: "LOGN(x, base)", TIME: "TIME(field)", DIVIDE: "DIVIDE(a, b)",
  POWER: "POWER(base, exp)", FACTOR: "FACTOR(n)", IF: "IF(cond, then, else)",
  CASE: "CASE(val, k1, v1, k2, v2, ...)", GEO_DIST: "GEO_DIST(lat1, lng1, lat2, lng2)",
  GEO_MIN_DIST: "GEO_MIN_DIST(lat, lng, list)", MAP_VALUE: 'MAP_VALUE(field, {"key": value, ...})',
};

function flattenTree(nodes: ResourceNode[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    if (n.type !== "dictionary" && n.type !== "array") out.push(n.key);
    if (n.children) out.push(...flattenTree(n.children));
  }
  return out;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightPlain(text: string): string {
  const fnPat = new RegExp(`\\b(${FUNCTIONS.join("|")})(?=\\s*\\()`, "g");
  const numPat = /\b\d+(\.\d+)?\b/g;
  const strPat = /"[^"]*"/g;
  const tokens: { start: number; end: number; type: string }[] = [];
  for (const [re, type] of [[strPat, "str"], [fnPat, "fn"], [numPat, "num"]] as [RegExp, string][]) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(text)) !== null)
      tokens.push({ start: m.index, end: m.index + m[0].length, type });
  }
  tokens.sort((a, b) => a.start - b.start);
  const merged: typeof tokens = [];
  for (const t of tokens)
    if (!merged.length || t.start >= merged[merged.length - 1].end) merged.push(t);
  let result = ""; let i = 0;
  for (const tok of merged) {
    result += escapeHtml(text.slice(i, tok.start));
    const c = tok.type === "fn" ? "#135b96" : tok.type === "num" ? "#d65800" : "#19674f";
    result += `<span style="color:${c};${tok.type === "fn" ? "font-weight:600;" : ""}">${escapeHtml(text.slice(tok.start, tok.end))}</span>`;
    i = tok.end;
  }
  return result + escapeHtml(text.slice(i));
}

function buildHtml(text: string): string {
  const varPat = /@[\w.]+/g;
  let result = ""; let last = 0; let m;
  while ((m = varPat.exec(text)) !== null) {
    if (m.index > last) result += highlightPlain(text.slice(last, m.index));
    const key = m[0].slice(1);
    const label = escapeHtml(key);
    const color = VAR_COLOR_MAP[key] ?? "#7d3c98";
    const chipStyle = `color:${color};background:${color}14;border:1px solid ${color}40;`;
    const delStyle = `color:${color};background:${color}26;`;
    result += `<span class="fi-var" contenteditable="false" data-var="${m[0]}" style="${chipStyle}">${label}<span class="fi-del" style="${delStyle}">×</span></span>`;
    last = m.index + m[0].length;
  }
  if (last < text.length) result += highlightPlain(text.slice(last));
  return result;
}

function extractFormula(el: HTMLElement): string {
  let result = "";
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += (child.textContent ?? "").replace(/\u200B/g, "");
    } else if (child instanceof HTMLElement) {
      const v = child.getAttribute("data-var");
      if (v) result += v;
      else if (child.tagName === "BR") result += "";
      else result += extractFormula(child);
    }
  }
  return result;
}

interface Props { value: string; onChange: (v: string) => void; }

export function FormulaInput({ value, onChange }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const lastExternal = useRef<string | null>(null);
  const [suggest, setSuggest] = useState<{ items: string[]; prefix: string } | null>(null);
  const [fnHint, setFnHint] = useState<string | null>(null);
  const customVariables = useScoring((s) => s.customVariables);
  const allVarKeys = [
    ...flattenTree(LEAD_TREE),
    ...customVariables.map((v) => `custom.${v.name}`),
  ];

  // Initial render
  useEffect(() => {
    if (divRef.current && lastExternal.current === null) {
      divRef.current.innerHTML = buildHtml(value) || "";
      lastExternal.current = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync from outside (skip if change came from our own input)
  useEffect(() => {
    if (divRef.current && value !== lastExternal.current) {
      divRef.current.innerHTML = buildHtml(value) || "";
      lastExternal.current = value;
    }
  }, [value]);

  function handleInput() {
    if (!divRef.current) return;
    const formula = extractFormula(divRef.current);
    lastExternal.current = formula;
    onChange(formula);

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.endContainer;
    if (node.nodeType !== Node.TEXT_NODE) { setSuggest(null); return; }
    const before = (node.textContent ?? "").replace(/\u200B/g, "").slice(0, range.endOffset);
    const atMatch = before.match(/@([\w.]*)$/);
    if (atMatch) {
      const prefix = atMatch[1];
      const items = allVarKeys.filter(k => k.toLowerCase().includes(prefix.toLowerCase())).slice(0, 8);
      setSuggest(items.length ? { items, prefix } : null);
      setFnHint(null);
    } else {
      setSuggest(null);
      const fnMatch = before.match(/\b([A-Z_]{2,})\s*$/);
      if (fnMatch && FUNCTIONS.includes(fnMatch[1])) setFnHint(FN_SIGNATURES[fnMatch[1]] ?? null);
      else setFnHint(null);
    }
  }

  function applySuggestion(item: string) {
    if (!divRef.current) return;
    setSuggest(null);
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const node = range.endContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;
    const text = (node.textContent ?? "").replace(/\u200B/g, "");
    const offset = range.endOffset;
    const atIdx = text.lastIndexOf("@", offset - 1);
    if (atIdx < 0) return;

    const before = text.slice(0, atIdx);
    const after = text.slice(offset);

    // Build chip element
    const color = VAR_COLOR_MAP[item] ?? "#7d3c98";
    const chip = document.createElement("span");
    chip.className = "fi-var";
    chip.contentEditable = "false";
    chip.setAttribute("data-var", `@${item}`);
    chip.style.cssText = `color:${color};background:${color}14;border:1px solid ${color}40;`;
    const del = document.createElement("span");
    del.className = "fi-del";
    del.style.cssText = `color:${color};background:${color}26;`;
    del.textContent = "×";
    chip.innerHTML = escapeHtml(item);
    chip.appendChild(del);

    const afterNode = document.createTextNode(after);
    const parent = node.parentNode!;
    node.textContent = before;
    parent.insertBefore(chip, node.nextSibling);
    parent.insertBefore(afterNode, chip.nextSibling);

    // Move cursor to start of afterNode
    const newRange = document.createRange();
    newRange.setStart(afterNode, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    const formula = extractFormula(divRef.current);
    lastExternal.current = formula;
    onChange(formula);
    divRef.current.focus();
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.classList.contains("fi-del")) {
      e.preventDefault();
      e.stopPropagation();
      const chip = target.closest("[data-var]") as HTMLElement | null;
      if (chip && divRef.current) {
        chip.remove();
        const formula = extractFormula(divRef.current);
        lastExternal.current = formula;
        onChange(formula);
        divRef.current.focus();
      }
    }
  }

  useEffect(() => {
    function dismiss(e: MouseEvent) {
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setSuggest(null); setFnHint(null);
      }
    }
    window.addEventListener("mousedown", dismiss);
    return () => window.removeEventListener("mousedown", dismiss);
  }, []);

  return (
    <div className="relative">
      <style>{`
        .fi-var {
          display: inline-flex;
          align-items: center;
          border-radius: 4px;
          padding: 0 5px;
          line-height: 18px;
          cursor: default;
          white-space: nowrap;
          user-select: none;
          vertical-align: baseline;
        }
        .fi-del {
          display: none;
          align-items: center;
          justify-content: center;
          margin-left: 2px;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
          cursor: pointer;
          flex-shrink: 0;
        }
        .fi-var:hover .fi-del { display: inline-flex; }
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #9e9e9e;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onInput={handleInput}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setSuggest(null); setFnHint(null); }
        }}
        data-placeholder="e.g. socialGravity(@lead.enrichment.rating, ...)"
        className="w-full font-mono text-cap-md px-3 py-2 rounded-lg border border-line bg-bg-lv2 focus:outline-none focus:ring-2 focus:ring-info/40 min-h-[44px]"
        style={{
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          fontSize: 12,
          lineHeight: "20px",
          color: "#212121",
          wordBreak: "break-all",
        }}
      />

      {fnHint && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-ink-1 text-white text-cap px-2.5 py-1.5 rounded-lg shadow-lv1 font-mono whitespace-nowrap">
          {fnHint}
        </div>
      )}

      {suggest && suggest.items.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-line rounded-lg shadow-lv1 min-w-[200px] overflow-hidden">
          {suggest.items.map((item) => (
            <button
              key={item}
              onMouseDown={(e) => { e.preventDefault(); applySuggestion(item); }}
              className="w-full text-left px-3 py-1.5 text-cap-md font-mono hover:bg-bg-lv3 text-ink-1 truncate"
            >
              <span style={{ color: "#7d3c98" }}>@</span>{item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
