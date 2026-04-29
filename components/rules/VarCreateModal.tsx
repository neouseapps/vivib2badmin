"use client";
import { useState } from "react";
import type { CustomVariable, VarType } from "@/lib/scoring/types";
import { useScoring } from "@/lib/store/scoring-store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { X, Plus, Trash2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function VarCreateModal({ onClose }: Props) {
  const addVariable = useScoring((s) => s.addVariable);
  const existingVars = useScoring((s) => s.customVariables);

  const [name, setName] = useState("");
  const [varType, setVarType] = useState<VarType>("array");
  const [arrayText, setArrayText] = useState("");
  const [dictRows, setDictRows] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [error, setError] = useState("");

  const nameInvalid = !/^[a-zA-Z_]\w*$/.test(name) && name.length > 0;
  const nameDup = existingVars.some((v) => v.name === name);

  function handleSave() {
    if (!name.trim()) { setError("Tên biến không được rỗng."); return; }
    if (nameInvalid) { setError("Tên chỉ dùng chữ cái, số và dấu gạch dưới, không bắt đầu bằng số."); return; }
    if (nameDup) { setError("Tên biến đã tồn tại."); return; }

    const newVar: CustomVariable = {
      id: `var-${Date.now()}`,
      name,
      varType,
      arrayData: varType === "array"
        ? arrayText.split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
      dictData: varType === "dictionary"
        ? dictRows.filter((r) => r.key.trim())
        : [],
    };
    addVariable(newVar);
    onClose();
  }

  function addDictRow() {
    setDictRows([...dictRows, { key: "", value: "" }]);
  }

  function updateDictRow(i: number, field: "key" | "value", val: string) {
    setDictRows(dictRows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  function removeDictRow(i: number) {
    setDictRows(dictRows.filter((_, idx) => idx !== i));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <span className="text-body font-semibold text-ink-1">Tạo biến mới</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-bg-lv3 text-ink-3">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-cap-md font-semibold text-ink-2">Tên biến</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="vd: sector_whitelist"
              className={cn("input", (nameInvalid || nameDup) && "border-danger")}
              autoFocus
            />
            {(nameInvalid || nameDup) && (
              <p className="text-cap text-danger">{nameDup ? "Tên biến đã tồn tại." : "Tên không hợp lệ."}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-cap-md font-semibold text-ink-2">Loại</label>
            <div className="flex gap-2">
              {(["array", "dictionary"] as VarType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setVarType(t)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-cap-md font-semibold transition-colors",
                    varType === t ? "bg-ink-1 text-white border-ink-1" : "bg-white text-ink-2 border-line hover:border-ink-2"
                  )}
                >
                  {t === "array" ? "Array [ ]" : "Dictionary { }"}
                </button>
              ))}
            </div>
          </div>

          {/* Array editor */}
          {varType === "array" && (
            <div className="space-y-1">
              <label className="text-cap-md font-semibold text-ink-2">Giá trị (mỗi dòng 1 giá trị)</label>
              <textarea
                value={arrayText}
                onChange={(e) => setArrayText(e.target.value)}
                rows={5}
                className="input w-full font-mono text-cap-md resize-none"
                placeholder={"Accommodation\nF&B\nTour"}
              />
              <p className="text-cap text-ink-4">{arrayText.split("\n").filter((s) => s.trim()).length} giá trị</p>
            </div>
          )}

          {/* Dictionary editor */}
          {varType === "dictionary" && (
            <div className="space-y-2">
              <label className="text-cap-md font-semibold text-ink-2">Cặp Key → Value</label>
              <div className="space-y-1.5">
                {dictRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={row.key}
                      onChange={(e) => updateDictRow(i, "key", e.target.value)}
                      placeholder="key"
                      className="input h-8 text-cap-md flex-1 font-mono"
                    />
                    <span className="text-ink-3 text-cap shrink-0">→</span>
                    <input
                      value={row.value}
                      onChange={(e) => updateDictRow(i, "value", e.target.value)}
                      placeholder="value"
                      className="input h-8 text-cap-md flex-1 font-mono"
                    />
                    <button onClick={() => removeDictRow(i)} className="p-1 rounded hover:bg-danger-light text-ink-4 hover:text-danger shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addDictRow} className="flex items-center gap-1.5 text-cap-md text-ink-3 hover:text-ink-1 px-1 py-0.5">
                <Plus size={13} />Thêm dòng
              </button>
            </div>
          )}

          {error && <p className="text-cap text-danger">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-bg-lv2/40">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim() || nameInvalid || nameDup}>
            Lưu biến
          </Button>
        </div>
      </div>
    </div>
  );
}
