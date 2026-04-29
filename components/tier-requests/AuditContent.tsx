"use client";
import { CheckCircle2, XCircle, AlertCircle, ChevronRight, Gift, Shield, Clock } from "lucide-react";
import type {
  TierAuditEntry, TierTrack,
  GracePeriodEvent, GrantHistoryEntry, PartnerBenefitsEvent,
} from "@/lib/tier-requests/types";
import { TierBadge } from "./TierBadge";
import { cn } from "@/lib/cn";

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatAuditDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Track badge style ────────────────────────────────────────────────────────

const TRACK_STYLE: Record<TierTrack, { dot: string; label: string; chip: string }> = {
  organic:       { dot: "bg-info",      label: "Hữu cơ",  chip: "bg-info-light text-info" },
  sync:          { dot: "bg-[#7d3c98]", label: "Đồng bộ", chip: "bg-[#f0e6f9] text-[#7d3c98]" },
  complimentary: { dot: "bg-warn",      label: "Ưu đãi",  chip: "bg-warn-light text-warn-text" },
};

// ─── Section wrapper (chỉ hiện khi có data) ──────────────────────────────────

export function AuditSection({
  title, icon, count, children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-ink-3">{icon}</span>
        <span className="text-cap-md font-semibold text-ink-2 uppercase tracking-wide">{title}</span>
        <span className="ml-auto text-cap bg-bg-lv3 text-ink-3 px-1.5 py-0.5 rounded font-medium">{count}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Compliance snapshot chips ────────────────────────────────────────────────

function ComplianceChip({ s }: { s: NonNullable<TierAuditEntry["complianceSnapshot"]> }) {
  const systemOk = s.systemPassed === s.systemTotal;
  const manualOk = s.manualTotal === 0 || s.manualChecked === s.manualTotal;
  return (
    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
      <span className={cn(
        "inline-flex items-center gap-1 text-cap px-1.5 py-0.5 rounded font-medium",
        systemOk ? "bg-success-light text-success" : "bg-danger-light text-danger"
      )}>
        {systemOk ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
        {s.systemPassed}/{s.systemTotal} chỉ số hệ thống
      </span>
      {s.manualTotal > 0 && (
        <span className={cn(
          "inline-flex items-center gap-1 text-cap px-1.5 py-0.5 rounded font-medium",
          manualOk ? "bg-success-light text-success" : "bg-warn-light text-warn-text"
        )}>
          {manualOk ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          {s.manualChecked}/{s.manualTotal} kiểm tra thủ công
        </span>
      )}
    </div>
  );
}

// ─── Section 1: Request audit timeline ───────────────────────────────────────

export function RequestTimeline({ entries }: { entries: TierAuditEntry[] }) {
  if (entries.length === 0) return (
    <div className="flex items-center gap-2 py-3 text-ink-4 text-cap-md">
      <Clock size={14} /> Chưa có lịch sử xét duyệt
    </div>
  );
  const sorted = [...entries].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return (
    <ol className="relative border-l border-line ml-3 space-y-5">
      {sorted.map((entry) => {
        const style = TRACK_STYLE[entry.track];
        return (
          <li key={entry.id} className="ml-5">
            <span className={cn("absolute -left-[5px] w-2.5 h-2.5 rounded-full border-2 border-white", style.dot)} />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-cap-md text-ink-3">{formatAuditDate(entry.at)}</span>
                <span className={cn("text-cap px-1.5 py-0.5 rounded font-medium", style.chip)}>{style.label}</span>
              </div>
              <p className="text-body font-semibold text-ink-1">{entry.action}</p>
              <p className="text-cap-md text-ink-3">bởi {entry.actor}</p>
              {(entry.fromTier !== undefined || entry.toTier !== undefined) && (
                <div className="flex items-center gap-1.5 mt-1">
                  {entry.fromTier !== undefined && <TierBadge tier={entry.fromTier} />}
                  {entry.toTier !== undefined && (
                    <><ChevronRight size={12} className="text-ink-4" /><TierBadge tier={entry.toTier} /></>
                  )}
                </div>
              )}
              {entry.complianceSnapshot && <ComplianceChip s={entry.complianceSnapshot} />}
              {entry.reason && (
                <p className="text-cap-md text-ink-2 bg-bg-lv2 rounded px-2.5 py-1.5 mt-1">{entry.reason}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Section 2: Grace period timeline ────────────────────────────────────────

const GRACE_STYLE: Record<GracePeriodEvent["event_type"], { dot: string; label: string }> = {
  tier_downgraded: { dot: "bg-danger",  label: "Giáng hạng" },
  grace_started:   { dot: "bg-warn",    label: "Ân hạn bắt đầu" },
  grace_ended:     { dot: "bg-success", label: "Ân hạn kết thúc" },
  grace_expired:   { dot: "bg-danger",  label: "Ân hạn hết hạn" },
};

export function GraceTimeline({ events }: { events: GracePeriodEvent[] }) {
  const sorted = [...events].sort((a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime());
  return (
    <ol className="relative border-l border-line ml-3 space-y-5">
      {sorted.map((ev) => {
        const style = GRACE_STYLE[ev.event_type];
        return (
          <li key={ev.id} className="ml-5">
            <span className={cn("absolute -left-[5px] w-2.5 h-2.5 rounded-full border-2 border-white", style.dot)} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-cap-md text-ink-3">{formatAuditDate(ev.event_at)}</span>
                <span className="text-cap px-1.5 py-0.5 rounded font-medium bg-bg-lv3 text-ink-3">{style.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TierBadge tier={ev.old_period_tier} />
                <ChevronRight size={12} className="text-ink-4" />
                <TierBadge tier={ev.new_period_tier} />
                <span className="text-cap-md text-ink-3 ml-1">({ev.old_status ?? "—"} → {ev.new_status})</span>
              </div>
              <p className="text-cap-md text-ink-2 bg-bg-lv2 rounded px-2.5 py-1.5">{ev.reason}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Section 3: Grant timeline ────────────────────────────────────────────────

export function GrantTimeline({ entries }: { entries: GrantHistoryEntry[] }) {
  const sorted = [...entries].sort((a, b) => new Date(a.grantedAt).getTime() - new Date(b.grantedAt).getTime());
  return (
    <ol className="relative border-l border-line ml-3 space-y-5">
      {sorted.map((g) => (
        <li key={g.id} className="ml-5">
          <span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full border-2 border-white bg-warn" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-cap-md text-ink-3">{formatAuditDate(g.grantedAt)}</span>
              <span className="text-cap px-1.5 py-0.5 rounded font-medium bg-warn-light text-warn-text">
                {g.kind === "complimentary" ? "Ưu đãi" : "Đồng bộ"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-body font-semibold text-ink-1">Cấp hạng</p>
              <TierBadge tier={g.targetTier} size="sm" />
              <p className="text-body font-semibold text-ink-1">cho {g.facilityName}</p>
            </div>
            <p className="text-cap-md text-ink-3">bởi {g.grantedBy}</p>
            <div className="text-cap-md text-ink-3">
              Hết hạn: <span className="text-ink-2">{formatAuditDate(g.expiryAt)}</span>
            </div>
            <p className="text-cap-md text-ink-2 bg-bg-lv2 rounded px-2.5 py-1.5">{g.justification}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ─── Section 4: Partner benefits timeline ────────────────────────────────────

const BENEFIT_STYLE: Record<PartnerBenefitsEvent["event_type"], { dot: string; label: string }> = {
  PartnerAccountReachedTier3:      { dot: "bg-success", label: "Đạt Tier 3 (Account Manager)" },
  PartnerAccountReachedTier4:      { dot: "bg-grade-a", label: "Đạt Tier 4 (Ban Cố vấn)" },
  PartnerAccountDroppedBelowTier3: { dot: "bg-warn",    label: "Rớt khỏi Tier 3" },
  PartnerAccountDroppedBelowTier4: { dot: "bg-danger",  label: "Rớt khỏi Tier 4" },
};

export function BenefitsTimeline({ events }: { events: PartnerBenefitsEvent[] }) {
  const sorted = [...events].sort((a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime());
  return (
    <ol className="relative border-l border-line ml-3 space-y-5">
      {sorted.map((ev) => {
        const style = BENEFIT_STYLE[ev.event_type];
        return (
          <li key={ev.id} className="ml-5">
            <span className={cn("absolute -left-[5px] w-2.5 h-2.5 rounded-full border-2 border-white", style.dot)} />
            <div className="space-y-1">
              <span className="text-cap-md text-ink-3">{formatAuditDate(ev.event_at)}</span>
              <p className="text-body font-semibold text-ink-1">{style.label}</p>
              <p className="text-cap-md text-ink-3">Kích hoạt bởi: {ev.trigger_facility}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn("text-cap px-1.5 py-0.5 rounded font-medium",
                  ev.has_any_tier3 ? "bg-success-light text-success" : "bg-bg-lv3 text-ink-4")}>
                  {ev.has_any_tier3 ? "✓" : "✗"} Tier 3
                </span>
                <span className={cn("text-cap px-1.5 py-0.5 rounded font-medium",
                  ev.has_any_tier4 ? "bg-grade-aBg text-grade-a" : "bg-bg-lv3 text-ink-4")}>
                  {ev.has_any_tier4 ? "✓" : "✗"} Tier 4
                </span>
              </div>
              {ev.am_grace_expires_at && (
                <p className="text-cap-md text-warn-text bg-warn-light rounded px-2.5 py-1.5">
                  30 ngày ân hạn Account Manager — hết hạn {formatAuditDate(ev.am_grace_expires_at)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Main AuditContent component ─────────────────────────────────────────────

export interface AuditContentProps {
  requestEntries: TierAuditEntry[];
  graceEvents: GracePeriodEvent[];
  grants: GrantHistoryEntry[];
  benefitEvents: PartnerBenefitsEvent[];
}

export function AuditContent({ requestEntries, graceEvents, grants, benefitEvents }: AuditContentProps) {
  const hasAny = requestEntries.length + graceEvents.length + grants.length + benefitEvents.length > 0;

  if (!hasAny) return (
    <div className="flex flex-col items-center py-12 text-ink-4">
      <Clock size={32} className="mb-2" />
      <p className="text-body">Chưa có lịch sử thay đổi</p>
    </div>
  );

  return (
    <>
      <AuditSection title="Yêu cầu nâng hạng" icon={<CheckCircle2 size={14} />} count={requestEntries.length}>
        <RequestTimeline entries={requestEntries} />
      </AuditSection>
      <AuditSection title="Ân hạn & Giáng hạng" icon={<Clock size={14} />} count={graceEvents.length}>
        <GraceTimeline events={graceEvents} />
      </AuditSection>
      <AuditSection title="Cấp hạng Đặc cách" icon={<Gift size={14} />} count={grants.length}>
        <GrantTimeline entries={grants} />
      </AuditSection>
      <AuditSection title="Quyền lợi Tài khoản" icon={<Shield size={14} />} count={benefitEvents.length}>
        <BenefitsTimeline events={benefitEvents} />
      </AuditSection>
    </>
  );
}
