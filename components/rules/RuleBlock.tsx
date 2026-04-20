"use client";
import { useState } from "react";
import type { ConditionItem, LogicalConnector, RuleBlock as RuleT } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";
import { GripVertical, Copy, Trash2, Zap, ChevronUp, ChevronDown, Power } from "lucide-react";
import { ConditionBuilder } from "./ConditionBuilder";
import { FormulaInput } from "./FormulaInput";

interface Props {
  rule: RuleT;
  onChange: (patch: Partial<RuleT>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canUp: boolean;
  canDown: boolean;
  color: string;
}

const SECTION_LABEL = "text-[10px] font-bold tracking-widest uppercase";

export function RuleBlock({ rule, onChange, onDuplicate, onDelete, onMoveUp, onMoveDown, canUp, canDown, color }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const minScoreErr = rule.minScore < 0 || rule.minScore > 100;
  const maxScoreErr = rule.maxScore < 0 || rule.maxScore > 100 || rule.maxScore < rule.minScore;

  const conditionCount = (rule.conditions ?? []).length;
  const hasSummary = conditionCount > 0 || rule.formula;

  return (
    <div className={cn("card overflow-hidden", !rule.active && "opacity-60")}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-bg-lv2/50">
        <div className="flex flex-col shrink-0">
          <button onClick={onMoveUp} disabled={!canUp} className="text-ink-4 hover:text-ink-1 disabled:opacity-25 leading-none py-0.5">
            <ChevronUp size={12} />
          </button>
          <button onClick={onMoveDown} disabled={!canDown} className="text-ink-4 hover:text-ink-1 disabled:opacity-25 leading-none py-0.5">
            <ChevronDown size={12} />
          </button>
        </div>
        <GripVertical size={14} className="text-ink-4 shrink-0" />
        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
        <span className="text-body-sm font-semibold text-ink-1 flex-1 min-w-0 truncate">{rule.name}</span>
        <span className="chip bg-info-light text-info shrink-0">
          <Zap size={10} />Source: API
        </span>

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

        <button onClick={onDuplicate} className="p-1 rounded hover:bg-bg-lv3 text-ink-3 shrink-0">
          <Copy size={13} />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-danger-light text-danger shrink-0">
          <Trash2 size={13} />
        </button>
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
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn(SECTION_LABEL, "text-ink-3")}>A — Điều kiện</span>
            <div className="inline-flex rounded border border-line overflow-hidden">
              <button
                onClick={() => onChange({ conditionMode: "visual" })}
                className={cn(
                  "px-2.5 h-6 text-cap font-semibold transition-colors",
                  rule.conditionMode === "visual" ? "bg-ink-1 text-white" : "bg-white text-ink-3 hover:text-ink-1"
                )}
              >
                Visual
              </button>
              <button
                onClick={() => onChange({ conditionMode: "code" })}
                className={cn(
                  "px-2.5 h-6 text-cap font-semibold transition-colors",
                  rule.conditionMode === "code" ? "bg-ink-1 text-white" : "bg-white text-ink-3 hover:text-ink-1"
                )}
              >
                Code
              </button>
            </div>
          </div>

          {rule.conditionMode === "visual" ? (
            <ConditionBuilder
              conditions={rule.conditions ?? []}
              connector={rule.conditionConnector ?? "AND"}
              onChange={(conditions: ConditionItem[], connector: LogicalConnector) =>
                onChange({ conditions, conditionConnector: connector })
              }
            />
          ) : (
            <textarea
              value={rule.conditionCode ?? ""}
              onChange={(e) => onChange({ conditionCode: e.target.value })}
              rows={3}
              spellCheck={false}
              className="w-full font-mono text-cap-md px-3 py-2 rounded-lg border border-line bg-bg-lv2 focus:outline-none focus:ring-2 focus:ring-info/40 resize-none leading-5"
              style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}
              placeholder="e.g. lead.rating >= 4.0 AND lead.reviewCount >= 50"
            />
          )}
        </div>

        {/* ── Part B: Formula ── */}
        <div className="px-4 py-3 space-y-2">
          <span className={cn(SECTION_LABEL, "text-ink-3")}>B — Biểu thức tính điểm</span>
          <FormulaInput
            value={rule.formula ?? ""}
            onChange={(formula) => onChange({ formula })}
          />
          <p className="text-cap text-ink-4">
            Dùng <span className="font-mono text-[#135b96]">FN()</span> cho hàm,{" "}
            <span className="font-mono text-[#7d3c98]">@lead.field</span> cho biến. Gõ <kbd className="bg-bg-lv3 px-1 rounded text-ink-2">@</kbd> để xem gợi ý.
          </p>
        </div>

        {/* ── Part C: Constraint ── */}
        <div className="px-4 py-3 space-y-2">
          <span className={cn(SECTION_LABEL, "text-ink-3")}>C — Ràng buộc đầu ra</span>
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
  );
}
