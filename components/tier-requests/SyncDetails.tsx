"use client";
import { useState } from "react";
import { Building2, ArrowRight, MessageSquareText } from "lucide-react";
import { TierBadge } from "./TierBadge";
import type { SyncRequest } from "@/lib/tier-requests/types";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

const DURATION_OPTIONS = [30, 60, 90] as const;

interface Props {
  details: SyncRequest;
  onChange?: (durationDays: 30 | 60 | 90) => void;
}

export function SyncDetails({ details, onChange }: Props) {
  const [duration, setDuration] = useState<30 | 60 | 90>(details.durationDays);

  function handleDuration(d: 30 | 60 | 90) {
    setDuration(d);
    onChange?.(d);
  }

  return (
    <div className="space-y-5">
      {/* Comparison view */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
        {/* Source facility */}
        <Card padding="md" className="space-y-2 border-success/30 bg-success-light/20">
          <div className="flex items-center gap-2 text-cap-md font-semibold text-ink-3 uppercase tracking-wide mb-1">
            <Building2 size={14} /> Cơ sở nguồn
          </div>
          <TierBadge tier={details.sourceFacility.currentTier} size="md" />
          <p className="text-body font-semibold text-ink-1 leading-snug">{details.sourceFacility.name}</p>
          <p className="text-cap-md text-ink-3">{details.sourceFacility.partner}</p>
          <p className="text-cap-md text-ink-3">{details.sourceFacility.location}</p>
          <div className="flex gap-3 pt-1">
            <div className="text-center">
              <div className="text-h4 font-bold text-ink-1">{details.sourceFacility.dataScore}</div>
              <div className="text-cap text-ink-4">Data</div>
            </div>
            <div className="text-center">
              <div className="text-h4 font-bold text-ink-1">{details.sourceFacility.serviceScore}</div>
              <div className="text-cap text-ink-4">Service</div>
            </div>
          </div>
        </Card>

        {/* Arrow */}
        <div className="flex items-center justify-center pt-16">
          <ArrowRight size={20} className="text-ink-4" />
        </div>

        {/* Target facilities */}
        <div className="space-y-2">
          <div className="text-cap-md font-semibold text-ink-3 uppercase tracking-wide mb-1 flex items-center gap-2">
            <Building2 size={14} /> Cơ sở mục tiêu ({details.targetFacilities.length})
          </div>
          {details.targetFacilities.map((t) => (
            <Card key={t.id} padding="sm" className="space-y-1 border-info/20 bg-info-light/20">
              <TierBadge tier={0} />
              <p className="text-body font-semibold text-ink-1 leading-snug">{t.name}</p>
              <p className="text-cap-md text-ink-3">{t.location}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Justification */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cap-md font-semibold text-ink-3 uppercase tracking-wide">
          <MessageSquareText size={14} /> Lý do đề xuất
        </div>
        <div className="bg-bg-lv2 rounded-lg p-4 text-body text-ink-2 leading-relaxed">
          {details.justification}
        </div>
      </div>

      {/* Duration picker */}
      <div className="space-y-2">
        <div className="text-cap-md font-semibold text-ink-3 uppercase tracking-wide">Thời hạn hiệu lực</div>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleDuration(opt)}
              className={cn(
                "flex-1 h-10 rounded-lg text-body font-medium border transition-colors",
                duration === opt
                  ? "bg-ink-1 text-white border-ink-1"
                  : "bg-bg-lv1 text-ink-2 border-line hover:border-ink-3"
              )}
            >
              {opt} ngày
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
