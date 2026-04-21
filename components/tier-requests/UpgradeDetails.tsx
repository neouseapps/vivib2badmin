"use client";
import { useState } from "react";
import { CheckSquare, Square, CheckCircle2, XCircle } from "lucide-react";
import { GaugeChart } from "@/components/scoring/GaugeChart";
import type { UpgradeRequest, FacilityRef } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";

interface Props {
  details: UpgradeRequest;
  facility: FacilityRef;
}

export function UpgradeDetails({ details }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const metrics = Object.values(details.systemChecklist);

  return (
    <div className="space-y-6">
      {/* Section A — System verified metrics */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-cap-md font-semibold text-ink-3 uppercase tracking-wide">Chỉ số hệ thống (System-verified)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.id}
              className={cn(
                "card p-4 flex flex-col items-center gap-2",
                m.passed ? "border-success/30 bg-success-light/30" : "border-danger/30 bg-danger-light/30"
              )}
            >
              <GaugeChart
                value={m.score}
                max={100}
                label={m.label}
                sublabel={`Ngưỡng: ${m.threshold}`}
                color={m.passed ? "#19674f" : "#c0392b"}
                size={120}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-cap-md font-semibold",
                  m.passed ? "text-success" : "text-danger"
                )}
              >
                {m.passed
                  ? <><CheckCircle2 size={14} /> Đạt</>
                  : <><XCircle size={14} /> Chưa đạt</>
                }
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section B — Manual compliance checklist */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-cap-md font-semibold text-ink-3 uppercase tracking-wide">Kiểm tra thủ công (Admin)</span>
        </div>
        <div className="card divide-y divide-line">
          {details.complianceItems.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-lv2/60 transition-colors text-left"
              >
                {isChecked
                  ? <CheckSquare size={18} className="text-success shrink-0" />
                  : <Square size={18} className="text-ink-4 shrink-0" />
                }
                <span className={cn("text-body", isChecked ? "text-ink-1" : "text-ink-2")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
