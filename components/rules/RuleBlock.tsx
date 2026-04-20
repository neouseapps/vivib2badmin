"use client";
import { useEffect, useRef, useState } from "react";
import type { ConditionItem, LogicalConnector, RuleBlock as RuleT } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";
import { GripVertical, Copy, Trash2, ChevronDown, Power, MoreHorizontal } from "lucide-react";
import { ConditionBuilder } from "./ConditionBuilder";
import { FormulaInput } from "./FormulaInput";

interface Props {
  rule: RuleT;
  onChange: (patch: Partial<RuleT>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  color: string;
  dragHandleListeners?: Record<string, unknown>;
  dragHandleAttributes?: Record<string, unknown>;
}

const SECTION_LABEL = "text-[10px] font-bold tracking-widest uppercase";

export function RuleBlock({ rule, onChange, onDuplicate, onDelete, color, dragHandleListeners, dragHandleAttributes }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);
  const minScoreErr = rule.minScore < 0 || rule.minScore > 100;
  const maxScoreErr = rule.maxScore < 0 || rule.maxScore > 100 || rule.maxScore < rule.minScore;

  const conditionCount = (rule.conditions ?? []).length;
  const hasSummary = conditionCount > 0 || rule.formula;

  return (
    <div className={cn("card overflow-hidden", !rule.active && "opacity-60")}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-bg-lv2/50">
        <button
          {...dragHandleListeners}
          {...dragHandleAttributes}
          className="cursor-grab active:cursor-grabbing shrink-0 touch-none p-0.5 -mx-0.5 rounded hover:bg-bg-lv3 text-ink-4 hover:text-ink-2 transition-colors"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>
        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
        <span className="text-body-sm font-semibold text-ink-1 flex-1 min-w-0 truncate">{rule.name}</span>
        {/* Active toggle */}
        <button
          onClick={() => onChange({ active: !rule.active })}
          title={rule.active ? "Tắt rule" : "Bật rule"}
          className={cn(
            "p-1.5 rounded-lg transition-colors shrink-0",
            rule.active
              ? "text-success bg-success/10 hover:bg-success/20"
              : "text-ink-4 bg-bg-lv3 hover:bg-bg-lv3"
          )}
        >
          <Power size={14} />
        </button>

        {/* More menu */}
        <div className="relative shrink-0">
          <button
            ref={menuBtnRef}
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1 rounded hover:bg-bg-lv3 text-ink-3"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-line bg-white shadow-lv2 py-1 overflow-hidden"
            >
              <button
                onClick={() => { onDuplicate(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 h-8 text-cap-md text-ink-1 hover:bg-bg-lv3 transition-colors"
              >
                <Copy size={13} className="text-ink-3" />Nhân bản
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (window.confirm(`Xóa rule "${rule.name}"?`)) onDelete();
                }}
                className="w-full flex items-center gap-2 px-3 h-8 text-cap-md text-danger hover:bg-danger-light transition-colors"
              >
                <Trash2 size={13} />Xóa rule
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 rounded hover:bg-bg-lv3 text-ink-3 shrink-0 transition-transform"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <ChevronDown size={14} className={cn("transition-transform duration-200", collapsed && "-rotate-90")} />
        </button>
      </div>

      {/* ── Collapsed summary ── */}
      {collapsed && hasSummary && (
        <div className="px-4 py-2 flex items-center gap-3 flex-wrap">
          {conditionCount > 0 && (
            <span className="chip bg-bg-lv3 text-ink-3">
              {conditionCount} điều kiện · {rule.conditionConnector ?? "AND"}
            </span>
          )}
          {rule.formula && (
            <span className="text-cap-md font-mono text-ink-3 truncate max-w-[260px]">{rule.formula}</span>
          )}
          <span className="chip bg-bg-lv3 text-ink-4 ml-auto">
            {rule.minScore}–{rule.maxScore}
          </span>
        </div>
      )}

      <div className={cn("divide-y divide-line", collapsed && "hidden")}>
        {/* ── Part A: Condition ── */}
        <div className="px-4 py-3 flex gap-4">
          <span className={cn(SECTION_LABEL, "text-ink-3 w-20 shrink-0 pt-2")}>Điều kiện</span>
          <div className="flex-1 min-w-0">
            <ConditionBuilder
              conditions={rule.conditions ?? []}
              connector={rule.conditionConnector ?? "AND"}
              onChange={(conditions: ConditionItem[], connector: LogicalConnector) =>
                onChange({ conditions, conditionConnector: connector })
              }
            />
          </div>
        </div>

        {/* ── Part B: Formula ── */}
        <div className="px-4 py-3 flex gap-4">
          <span className={cn(SECTION_LABEL, "text-ink-3 w-20 shrink-0 pt-2")}>Biểu thức</span>
          <div className="flex-1 min-w-0 space-y-1.5">
            <FormulaInput
              value={rule.formula ?? ""}
              onChange={(formula) => onChange({ formula })}
            />
            <p className="text-cap text-ink-4">
              Dùng <span className="font-mono text-[#135b96]">FN()</span> cho hàm,{" "}
              <span className="font-mono text-[#7d3c98]">@lead.field</span> cho biến. Gõ <kbd className="bg-bg-lv3 px-1 rounded text-ink-2">@</kbd> để xem gợi ý.
            </p>
          </div>
        </div>

        {/* ── Part C: Constraint ── */}
        <div className="px-4 py-3 flex gap-4">
          <span className={cn(SECTION_LABEL, "text-ink-3 w-20 shrink-0 pt-2")}>Ràng buộc</span>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-cap text-ink-3">Min Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rule.minScore ?? 0}
                  onChange={(e) => onChange({ minScore: Number(e.target.value) })}
                  className={cn("input h-8 text-cap-md font-mono", minScoreErr && "border-danger ring-1 ring-danger/40")}
                />
              </div>
              <span className="text-ink-3 mt-4">—</span>
              <div className="flex-1 space-y-1">
                <label className="text-cap text-ink-3">Max Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={rule.maxScore ?? 100}
                  onChange={(e) => onChange({ maxScore: Number(e.target.value) })}
                  className={cn("input h-8 text-cap-md font-mono", maxScoreErr && "border-danger ring-1 ring-danger/40")}
                />
              </div>
            </div>
            {maxScoreErr && (
              <p className="text-cap text-danger">Max Score phải ≥ Min Score và trong khoảng [0, 100].</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
