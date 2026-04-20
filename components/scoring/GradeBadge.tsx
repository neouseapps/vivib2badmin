import type { Grade } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";

const MAP: Record<Grade, { bg: string; text: string; label: string; hint: string }> = {
  A: { bg: "bg-grade-aBg", text: "text-grade-a", label: "Hạng A", hint: "Sales Ready" },
  B: { bg: "bg-grade-bBg", text: "text-grade-b", label: "Hạng B", hint: "High Potential" },
  C: { bg: "bg-grade-cBg", text: "text-grade-c", label: "Hạng C", hint: "Nurture" },
  D: { bg: "bg-grade-dBg", text: "text-grade-d", label: "Hạng D", hint: "Dormant" },
};

export function GradeBadge({ grade, size = "md", showHint = false }: { grade: Grade; size?: "sm" | "md" | "lg"; showHint?: boolean; }) {
  const m = MAP[grade];
  const sizeCls =
    size === "lg" ? "w-14 h-14 text-2xl" :
    size === "sm" ? "w-6 h-6 text-cap-md" : "w-10 h-10 text-lg";
  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-lg flex items-center justify-center font-bold", m.bg, m.text, sizeCls)}>
        {grade}
      </div>
      {showHint && (
        <div className="leading-tight">
          <div className={cn("text-body font-semibold", m.text)}>{m.label}</div>
          <div className="text-cap text-ink-3">{m.hint}</div>
        </div>
      )}
    </div>
  );
}
