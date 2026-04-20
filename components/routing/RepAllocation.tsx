"use client";
import type { RoutedLead } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";

interface Props {
  routedLeads: RoutedLead[];
  quota: number;
}

const REP_COLORS = ["#135b96", "#19674f", "#7d3c98", "#d65800", "#0986ec", "#c0392b", "#c8a53a"];

export function RepAllocation({ routedLeads, quota }: Props) {
  const pending = routedLeads.filter((r) => r.routingStatus === "Pending_Audit");

  // Group by assignedTo
  const repMap = new Map<string, { leads: RoutedLead[]; topScore: number }>();
  for (const r of pending) {
    const name = r.lead.assignedTo;
    if (!name || name === "—") continue;
    if (!repMap.has(name)) repMap.set(name, { leads: [], topScore: 0 });
    const entry = repMap.get(name)!;
    entry.leads.push(r);
    if (r.axisAEff > entry.topScore) entry.topScore = r.axisAEff;
  }

  const reps = [...repMap.entries()].sort((a, b) => b[1].leads.length - a[1].leads.length);

  if (reps.length === 0) {
    return (
      <div className="text-center py-8 text-ink-3 text-cap-md">
        Chưa có lead nào được phân bổ hôm nay
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {reps.map(([name, data], idx) => {
        const count = data.leads.length;
        const pct = Math.min((count / Math.max(quota, 1)) * 100, 100);
        const color = REP_COLORS[idx % REP_COLORS.length];
        const initials = name
          .split(" ")
          .map((w: string) => w[0])
          .slice(-2)
          .join("")
          .toUpperCase();
        const overloaded = count >= quota;

        return (
          <div
            key={name}
            className="rounded-xl border border-line p-3.5 flex flex-col gap-2.5 bg-bg-lv1"
          >
            {/* Avatar + info */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: color }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-cap-md font-semibold text-ink-1 truncate">{name}</div>
                <div className={cn("text-cap font-mono", overloaded ? "text-danger font-semibold" : "text-ink-3")}>
                  {count} / {quota} lead
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-bg-lv3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: overloaded ? "#c8102e" : pct >= 80 ? "#d65800" : color,
                }}
              />
            </div>

            {/* Top score */}
            <div className="text-cap text-ink-4">
              Top Axis A:{" "}
              <span className="font-mono font-semibold text-ink-2">
                {data.topScore.toFixed(0)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
