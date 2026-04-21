import { cn } from "@/lib/cn";
import type { TierLevel } from "@/lib/tier-requests/types";

const TIER_STYLE: Record<TierLevel, string> = {
  0: "bg-bg-lv3 text-ink-3",
  1: "bg-info-light text-info",
  2: "bg-success-light text-success",
  3: "bg-warn-light text-warn-text",
  4: "bg-grade-aBg text-grade-a",
  5: "bg-brand/10 text-brand",
};

interface Props {
  tier: TierLevel;
  onClick?: (e: React.MouseEvent) => void;
  size?: "sm" | "md";
}

export function TierBadge({ tier, onClick, size = "sm" }: Props) {
  const base = cn(
    "inline-flex items-center font-semibold rounded",
    size === "sm" ? "text-cap-md px-2 py-0.5" : "text-body px-2.5 py-1",
    TIER_STYLE[tier],
    onClick && "cursor-pointer hover:opacity-80 transition-opacity"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base}>
        Tier {tier}
      </button>
    );
  }

  return <span className={base}>Tier {tier}</span>;
}
