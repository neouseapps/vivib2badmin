"use client";
import { Zap, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import type { TierInfo } from "@/lib/scoring/formulas";

const TIER: Record<1 | 2 | 3 | 4, {
  dark: string;
  text: string;
  tag: string;
  bar: string;
}> = {
  1: { dark: "bg-amber-800",   text: "text-amber-700",   tag: "text-amber-500",   bar: "#d97706" },
  2: { dark: "bg-sky-800",     text: "text-sky-700",     tag: "text-sky-500",     bar: "#0284c7" },
  3: { dark: "bg-emerald-800", text: "text-emerald-700", tag: "text-emerald-600", bar: "#059669" },
  4: { dark: "bg-zinc-600",    text: "text-zinc-600",    tag: "text-zinc-400",    bar: "#71717a" },
};

interface Props {
  finalScore: number;
  leadScore: number;
  sourceBoost: number;
  tier: TierInfo;
  allLocked: boolean;
  onPrioritize?: () => void;
}

export function CompositeSummary({ finalScore, leadScore, sourceBoost, tier, allLocked, onPrioritize }: Props) {
  const s = TIER[tier.index as 1 | 2 | 3 | 4];
  const score = allLocked ? null : Math.round(finalScore);
  const pct = score != null ? Math.min(score, 100) : 0;

  return (
    <div className="rounded-xl border border-line overflow-hidden flex shadow-sm">
      {/* LEFT: dark score panel */}
      <div className={cn("w-[116px] shrink-0 flex flex-col items-center justify-center py-5 gap-1.5", s.dark)}>
        <div className="text-[52px] font-black tabular-nums text-white leading-none tracking-tight">
          {score ?? "—"}
        </div>
        <div className="text-[11px] text-white/40 font-medium -mt-0.5">/ 100</div>

        {/* Progress strip */}
        <div className="w-12 h-1 rounded-full bg-white/20 overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-white/70 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {sourceBoost > 0 && (
          <div className="flex items-center gap-0.5 text-[10px] text-white/50 mt-0.5">
            <TrendingUp size={9} />
            <span>+{sourceBoost} boost</span>
          </div>
        )}
      </div>

      {/* RIGHT: classification + SLA + action */}
      <div className="flex-1 flex flex-col divide-y divide-line">
        {/* Tier */}
        <div className="px-4 py-3.5 flex-1 flex flex-col justify-center">
          <div className={cn("text-[10px] uppercase tracking-[0.14em] font-bold mb-1", s.tag)}>
            {tier.tier}
          </div>
          <div className={cn("text-[17px] font-bold leading-snug", s.text)}>
            {tier.label}
          </div>
          {sourceBoost > 0 && score != null && (
            <div className="text-cap-md text-ink-3 mt-2 flex items-center gap-1.5">
              <span>Lead {Math.round(leadScore)}</span>
              <span className="text-ink-3 opacity-50">·</span>
              <span className={cn("font-semibold", s.tag)}>+{sourceBoost}</span>
            </div>
          )}
        </div>

        {/* SLA + action */}
        <div className="px-4 py-2.5 flex items-center gap-1.5">
          <Clock size={12} className="text-ink-3 shrink-0" />
          <span className="text-cap-md text-ink-3">SLA:</span>
          <span className={cn("text-cap-md font-semibold", s.text)}>{tier.sla}</span>
          {tier.index === 1 && !allLocked && (
            <Button
              variant="primary"
              onClick={onPrioritize}
              className="ml-auto h-7 text-[11px] px-2.5 bg-amber-500 hover:bg-amber-600 border-amber-500"
            >
              <Zap size={10} /> Ưu tiên
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
