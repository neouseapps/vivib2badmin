"use client";
import { useState } from "react";
import { useScoring, getLeadDerived } from "@/lib/store/scoring-store";
import { GaugeChart } from "@/components/scoring/GaugeChart";
import { socialGravity, walletShare, ecosystemProximity } from "@/lib/scoring/formulas";
import { cn } from "@/lib/cn";
import { Cpu, CheckCircle2, MinusCircle } from "lucide-react";

const SUB_SCORES = [
  { key: "sg", label: "Social Gravity", color: "#135b96", weight: "50%" },
  { key: "ws", label: "Wallet Share", color: "#19674f", weight: "40%" },
  { key: "ep", label: "Ecosystem Proximity", color: "#d65800", weight: "10%" },
] as const;

export function SimulationPanel() {
  const leads = useScoring((s) => s.leads);
  const survey = useScoring((s) => s.survey);
  const matrix = useScoring((s) => s.matrix);
  const [id, setId] = useState(leads[0]?.id ?? "");

  const lead = leads.find((l) => l.id === id);
  const derived = lead ? getLeadDerived(lead, survey, matrix) : null;

  const sg = lead ? Math.round(socialGravity(lead.enrichment.rating, lead.enrichment.reviewCount)) : 0;
  const ws = lead ? walletShare(lead.sector) : 0;
  const ep = lead ? ecosystemProximity(lead.enrichment.distanceKm) : 0;

  const subScoreValues: Record<string, number> = { sg, ws, ep };
  const qualified = derived ? derived.axisAEff >= 70 : false;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-bg-lv2/60">
        <Cpu size={14} className="text-info" />
        <span className="text-cap-md font-semibold text-ink-2">Simulation</span>
        <span className="ml-auto chip bg-info-light text-info text-[10px] font-semibold tracking-wide">
          LIVE
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Lead selector */}
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="input text-cap-md h-8"
        >
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        {derived && lead && (
          <>
            {/* Gauge + meta */}
            <div className="flex items-center gap-4">
              <GaugeChart
                value={derived.axisAEff}
                label="Axis A"
                sublabel="dự kiến"
                color="#135b96"
                size={120}
              />
              <div className="space-y-1.5 text-cap-md text-ink-2 min-w-0">
                <MetaRow label="Rating" value={`${lead.enrichment.rating} ★`} />
                <MetaRow
                  label="Reviews"
                  value={lead.enrichment.reviewCount.toLocaleString("vi-VN")}
                />
                <MetaRow label="Sector" value={lead.sector} />
                <MetaRow label="Distance" value={`${lead.enrichment.distanceKm} km`} />
                {lead.campaignBoost > 0 && (
                  <MetaRow
                    label="Boost"
                    value={`+${lead.campaignBoost}`}
                    valueClass="text-warn-text font-semibold"
                  />
                )}
              </div>
            </div>

            {/* Sub-score breakdown */}
            <div className="space-y-2 pt-1 border-t border-line">
              <div className="text-cap font-semibold text-ink-3 uppercase tracking-wider">
                Thành phần điểm
              </div>
              {SUB_SCORES.map(({ key, label, color, weight }) => {
                const val = subScoreValues[key];
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-cap-md text-ink-2">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cap text-ink-4">{weight}</span>
                        <span
                          className="text-cap-md font-mono font-semibold"
                          style={{ color }}
                        >
                          {Math.round(val)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-lv3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 ease-out"
                        style={{ width: `${val}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Routing gate */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-cap-md font-medium",
                qualified
                  ? "bg-grade-bBg text-grade-b"
                  : "bg-bg-lv3 text-ink-3"
              )}
            >
              {qualified ? (
                <CheckCircle2 size={14} />
              ) : (
                <MinusCircle size={14} />
              )}
              {qualified
                ? "Qualified for Audit · Chuyển hàng đợi Sales"
                : "Marketing Nurture Queue"}
              <span className="ml-auto font-mono text-cap">
                {qualified ? "≥ 70" : "< 70"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline gap-1 leading-none">
      <span className="text-ink-4 shrink-0">{label}:</span>
      <span className={cn("font-semibold text-ink-1 truncate", valueClass)}>
        {value}
      </span>
    </div>
  );
}
