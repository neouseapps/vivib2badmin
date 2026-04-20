"use client";
import { useRef, useState } from "react";
import type { SurveyCriterion, SurveyConfig, SurveyOption } from "@/lib/scoring/types";
import { Trash2, Plus, EyeOff, GripVertical, Power, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  survey: SurveyConfig;
  isAdmin: boolean;
  onUpdateCriterion: (id: string, patch: Partial<SurveyCriterion>) => void;
  onDeleteCriterion: (id: string) => void;
  onToggleCriterion: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export function PingTestBuilder({
  survey,
  isAdmin,
  onUpdateCriterion,
  onDeleteCriterion,
  onToggleCriterion,
  onReorder,
}: Props) {
  const dragFrom = useRef<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateOpt(critId: string, optId: string, patch: Partial<SurveyOption>) {
    const crit = survey.criteria.find((c) => c.id === critId);
    if (!crit) return;
    onUpdateCriterion(critId, {
      options: crit.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)),
    });
  }

  function addOpt(critId: string) {
    const crit = survey.criteria.find((c) => c.id === critId);
    if (!crit) return;
    onUpdateCriterion(critId, {
      options: [...crit.options, { id: `o-${Date.now()}`, label: "Tuỳ chọn mới", achievement: 0 }],
    });
  }

  function removeOpt(critId: string, optId: string) {
    const crit = survey.criteria.find((c) => c.id === critId);
    if (!crit) return;
    onUpdateCriterion(critId, {
      options: crit.options.filter((o) => o.id !== optId),
    });
  }

  return (
    <div className="space-y-4">

      {survey.criteria.map((c, idx) => (
        <div
          key={c.id}
          draggable
          onDragStart={() => { dragFrom.current = idx; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragFrom.current !== null && dragFrom.current !== idx) {
              onReorder(dragFrom.current, idx);
              dragFrom.current = null;
            }
          }}
          className={cn(
            "card p-4 transition-opacity",
            !c.active && "opacity-60"
          )}
        >
          {/* Header row */}
          <div className={cn("flex items-center gap-2", !collapsed.has(c.id) && "mb-3")}>
            {/* Drag handle */}
            <GripVertical size={16} className="text-ink-4 cursor-grab shrink-0" />

            {/* Color swatch */}
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: c.color }}
            />

            {/* Name input */}
            <input
              value={c.name}
              onChange={(e) => onUpdateCriterion(c.id, { name: e.target.value })}
              className="input flex-1 font-semibold text-ink-1 h-8 text-body"
              placeholder="Tên tiêu chí"
            />

            {/* Weight badge */}
            <span className={cn(
              "chip font-mono text-cap-md shrink-0",
              c.active ? "bg-bg-lv3 text-ink-2" : "bg-bg-lv2 text-ink-4"
            )}>
              {c.active ? `${c.weight}%` : "Tắt"}
            </span>

            {/* Toggle active */}
            <button
              onClick={() => onToggleCriterion(c.id)}
              title={c.active ? "Tắt tiêu chí" : "Bật tiêu chí"}
              className={cn(
                "p-1.5 rounded-lg transition-colors shrink-0",
                c.active
                  ? "text-success bg-success/10 hover:bg-success/20"
                  : "text-ink-4 bg-bg-lv3 hover:bg-bg-lv4"
              )}
            >
              <Power size={14} />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDeleteCriterion(c.id)}
              className="p-1.5 rounded-lg text-danger hover:bg-danger-light shrink-0"
              title="Xoá tiêu chí"
            >
              <Trash2 size={14} />
            </button>

            {/* Collapse toggle */}
            <button
              onClick={() => toggleCollapse(c.id)}
              className="p-1.5 rounded-lg text-ink-3 hover:bg-bg-lv3 shrink-0"
              title={collapsed.has(c.id) ? "Mở rộng" : "Thu gọn"}
            >
              {collapsed.has(c.id) ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          {!collapsed.has(c.id) && (<>
          {/* Help text */}
          <label className="label mb-1 block">Hướng dẫn cho Sales Rep</label>
          <input
            value={c.help}
            onChange={(e) => onUpdateCriterion(c.id, { help: e.target.value })}
            className="input mb-3"
            placeholder="Mô tả cách quan sát / đánh giá tiêu chí này..."
          />

          {/* Options */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-cap-md font-semibold text-ink-2">Tuỳ chọn trả lời</span>
          </div>

          <div className="space-y-1.5">
            {c.options.map((o) => (
              <div key={o.id} className={cn(
                "grid items-center gap-2",
                isAdmin ? "grid-cols-[1fr_auto_auto]" : "grid-cols-[1fr_auto]"
              )}>
                <input
                  value={o.label}
                  onChange={(e) => updateOpt(c.id, o.id, { label: e.target.value })}
                  className="input"
                  placeholder="Nhãn hiển thị cho Sales Rep"
                />
                {isAdmin && (
                  <div className="flex items-center gap-1 bg-bg-lv2 rounded-lg px-2 h-9 border border-line">
                    <input
                      type="number"
                      min={0}
                      max={c.weight}
                      value={Math.round(c.weight * o.achievement / 100)}
                      onChange={(e) => {
                        const pts = Math.max(0, Math.min(c.weight, Number(e.target.value)));
                        updateOpt(c.id, o.id, {
                          achievement: c.weight > 0 ? Math.round((pts / c.weight) * 100) : 0,
                        });
                      }}
                      className="w-10 bg-transparent focus:outline-none font-mono font-semibold text-ink-1 text-right"
                    />
                    <span className="text-cap text-ink-3">pt</span>
                  </div>
                )}
                <button
                  onClick={() => removeOpt(c.id, o.id)}
                  className="p-1 rounded hover:bg-danger-light text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => addOpt(c.id)}
            className="btn-ghost h-8 text-cap-md mt-2 text-info"
          >
            <Plus size={12} />Thêm tuỳ chọn
          </button>
          </>)}
        </div>
      ))}
    </div>
  );
}
