"use client";
import { Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";

interface Props {
  axisABase: number;
  campaignBoost: number;
  locked?: boolean;
}

export function AxisACards({ axisABase, campaignBoost, locked }: Props) {
  return (
    <div className={cn(locked && "opacity-50 pointer-events-none")}>
      <div className="rounded-xl border border-line bg-bg-lv2/40 px-4 py-3 space-y-1.5">
        <div className="text-cap text-ink-3 font-medium">Axis A</div>
        <div className="flex items-center gap-4">
          <div>
            <div className="text-3xl font-bold tabular-nums text-ink-1">{Math.round(axisABase)}</div>
            <div className="text-cap text-ink-3">/ 100</div>
          </div>
          <div className="flex-1" />
          {campaignBoost > 0 && (
            <Badge intention="warning" style="light" className="shrink-0">
              <Zap size={10} /> +{campaignBoost}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
