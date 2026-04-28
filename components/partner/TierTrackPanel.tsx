"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import type { FacilityTierState } from "@/lib/mock/partnerTier";

// ─── Track metadata ───────────────────────────────────────────────────────────

const TRACKS: { key: "period" | "sync" | "complimentary"; name: string }[] = [
  { key: "period",        name: "Hạng tiêu chuẩn"  },
  { key: "sync",          name: "Hạng đồng bộ"      },
  { key: "complimentary", name: "Hạng trải nghiệm"  },
];

// ─── Countdown progress bar (for sync / complimentary) ───────────────────────

function CountdownBar({
  deadline,
  accentClass,
}: {
  deadline: string;
  accentClass: string;
}) {
  const now = Date.now();
  const end = new Date(deadline).getTime();
  const remainMs = Math.max(0, end - now);
  const remainDays = remainMs / 86_400_000;

  // Map remaining to nearest standard duration (30 / 60 / 90 days)
  const total = remainDays <= 30 ? 30 : remainDays <= 60 ? 60 : 90;
  const pct = Math.min(100, (remainDays / total) * 100);

  const d = Math.floor(remainDays);
  const h = Math.floor((remainDays - d) * 24);
  const label = d > 0 ? `${d}n${h > 0 ? ` ${h}g` : ""}` : `${h}g`;

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="w-20 h-1.5 bg-bg-lv3 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width]", accentClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("text-[10px] tabular-nums", accentClass.replace("bg-", "text-"))}>
        còn {label}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TierTrackPanel({
  data,
  compact = false,
  onSyncRequest,
  syncRequestStatus,
}: {
  data: FacilityTierState;
  compact?: boolean;
  onSyncRequest?: () => void;
  /** Pending or deferred sync request — replaces the sync button when set. */
  syncRequestStatus?: "pending" | "deferred" | null;
}) {
  const effectiveTier = data.tier;

  const tiers = {
    period:        data.period_tier,
    sync:          data.synchronized_tier ?? 0,
    complimentary: data.complimentary_tier ?? 0,
  };
  const effectiveKey: "period" | "sync" | "complimentary" =
    tiers.complimentary === effectiveTier && data.complimentary_tier !== null ? "complimentary" :
    tiers.sync === effectiveTier && data.synchronized_tier !== null ? "sync" : "period";

  // Rows rendered without a wrapper border — parent (DrawerSection) provides the border
  return (
    <div className="divide-y divide-line">
      {TRACKS.map(({ key, name }) => {
        const isEffective = key === effectiveKey && effectiveTier > 0;

        const trackTier = key === "period" ? data.period_tier
          : key === "sync" ? data.synchronized_tier
          : data.complimentary_tier;
        const isActive = trackTier !== null && trackTier > 0;

        const expiry = key === "sync" ? data.synchronized_tier_expiry
          : key === "complimentary" ? data.complimentary_tier_expiry
          : null;

        const source = key === "sync" ? data.synchronized_tier_source : null;

        const accentClass = key === "sync" ? "bg-info" : "bg-warn";

        return (
          <div
            key={key}
            className="flex items-center gap-3 px-4 py-2.5"
          >
            {/* Tick or spacer */}
            <div className="w-4 shrink-0 flex items-center justify-center">
              {isEffective
                ? <CheckCircle2 size={14} className="text-success" />
                : <span className="w-4" />
              }
            </div>

            {/* Name */}
            <span className={cn(
              "flex-1 min-w-0 font-semibold truncate",
              isActive ? "text-ink-1" : "text-ink-3",
              compact ? "text-cap-md" : "text-body"
            )}>
              {name}
              {source && (
                <span className="font-normal text-ink-3 ml-1 text-[10px]">({source})</span>
              )}
            </span>

            {/* Right: tier badge + optional bar below */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-2">
                {isActive && trackTier !== null
                  ? <TierBadge tier={trackTier} />
                  : <span className="text-cap-md text-ink-4">—</span>
                }

                {key === "period" && !isActive && (
                  <span className="text-[10px] text-ink-4">Chưa có hạng</span>
                )}

                {(key === "sync" || key === "complimentary") && !isActive && (
                  key === "sync" ? (
                    syncRequestStatus === "pending" ? (
                      <span className="chip bg-info-light text-info text-[10px]">Đang chờ</span>
                    ) : syncRequestStatus === "deferred" ? (
                      <span className="chip bg-warn-light text-warn-text text-[10px]">Cần bổ sung</span>
                    ) : onSyncRequest ? (
                      <button type="button" onClick={onSyncRequest} className="btn-primary text-cap-md">
                        Đồng bộ hạng
                      </button>
                    ) : (
                      <span className="text-[10px] text-ink-4 italic">Chưa kích hoạt</span>
                    )
                  ) : (
                    <span className="text-[10px] text-ink-4 italic">Chưa kích hoạt</span>
                  )
                )}
              </div>

              {/* Countdown bar below tier badge */}
              {(key === "sync" || key === "complimentary") && isActive && expiry && (
                <CountdownBar deadline={expiry} accentClass={accentClass} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
