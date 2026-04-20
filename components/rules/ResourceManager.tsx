"use client";
import { useState, useRef, useEffect } from "react";
import type { ResourceNode } from "@/lib/scoring/types";
import { LEAD_TREE, GROUP_COLORS } from "@/lib/mock/config";
import { useScoring } from "@/lib/store/scoring-store";
import { VarCreateModal } from "./VarCreateModal";
import { ImportVarModal } from "./ImportVarModal";
import { cn } from "@/lib/cn";
import {
  Copy, Trash2, Plus, Upload, CheckCircle2, Database, ChevronDown, FilePlus,
} from "lucide-react";


// ── Build flat grouped list from tree ────────────────────────────────────────
function buildGroups(nodes: ResourceNode[]): { group: string; items: { key: string; label: string; type: string }[] }[] {
  const groups: ReturnType<typeof buildGroups> = [];
  function collect(node: ResourceNode, items: (typeof groups)[0]["items"]) {
    if (node.type !== "dictionary" && node.type !== "array") items.push({ key: node.key, label: node.label, type: node.type });
    node.children?.forEach((c) => collect(c, items));
  }
  for (const top of nodes) {
    const hasDictChild = top.children?.some((c) => c.type === "dictionary" || c.type === "array");
    if (hasDictChild) {
      for (const child of top.children ?? []) {
        if (child.type === "dictionary" || child.type === "array") {
          const items: (typeof groups)[0]["items"] = [];
          child.children?.forEach((l) => collect(l, items));
          if (items.length) groups.push({ group: `${top.label} · ${child.label}`, items });
        } else {
          const ex = groups.find((g) => g.group === top.label);
          const item = { key: child.key, label: child.label, type: child.type };
          if (ex) ex.items.push(item); else groups.push({ group: top.label, items: [item] });
        }
      }
    } else {
      const items: (typeof groups)[0]["items"] = [];
      top.children?.forEach((l) => collect(l, items));
      if (items.length) groups.push({ group: top.label, items });
    }
  }
  return groups;
}

const FIELD_GROUPS = buildGroups(LEAD_TREE);

// ── Single variable row ───────────────────────────────────────────────────────
function VarRow({ keyPath, label, color }: { keyPath: string; label: string; color: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(`@${keyPath}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); });
  }
  return (
    <button
      onClick={copy}
      className="group w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-bg-lv3 transition-colors text-left"
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-px" style={{ background: color }} />
      <span className="text-cap-md font-mono text-ink-2 truncate flex-1">{label}</span>
      {copied
        ? <CheckCircle2 size={11} className="text-success shrink-0" />
        : <Copy size={11} className="text-ink-4 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
      }
    </button>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function ResourceManager() {
  const customVariables = useScoring((s) => s.customVariables);
  const deleteVariable = useScoring((s) => s.deleteVariable);
  const rules = useScoring((s) => s.rules);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const dropRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  function openDrop() {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setDropOpen((o) => !o);
  }

  useEffect(() => {
    if (!dropOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropOpen]);

  function handleDelete(id: string, name: string) {
    const referenced = rules.some((r) => (r.formula ?? "").includes(name));
    if (referenced) {
      if (!window.confirm(`Biến "${name}" đang được dùng trong formula. Xóa thật sự?`)) return;
    }
    deleteVariable(id);
  }

  return (
    <div className="space-y-4">
      <div className="text-cap-md font-bold text-ink-2 uppercase tracking-wider px-1">Resource Manager</div>

      {/* Lead Data Dictionary — includes custom variables as the last group */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-1 py-1 rounded text-ink-1">
          <Database size={13} className="text-ink-3 shrink-0" />
          <span className="text-cap-md font-semibold truncate flex-1">Lead Data Dictionary</span>
        </div>

        <div className="ml-1 space-y-3">
          {/* Static groups from LEAD_TREE */}
          {FIELD_GROUPS.map((g, gi) => {
            const groupColor = GROUP_COLORS[gi % GROUP_COLORS.length];
            return (
              <div key={g.group}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-4 px-2 pb-0.5">{g.group}</div>
                {g.items.map((item) => (
                  <VarRow key={item.key} keyPath={item.key} label={item.label} color={groupColor} />
                ))}
              </div>
            );
          })}

          {/* Custom Variables group */}
          <div>
            <div className="flex items-center gap-1 px-2 pb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4 flex-1">Custom Variables</span>
              <div ref={anchorRef} className="inline-flex rounded border border-info/40 overflow-hidden text-cap font-semibold">
                <button
                  onClick={() => { setShowCreate(true); setDropOpen(false); }}
                  className="flex items-center gap-1 text-info bg-info-light hover:bg-info/20 px-1.5 h-5 transition-colors"
                >
                  <Plus size={10} />Thêm
                </button>
                <div className="w-px bg-info/20" />
                <button
                  onClick={openDrop}
                  className="flex items-center px-1 h-5 text-info bg-info-light hover:bg-info/20 transition-colors"
                >
                  <ChevronDown size={10} className={cn("transition-transform", dropOpen && "rotate-180")} />
                </button>
              </div>
            </div>

            {customVariables.length > 0 && (
              <div className="space-y-1 mt-1">
                {customVariables.map((v) => (
                  <div
                    key={v.id}
                    className="group flex items-center gap-2 px-2 py-1 rounded hover:bg-bg-lv3 transition-colors"
                  >
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1 py-0.5 rounded shrink-0 leading-none",
                        v.varType === "array" ? "bg-info-light text-info" : "bg-warn-light text-warn-text"
                      )}
                    >
                      {v.varType === "array" ? "[ ]" : "{ }"}
                    </span>
                    <span className="text-cap-md font-mono text-ink-2 flex-1 truncate">{v.name}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => navigator.clipboard.writeText(`@custom.${v.name}`)}
                        className="p-0.5 rounded hover:bg-bg-lv3 text-ink-4 hover:text-ink-1"
                        title="Copy @key"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.name)}
                        className="p-0.5 rounded hover:bg-danger-light text-ink-4 hover:text-danger"
                        title="Xóa biến"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && <VarCreateModal onClose={() => setShowCreate(false)} />}
      {showImport && <ImportVarModal onClose={() => setShowImport(false)} />}

      {dropOpen && (
        <div
          ref={dropRef}
          style={{ position: "fixed", top: dropPos.top, right: dropPos.right, zIndex: 9999 }}
          className="w-48 rounded-lg border border-line bg-white shadow-lv2 py-1 overflow-hidden"
        >
          <button
            onClick={() => { setShowCreate(true); setDropOpen(false); }}
            className="w-full flex items-center gap-2 px-3 h-8 text-cap-md text-ink-1 hover:bg-bg-lv3 transition-colors"
          >
            <FilePlus size={13} className="text-info" />Tạo biến mới
          </button>
          <button
            onClick={() => { setShowImport(true); setDropOpen(false); }}
            className="w-full flex items-center gap-2 px-3 h-8 text-cap-md text-ink-1 hover:bg-bg-lv3 transition-colors"
          >
            <Upload size={13} className="text-ink-3" />Import từ JSON / CSV
          </button>
        </div>
      )}
    </div>
  );
}
