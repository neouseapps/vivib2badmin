"use client";
import { useState } from "react";
import type { CustomVariable } from "@/lib/scoring/types";
import { useScoring } from "@/lib/store/scoring-store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

type ImportTab = "json" | "csv";

interface ParseResult {
  ok: boolean;
  varType: "array" | "dictionary";
  arrayData: string[];
  dictData: { key: string; value: string }[];
  preview: string;
  error?: string;
}

function parseJSON(raw: string): ParseResult {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const arrayData = parsed.map(String);
      return { ok: true, varType: "array", arrayData, dictData: [], preview: `Array · ${arrayData.length} phần tử` };
    }
    if (typeof parsed === "object" && parsed !== null) {
      const dictData = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
      return { ok: true, varType: "dictionary", arrayData: [], dictData, preview: `Dictionary · ${dictData.length} cặp` };
    }
    return { ok: false, varType: "array", arrayData: [], dictData: [], error: "JSON phải là array [] hoặc object {}", preview: "" };
  } catch (e: unknown) {
    return { ok: false, varType: "array", arrayData: [], dictData: [], error: `JSON không hợp lệ: ${e instanceof Error ? e.message : String(e)}`, preview: "" };
  }
}

function parseCSV(raw: string, hasHeader: boolean): ParseResult {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { ok: false, varType: "array", arrayData: [], dictData: [], preview: "", error: "Không có dữ liệu" };

  const rows = lines.map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
  const colCount = rows[0].length;

  if (colCount === 1) {
    const data = hasHeader ? rows.slice(1) : rows;
    const arrayData = data.map((r) => r[0]);
    return { ok: true, varType: "array", arrayData, dictData: [], preview: `Array · ${arrayData.length} phần tử` };
  }

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const dictData = dataRows.map((r) => ({ key: r[0] ?? "", value: r[1] ?? "" }));
  return { ok: true, varType: "dictionary", arrayData: [], dictData, preview: `Dictionary · ${dictData.length} cặp${hasHeader ? ` (header: ${rows[0].join(", ")})` : ""}` };
}

export function ImportVarModal({ onClose }: Props) {
  const addVariable = useScoring((s) => s.addVariable);
  const existingVars = useScoring((s) => s.customVariables);

  const [tab, setTab] = useState<ImportTab>("json");
  const [raw, setRaw] = useState("");
  const [name, setName] = useState("");
  const [hasHeader, setHasHeader] = useState(true);
  const [error, setError] = useState("");

  const parseResult: ParseResult | null = raw.trim()
    ? tab === "json" ? parseJSON(raw) : parseCSV(raw, hasHeader)
    : null;

  const nameDup = existingVars.some((v) => v.name === name);
  const nameInvalid = name.length > 0 && !/^[a-zA-Z_]\w*$/.test(name);

  function handleImport() {
    if (!name.trim()) { setError("Nhập tên biến."); return; }
    if (nameInvalid) { setError("Tên không hợp lệ."); return; }
    if (nameDup) { setError("Tên biến đã tồn tại."); return; }
    if (!parseResult?.ok) { setError("Dữ liệu chưa hợp lệ."); return; }

    const newVar: CustomVariable = {
      id: `var-${Date.now()}`,
      name,
      varType: parseResult.varType,
      arrayData: parseResult.arrayData,
      dictData: parseResult.dictData,
    };
    addVariable(newVar);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <span className="text-body font-semibold text-ink-1">Import biến từ dữ liệu</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-lv3 text-ink-3"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tab */}
          <div className="flex gap-1 p-1 bg-bg-lv3 rounded-lg w-fit">
            {(["json", "csv"] as ImportTab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setRaw(""); }}
                className={cn(
                  "px-4 h-7 rounded-md text-cap-md font-semibold transition-colors",
                  tab === t ? "bg-white text-ink-1 shadow-sm" : "text-ink-3 hover:text-ink-2"
                )}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Raw input */}
          <div className="space-y-1">
            <label className="text-cap-md font-semibold text-ink-2">
              {tab === "json" ? "Paste JSON (array [] hoặc object {})" : "Paste CSV"}
            </label>
            <textarea
              value={raw}
              onChange={(e) => { setRaw(e.target.value); setError(""); }}
              rows={6}
              spellCheck={false}
              className="input w-full font-mono text-cap-md resize-none"
              placeholder={tab === "json"
                ? '["Accommodation", "F&B", "Tour"]\n// hoặc {"Accommodation": 100, "F&B": 50}'
                : "sector,score\nAccommodation,100\nF&B,50"}
            />
          </div>

          {/* CSV options */}
          {tab === "csv" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="rounded" />
              <span className="text-cap-md text-ink-2">Dòng đầu là header</span>
            </label>
          )}

          {/* Parse preview */}
          {parseResult && (
            <div className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-cap-md",
              parseResult.ok ? "bg-success/10 text-success" : "bg-danger-light text-danger"
            )}>
              {parseResult.ok ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
              <span>{parseResult.ok ? parseResult.preview : parseResult.error}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-cap-md font-semibold text-ink-2">Tên biến</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="vd: sector_map"
              className={cn("input", (nameInvalid || nameDup) && "border-danger")}
            />
            {(nameInvalid || nameDup) && (
              <p className="text-cap text-danger">{nameDup ? "Tên đã tồn tại." : "Tên không hợp lệ."}</p>
            )}
          </div>

          {error && <p className="text-cap text-danger">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-bg-lv2/40">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={!name.trim() || nameInvalid || nameDup || !parseResult?.ok}
          >
            Import biến
          </Button>
        </div>
      </div>
    </div>
  );
}
