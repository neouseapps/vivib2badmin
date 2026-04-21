import { ArrowRight } from "lucide-react";
import { TierBadge } from "./TierBadge";
import type { TierLevel } from "@/lib/tier-requests/types";

interface Props {
  from: TierLevel;
  to: TierLevel;
  onClickFrom?: (e: React.MouseEvent) => void;
}

export function TierJourney({ from, to, onClickFrom }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <TierBadge tier={from} onClick={onClickFrom} />
      <ArrowRight size={12} className="text-ink-4 shrink-0" />
      <TierBadge tier={to} />
    </span>
  );
}
