"use client";
import { Filter, Users2 } from "lucide-react";
import { useScoring } from "@/lib/store/scoring-store";

// ── Axis A threshold slider ───────────────────────────────────
export function AxisAControl() {
  const cfg = useScoring((s) => s.routingConfig);
  const setRoutingConfig = useScoring((s) => s.setRoutingConfig);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-ink-3" />
          <span className="text-cap-md font-semibold text-ink-2">Axis A tối thiểu</span>
        </div>
        <span
          className="text-[22px] font-black tabular-nums leading-none"
          style={{ color: "#135b96" }}
        >
          {cfg.minScoreA}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={cfg.minScoreA}
        onChange={(e) => setRoutingConfig({ minScoreA: Number(e.target.value) })}
        className="w-full h-1.5 rounded-full cursor-pointer accent-[#135b96]"
      />
      <div className="flex justify-between text-cap text-ink-4 mt-1">
        <span>0</span>
        <span>100</span>
      </div>
      <p className="text-cap text-ink-4 mt-1.5 leading-snug">
        Dưới ngưỡng → Marketing Nurture, bypass Sales.
      </p>
    </div>
  );
}

// ── Quota slider ─────────────────────────────────────────────
export function QuotaControl() {
  const cfg = useScoring((s) => s.routingConfig);
  const setRoutingConfig = useScoring((s) => s.setRoutingConfig);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Users2 size={13} className="text-ink-3" />
          <span className="text-cap-md font-semibold text-ink-2">Hạn mức / rep / ngày</span>
        </div>
        <span className="text-[22px] font-black tabular-nums leading-none text-ink-1">
          {cfg.maxLeadsPerRepPerDay}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={100}
        step={1}
        value={cfg.maxLeadsPerRepPerDay}
        onChange={(e) => setRoutingConfig({ maxLeadsPerRepPerDay: Number(e.target.value) })}
        className="w-full h-1.5 rounded-full cursor-pointer accent-[#c8102e]"
      />
      <div className="flex justify-between text-cap text-ink-4 mt-1">
        <span>1</span>
        <span>100</span>
      </div>
      <p className="text-cap text-ink-4 mt-1.5 leading-snug">
        Ưu tiên Axis A cao nhất trong hạn mức.
      </p>
    </div>
  );
}

// ── Combined (kept for backward compat) ──────────────────────
export function RoutingConfig() {
  return (
    <div className="space-y-5">
      <AxisAControl />
      <QuotaControl />
    </div>
  );
}
