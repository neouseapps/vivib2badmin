import type { AuditEntry } from "@/lib/scoring/types";
import { Cpu, User, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) {
    return <div className="text-cap-md text-ink-3 italic">Chưa có lịch sử chấm điểm.</div>;
  }
  return (
    <ol className="relative border-l border-line ml-3 space-y-4">
      {entries.map((e) => {
        const Icon = e.source === "API" ? Cpu : User;
        const Up = e.delta >= 0;
        return (
          <li key={e.id} className="ml-4 relative">
            <span className={cn(
              "absolute -left-[22px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-white",
              e.source === "API" ? "bg-info" : "bg-ink-2"
            )}>
              <Icon size={8}/>
            </span>
            <div className="flex items-center gap-2">
              <Badge intention={e.source === "API" ? "info" : "neutral"} className={e.source !== "API" ? "bg-bg-lv3 text-ink-2" : undefined}>
                {e.source === "API" ? "API" : "CRM"}
              </Badge>
              <span className="text-cap-md text-ink-3">Axis {e.axis}</span>
              {e.delta !== 0 && (
                <span className={cn(
                  "ml-auto inline-flex items-center gap-0.5 text-cap-md font-semibold",
                  Up ? "text-success" : "text-danger"
                )}>
                  {Up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                  {Up ? "+" : ""}{e.delta}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-body text-ink-1">{e.description}</div>
            <div className="text-cap text-ink-3">
              {new Date(e.at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })} · {e.actor}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
