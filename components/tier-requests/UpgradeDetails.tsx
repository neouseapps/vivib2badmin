"use client";
import { useState } from "react";
import { CheckSquare, Square, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import type { UpgradeRequest, FacilityRef } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";


interface Props {
  details: UpgradeRequest;
  facility: FacilityRef;
}

export function UpgradeDetails({ details }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openMetric, setOpenMetric] = useState<string | null>(null);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const metrics = Object.values(details.systemChecklist);
  const passedCount = metrics.filter((m) => m.passed).length;
  const allPassed = passedCount === metrics.length;

  const completedCount = details.complianceItems.filter((item) => checked.has(item.id)).length;
  const allComplete = completedCount === details.complianceItems.length;

  return (
    <div className="space-y-6">
      {/* Section A — System verified metrics */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-cap-md font-semibold text-ink-3 uppercase tracking-wide">Chỉ số hệ thống (System-verified)</span>
          <span className={cn(
            "chip ml-auto text-cap-md font-semibold",
            allPassed ? "bg-success-light text-success" : "bg-danger-light text-danger"
          )}>
            {passedCount}/{metrics.length} tiêu chí đạt
          </span>
        </div>

        {/* Expandable accordion rows — each with its own progress bar */}
        <div className="flex flex-col gap-1">
          {metrics.map((m) => {
            const isOpen = openMetric === m.id;
            const pct = Math.round((m.score / m.threshold) * 100);
            return (
              <div key={m.id}>
                <button
                  onClick={() => setOpenMetric(isOpen ? null : m.id)}
                  className="w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg hover:bg-bg-lv3 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="flex-1 text-body text-ink-1">{m.label}</span>
                    <span className="text-body font-semibold text-ink-2 tabular-nums">{m.score}/{m.threshold}</span>
                    <span className={cn(
                      "text-cap-md font-medium w-12 text-right",
                      m.passed ? "text-success" : pct >= 80 ? "text-warn-text" : "text-danger"
                    )}>{pct}%</span>
                    <ChevronDown size={14} className={cn("text-ink-3 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
                  </div>
                  <div className="w-full h-1.5 bg-bg-lv3 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", m.passed ? "bg-success" : "bg-danger")}
                      style={{ width: `${Math.min(m.score, 100)}%` }}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div className={cn(
                    "mx-3 mb-2 rounded-lg border px-3 py-2 flex items-center gap-2",
                    m.passed ? "bg-success-light border-success/20" : "bg-danger-light/40 border-danger/20"
                  )}>
                    {m.passed ? (
                      <>
                        <CheckCircle2 size={14} className="text-success shrink-0" />
                        <span className="text-cap-md text-success">Chỉ số này đã đạt ngưỡng</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="text-danger shrink-0" />
                        <span className="text-cap-md text-danger">Cần thêm {m.threshold - m.score} điểm để đạt ngưỡng</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section B — Manual compliance checklist */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-cap-md font-semibold text-ink-3 uppercase tracking-wide">Kiểm tra thủ công (Admin)</span>
          <span className={cn(
            "chip ml-auto text-cap-md font-semibold",
            allComplete ? "bg-success-light text-success" : "bg-bg-lv3 text-ink-3"
          )}>
            {completedCount}/{details.complianceItems.length} hoàn thành
          </span>
        </div>
        <div className="card divide-y divide-line">
          {details.complianceItems.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left",
                  isChecked ? "bg-success-light/30 hover:bg-success-light/50" : "hover:bg-bg-lv2/60"
                )}
              >
                {isChecked
                  ? <CheckSquare size={18} className="text-success shrink-0" />
                  : <Square size={18} className="text-ink-4 shrink-0" />
                }
                <span className={cn("text-body flex-1", isChecked ? "line-through text-ink-3" : "text-ink-2")}>
                  {item.label}
                </span>
                {isChecked && <span className="text-cap text-success font-medium shrink-0">Đã xác nhận</span>}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
