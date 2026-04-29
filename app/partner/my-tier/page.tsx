"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle2, Lock, Sprout, Link2, Gift,
  ChevronDown, ChevronRight, X, ArrowRight, Building2, Search,
  Loader2, Clock, Shield, Info, AlertOctagon, History,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Badge, Card, Select } from "@/components/ui";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import { SlaCountdown } from "@/components/tier-requests/SlaCountdown";
import {
  PARTNER_FACILITIES,
  FACILITY_TIER_DATA,
  PARTNER_HISTORY_BY_FACILITY,
  getFreshnessScore,
  type FacilityTierState,
  type QuickVerifyField,
  type RoadmapMetric,
  type PartnerHistoryItem,
  type PartnerHistoryStatus,
} from "@/lib/mock/partnerTier";
import type { TierTrack, SystemChecklist } from "@/lib/tier-requests/types";
import { usePartnerTierStore } from "@/lib/store/partner-tier-store";
import { useComplimentaryGrants } from "@/lib/store/complimentary-grant-store";
import { TierTrackPanel } from "@/components/partner/TierTrackPanel";
import { QuickVerifyModal } from "@/components/partner/QuickVerifyModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const TRACK_META: Record<TierTrack, { label: string; Icon: React.ElementType; color: string }> = {
  organic:       { label: "Hữu cơ (Period)",           Icon: Sprout, color: "text-success"   },
  sync:          { label: "Đồng bộ (Sync)",             Icon: Link2,  color: "text-info"      },
  complimentary: { label: "Ưu đãi (Complimentary)",     Icon: Gift,   color: "text-warn-text" },
};

const TIER_ACCENT: Record<number, string> = {
  0: "bg-bg-lv3", 1: "bg-info", 2: "bg-success", 3: "bg-warn", 4: "bg-grade-a", 5: "bg-brand",
};

const TIER_ICON_CLASS: Record<number, string> = {
  0: "bg-bg-lv3 text-ink-3",
  1: "bg-info-light text-info",
  2: "bg-success-light text-success",
  3: "bg-warn-light text-warn-text",
  4: "bg-grade-aBg text-grade-a",
  5: "bg-brand/10 text-brand",
};

const PILLAR_COLORS = ["bg-info", "bg-success", "bg-warn", "bg-grade-a"];

// Banner thresholds (per spec)
const FRESHNESS_HINT        = 20;   // day 20: blue info banner
const FRESHNESS_WARN        = 61;   // day 61: amber banner (score drops to 50)
const FRESHNESS_PRE_URGENT  = 80;   // day 80: critical alert — approaching 0
const FRESHNESS_URGENT      = 91;   // day 91: red banner — score = 0

type FreshnessStage = "hint" | "warn" | "pre_urgent" | "urgent";

function getFreshnessStage(days: number): FreshnessStage | null {
  if (days >= FRESHNESS_URGENT)     return "urgent";
  if (days >= FRESHNESS_PRE_URGENT) return "pre_urgent";
  if (days >= FRESHNESS_WARN)       return "warn";
  if (days >= FRESHNESS_HINT)       return "hint";
  return null;
}

// ─── Facility Switcher ────────────────────────────────────────────────────────

function FacilitySwitcher({
  selectedId,
  onSelect,
  compact,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = PARTNER_FACILITIES.find((f) => f.id === selectedId);
  const filtered = PARTNER_FACILITIES.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.location.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 h-10 px-3.5 rounded-xl border border-line bg-bg-lv1 hover:border-ink-3 transition-colors text-left shadow-sm"
      >
        <Building2 size={15} className="text-ink-3 shrink-0" />
        <span className="text-body font-semibold text-ink-1 max-w-[220px] truncate">
          {selected?.name ?? "Chọn cơ sở"}
        </span>
        {selected && !compact && <TierBadge tier={selected.currentTier} />}
        <ChevronDown
          size={13}
          className={cn("text-ink-3 shrink-0 transition-transform ml-1", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute z-30 top-full left-0 mt-1 w-[320px] bg-bg-lv1 border border-line rounded-xl shadow-lv2 overflow-hidden">
          {/* Search */}
          <div className="px-3 py-2.5 border-b border-line flex items-center gap-2">
            <Search size={13} className="text-ink-3 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm cơ sở…"
              className="flex-1 text-body bg-transparent outline-none text-ink-1 placeholder:text-ink-4"
            />
          </div>

          {/* Options */}
          <div className="py-1 max-h-56 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-cap-md text-ink-3">Không tìm thấy cơ sở</p>
            ) : (
              filtered.map((facility) => {
                const active = facility.id === selectedId;
                return (
                  <button
                    key={facility.id}
                    onClick={() => { onSelect(facility.id); setOpen(false); setQuery(""); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                      active ? "bg-bg-lv3 text-ink-1" : "hover:bg-bg-lv2 text-ink-2"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-body font-medium text-ink-1 truncate">{facility.name}</div>
                      <div className="text-cap-md text-ink-3 truncate">{facility.location}</div>
                    </div>
                    <TierBadge tier={facility.currentTier} />
                    {active && <CheckCircle2 size={14} className="text-brand shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Single-facility expansion promo ─────────────────────────────────────────

function SingleFacilityBanner() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-dashed border-info/40 bg-info-light/30 px-4 py-3">
      <Building2 size={18} className="text-info shrink-0" />
      <p className="text-body text-info flex-1">
        Đăng ký thêm cơ sở để sử dụng tính năng{" "}
        <span className="font-semibold">Đồng bộ hạng</span> và quản lý tập trung toàn hệ thống.
      </p>
      <Button variant="outline" className="text-cap-md shrink-0 text-info border-info/40 whitespace-nowrap">
        Thêm cơ sở
      </Button>
    </div>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-20 rounded-2xl bg-bg-lv1/70 flex items-center justify-center backdrop-blur-[2px]">
      <Loader2 size={24} className="text-brand animate-spin" />
    </div>
  );
}

// ─── Freshness Banner ─────────────────────────────────────────────────────────

const FRESHNESS_STAGE_STYLE: Record<FreshnessStage, {
  container: string; iconClass: string; textClass: string;
  Icon: React.ElementType; btnClass: string;
  scoreLabel: string; message: string;
}> = {
  hint: {
    container:  "bg-info-light border-info/20",
    iconClass:  "text-info",
    textClass:  "text-info",
    Icon: Info,
    btnClass:   "text-info",
    scoreLabel: "100 điểm",
    message:    "đã {days} ngày chưa xác nhận. Xác nhận ngay để duy trì 100 điểm Freshness trước khi điểm bắt đầu giảm.",
  },
  warn: {
    container:  "bg-warn-light border-warn/30",
    iconClass:  "text-warn-text",
    textClass:  "text-warn-text",
    Icon: AlertTriangle,
    btnClass:   "text-warn-text",
    scoreLabel: "50 điểm",
    message:    "đã {days} ngày chưa xác nhận — Freshness Score còn 50 điểm. Xác minh sớm để tránh tiếp tục giảm điểm.",
  },
  pre_urgent: {
    container:  "bg-warn-light border-warn/40",
    iconClass:  "text-warn-text",
    textClass:  "text-warn-text",
    Icon: AlertOctagon,
    btnClass:   "text-warn-text",
    scoreLabel: "50 điểm",
    message:    "đã {days} ngày chưa xác nhận — hồ sơ sắp rơi về 0 điểm! Chỉ còn {remaining} ngày trước khi Freshness Score tụt về 0.",
  },
  urgent: {
    container:  "bg-danger/5 border-danger/30",
    iconClass:  "text-danger",
    textClass:  "text-danger",
    Icon: AlertOctagon,
    btnClass:   "text-danger",
    scoreLabel: "0 điểm",
    message:    "đã {days} ngày chưa xác nhận — Freshness Score đã về 0 điểm. Xác nhận ngay để khôi phục điểm và duy trì xếp hạng.",
  },
};

function FreshnessBanner({ facilityName, days, stage, onVerify }: {
  facilityName: string; days: number; stage: FreshnessStage; onVerify: () => void;
}) {
  const { container, iconClass, textClass, Icon, btnClass, scoreLabel, message } = FRESHNESS_STAGE_STYLE[stage];
  const text = message
    .replace("{days}", String(days))
    .replace("{remaining}", String(90 - days));

  const score = getFreshnessScore(days);

  return (
    <div className={cn("rounded-xl border px-4 py-3", container)}>
      <div className="flex items-start gap-3">
        <Icon size={16} className={cn("shrink-0 mt-0.5", iconClass)} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-body", textClass)}>
            Thông tin hồ sơ của{" "}
            <span className="font-semibold">{facilityName}</span>{" "}{text}
          </p>
          <div className={cn("flex items-center gap-2 mt-2 text-cap-md", textClass)}>
            <span className="font-semibold">Freshness Score: {score} điểm</span>
            <span className="opacity-60">·</span>
            <span>{days} ngày kể từ lần xác nhận cuối</span>
          </div>
        </div>
        <button
          onClick={onVerify}
          className={cn("shrink-0 text-cap-md font-semibold underline underline-offset-2 hover:no-underline whitespace-nowrap", btnClass)}
        >
          Xác nhận ngay
        </button>
      </div>
    </div>
  );
}

// ─── Tier Header Card ─────────────────────────────────────────────────────────

function TierHeaderCard({
  data,
  facilityName,
  facilitySelector,
  onGraceExtend,
}: {
  data: FacilityTierState;
  facilityName: string;
  facilitySelector?: React.ReactNode;
  onGraceExtend: () => void;
}) {
  const { tier, tierName, track, expiresAt, tier_status } = data;
  const trackMeta = track ? TRACK_META[track] : null;

  return (
    <Card>
      <div className={cn("h-1.5 w-full rounded-t-lg", TIER_ACCENT[tier])} />
      <div className="p-6 flex items-center gap-6">
        <div className="flex-1 min-w-0">
          {facilitySelector
            ? <div className="mb-2">{facilitySelector}</div>
            : <p className="text-cap-md text-ink-3 truncate mb-1">{facilityName}</p>
          }
          <div className="flex items-center gap-2 mb-1.5">
            <TierBadge tier={tier} size="md" />
            <span className="text-ink-3">·</span>
            <span className="text-lg font-semibold text-ink-1">{tierName}</span>
            {tier_status === "grace_period" && (
              <Badge intention="warning" style="light">
                <Clock size={10} /> Grace Period
              </Badge>
            )}
          </div>
          {trackMeta && (
            <div className={cn("flex items-center gap-1.5 text-body", trackMeta.color)}>
              <trackMeta.Icon size={14} />
              <span>{trackMeta.label}</span>
              {expiresAt && track !== "organic" && (
                <span className="text-ink-3 mx-1">·</span>
              )}
              {expiresAt && track !== "organic" && (
                <span className="text-cap-md text-ink-3">
                  Còn lại: <SlaCountdown deadline={expiresAt} className="text-cap-md" />
                </span>
              )}
            </div>
          )}
          {!trackMeta && (
            <p className="text-body text-ink-3">Chưa phân hạng — hoàn thiện hồ sơ để bắt đầu</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tier_status === "grace_period" && (
            <Button
              onClick={onGraceExtend}
              variant="outline"
              className="text-cap-md border-warn/50 text-warn-text hover:bg-warn-light"
            >
              <Clock size={12} /> Gia hạn Grace Period
            </Button>
          )}
          <Link href="/partner/my-tier/history" className="btn-outline text-cap-md flex items-center gap-1">
            Lịch sử yêu cầu <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ─── Completeness Meter ───────────────────────────────────────────────────────

function CompletenessMeter({
  completeness,
  missingFields,
  facilityId,
}: {
  completeness: SystemChecklist;
  missingFields: Record<string, string[]>;
  facilityId: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, [facilityId]);

  const pillars = Object.values(completeness);
  const overallPct = Math.round(
    pillars.reduce((sum, p) => sum + Math.min((p.score / p.threshold) * 100, 100), 0) / pillars.length
  );

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-1">Độ hoàn thiện hồ sơ</h2>
          <p className="text-cap-md text-ink-3 mt-0.5">4 trụ cột ảnh hưởng trực tiếp đến điểm tín nhiệm</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-bg-lv3" />
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${overallPct * 0.879} 87.9`}
                  strokeLinecap="round"
                  className={overallPct >= 100 ? "text-success" : overallPct >= 80 ? "text-warn" : "text-danger"}
                />
              </svg>
              <span className={cn(
                "absolute inset-0 flex items-center justify-center text-[9px] font-bold",
                overallPct >= 100 ? "text-success" : overallPct >= 80 ? "text-warn-text" : "text-danger"
              )}>{overallPct}%</span>
            </div>
          </div>
          <Link href="/partner/business-profile" className="btn-primary text-cap-md">Hoàn thiện ngay</Link>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {pillars.map((p, i) => {
          const isOpen = openPillar === p.id;
          const pct = Math.round((p.score / p.threshold) * 100);
          const missing = missingFields[p.id] ?? [];

          return (
            <div key={p.id}>
              <button
                onClick={() => setOpenPillar(isOpen ? null : p.id)}
                className="w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg hover:bg-bg-lv3 transition-colors text-left"
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="flex-1 text-body text-ink-1">{p.label}</span>
                  <span className="text-body font-semibold text-ink-2 tabular-nums">{p.score}/{p.threshold}</span>
                  <span className={cn(
                    "text-cap-md font-medium w-12 text-right",
                    pct >= 100 ? "text-success" : pct >= 80 ? "text-warn-text" : "text-danger"
                  )}>{pct}%</span>
                  <ChevronDown size={14} className={cn("text-ink-3 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
                </div>
                <div className="w-full h-1.5 bg-bg-lv3 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-700 ease-out", pct >= 100 ? "bg-success" : "bg-danger")}
                    style={{ width: mounted ? `${Math.min(pct, 100)}%` : "0%" }}
                  />
                </div>
              </button>

              {isOpen && missing.length > 0 && (
                <div className="mx-3 mb-2 rounded-lg bg-bg-lv2 border border-line p-3 flex flex-col gap-1.5">
                  <p className="text-cap-md font-semibold text-ink-2 mb-1">Các mục cần bổ sung:</p>
                  {missing.map((m, mi) => (
                    <div key={mi} className="flex items-start gap-2 text-cap-md text-ink-2">
                      <ChevronRight size={12} className="text-ink-4 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              )}
              {isOpen && missing.length === 0 && (
                <div className="mx-3 mb-2 rounded-lg bg-success-light border border-success/20 px-3 py-2 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success" />
                  <span className="text-cap-md text-success">Trụ cột này đã hoàn thiện</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Up-Rank Roadmap ──────────────────────────────────────────────────────────

function UpRankRoadmap({
  roadmap,
  currentTier,
  readinessStatus,
  onUpgrade,
}: {
  roadmap: RoadmapMetric[];
  currentTier: number;
  readinessStatus: "not_ready" | "up_rank_ready";
  onUpgrade: () => void;
}) {
  const isReady = readinessStatus === "up_rank_ready";

  return (
    <Card padding="lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink-1">Lộ trình nâng hạng</h2>
        <p className="text-cap-md text-ink-3 mt-0.5">So sánh chỉ số hiện tại với ngưỡng Tier {currentTier + 1}</p>
      </div>

      <div className="rounded-xl border border-line overflow-hidden mb-5">
        <table className="w-full text-body">
          <thead>
            <tr className="bg-bg-lv2 border-b border-line">
              <th className="text-left px-4 py-2.5 text-cap-md font-semibold text-ink-3">Chỉ số</th>
              <th className="text-right px-4 py-2.5 text-cap-md font-semibold text-ink-3">Hiện tại</th>
              <th className="text-right px-4 py-2.5 text-cap-md font-semibold text-ink-3">Ngưỡng T{currentTier + 1}</th>
              <th className="text-right px-4 py-2.5 text-cap-md font-semibold text-ink-3">Còn thiếu</th>
              <th className="text-center px-4 py-2.5 text-cap-md font-semibold text-ink-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {roadmap.map((m) => {
              const isBoolean = m.kind === "boolean";
              const isStreak  = m.kind === "streak";
              return (
                <tr key={m.id} className="hover:bg-bg-lv2 transition-colors">
                  <td className="px-4 py-3 text-ink-1">{m.label}</td>

                  {/* Hiện tại */}
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-ink-1">
                    {isBoolean
                      ? <span className={m.passed ? "text-success" : "text-ink-4"}>
                          {m.passed ? "Đã kích hoạt" : "Chưa kích hoạt"}
                        </span>
                      : <>{m.current} <span className="text-ink-4 font-normal">{m.unit}</span></>}
                  </td>

                  {/* Ngưỡng */}
                  <td className="px-4 py-3 text-right tabular-nums text-ink-3">
                    {isBoolean
                      ? <span className="text-cap-md">Bắt buộc</span>
                      : isStreak
                        ? <span>{m.threshold} {m.unit} liên tục</span>
                        : <>{m.threshold} <span className="text-ink-4">{m.unit}</span></>}
                  </td>

                  {/* Còn thiếu */}
                  <td className="px-4 py-3 text-right tabular-nums">
                    {m.passed
                      ? <span className="text-success">—</span>
                      : isBoolean
                        ? <span className="text-danger font-medium text-cap-md">Chưa hoàn thành</span>
                        : isStreak
                          ? <span className="text-danger font-medium">+{m.threshold - m.current} {m.unit}</span>
                          : <span className="text-danger font-medium">+{m.threshold - m.current} {m.unit}</span>}
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3 text-center">
                    {m.passed
                      ? <CheckCircle2 size={16} className="text-success inline-block" />
                      : <Lock size={14} className="text-ink-4 inline-block" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-cap-md text-ink-3">
          {isReady
            ? "Bạn đã đạt đủ điều kiện và duy trì ổn định 7 ngày. Hãy gửi yêu cầu ngay!"
            : `Cần hoàn thiện thêm ${roadmap.filter((m) => !m.passed).length} điều kiện để mở khóa yêu cầu nâng hạng.`}
        </p>
        <div className="relative group shrink-0">
          <Button
            onClick={isReady ? onUpgrade : undefined}
            disabled={!isReady}
            variant="primary"
            className={cn(
              "transition-all whitespace-nowrap",
              isReady
                ? "shadow-[0_0_20px_4px_rgba(200,165,58,0.5)] animate-pulse"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            Gửi yêu cầu nâng hạng
          </Button>
          {!isReady && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-ink-1 text-white text-cap-md rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lv2">
              Hoàn thiện đủ các điều kiện bên trên và duy trì liên tục 7 ngày để mở khoá tính năng này.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


// ─── Track Status Panel (uses shared TierTrackPanel) ─────────────────────────

function TrackStatusPanel({ data }: { data: FacilityTierState }) {
  const hasAny = data.period_tier > 0 || data.synchronized_tier !== null || data.complimentary_tier !== null;
  if (!hasAny) return null;
  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={15} className="text-ink-3" />
        <h2 className="text-body font-semibold text-ink-1">Chi tiết theo dõi hạng</h2>
      </div>
      <TierTrackPanel data={data} />
    </Card>
  );
}

// ─── Tier Upgrade Modal ───────────────────────────────────────────────────────

const TIER_OBLIGATIONS: Record<number, string[]> = {
  2: ["Hiển thị huy hiệu Elite trên trang cơ sở"],
  3: [
    "Ký kết Kế hoạch Marketing Chung (Joint Marketing Plan)",
    "Cam kết ≥ 2 hoạt động co-marketing/năm",
    "Kết nối API đặt phòng (bắt buộc)",
  ],
};

function TierUpgradeModal({
  currentTier,
  facilityName,
  roadmap,
  onClose,
  onSubmit,
}: {
  currentTier: number;
  facilityName: string;
  roadmap: RoadmapMetric[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const targetTier = currentTier + 1;
  const obligations = TIER_OBLIGATIONS[targetTier] ?? [];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = obligations.length === 0 || obligations.every((_, i) => checked[i]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/40 backdrop-blur-sm">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-[500px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h3 className="text-lg font-semibold text-ink-1">Gửi yêu cầu nâng hạng</h3>
            <p className="text-cap-md text-ink-3 mt-0.5">{facilityName} · Tier {currentTier} → Tier {targetTier}</p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto flex flex-col gap-5">
          {/* Passed gates */}
          <div>
            <p className="text-cap-md font-semibold text-ink-2 mb-2">Điều kiện đã đạt được</p>
            <div className="rounded-xl bg-success-light/40 border border-success/20 divide-y divide-success/10">
              {roadmap.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                  <CheckCircle2 size={14} className="text-success shrink-0" />
                  <span className="flex-1 text-body text-ink-1">{m.label}</span>
                  <span className="text-cap-md text-ink-3 tabular-nums">{m.current}/{m.threshold} {m.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier obligations */}
          <div>
            <p className="text-cap-md font-semibold text-ink-2 mb-2">
              Cam kết khi đạt Tier {targetTier} <span className="text-danger">*</span>
            </p>
            {obligations.length === 0 ? (
              <p className="text-body text-ink-3 italic">Không có cam kết bổ sung cho hạng này.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {obligations.map((ob, i) => (
                  <label
                    key={i}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                      checked[i] ? "border-brand bg-brand/5" : "border-line hover:bg-bg-lv2"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[i]}
                      onChange={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="mt-0.5 shrink-0 accent-brand"
                    />
                    <span className="text-body text-ink-1">{ob}</span>
                    {checked[i] && <CheckCircle2 size={15} className="text-brand shrink-0 ml-auto mt-0.5" />}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3">
          <Button onClick={onClose} variant="outline">Hủy</Button>
          <Button
            onClick={() => { if (allChecked) onSubmit(); }}
            disabled={!allChecked}
            variant="primary"
            className={cn(!allChecked && "opacity-40 cursor-not-allowed")}
          >
            Gửi yêu cầu
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Grace Period Extension Modal ─────────────────────────────────────────────

const GRACE_REASONS = [
  "Cập nhật đang chờ phê duyệt nội bộ",
  "Sự cố kỹ thuật tạm thời",
  "Thay đổi nhân sự quản lý",
  "Điều kiện thị trường bất thường",
  "Lý do khác",
];

function GracePeriodExtensionModal({
  facilityName,
  graceExpiry,
  onClose,
  onSubmit,
}: {
  facilityName: string;
  graceExpiry: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [recoveryDate, setRecoveryDate] = useState("");
  const [dateError, setDateError] = useState("");
  const minChars = 50;

  const today = new Date();
  const minDate = new Date(today.getTime() + 86400000).toISOString().split("T")[0]; // +1 day
  const maxDate = new Date(today.getTime() + 45 * 86400000).toISOString().split("T")[0]; // +45 days

  function handleDateChange(val: string) {
    setRecoveryDate(val);
    if (!val) { setDateError(""); return; }
    const picked = new Date(val);
    const max = new Date(maxDate);
    if (picked > max) {
      setDateError("Ngày phục hồi phải trong vòng 45 ngày tới");
    } else {
      setDateError("");
    }
  }

  const isValid = reason !== "" && details.length >= minChars && recoveryDate !== "" && dateError === "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/40 backdrop-blur-sm">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-[500px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h3 className="text-lg font-semibold text-ink-1">Yêu cầu gia hạn Grace Period</h3>
            <p className="text-cap-md text-ink-3 mt-0.5">{facilityName}</p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto flex flex-col gap-5">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-xl bg-warn-light border border-warn/30 px-4 py-3">
            <Clock size={15} className="text-warn-text shrink-0 mt-0.5" />
            <p className="text-body text-warn-text">
              Đồng hồ Grace Period vẫn tiếp tục chạy trong khi yêu cầu đang chờ xử lý.
              {graceExpiry && (
                <> Thời hạn hiện tại: <SlaCountdown deadline={graceExpiry} className="text-body font-semibold text-warn-text" /></>
              )}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="text-body font-semibold text-ink-1 block mb-1.5">
              Lý do gia hạn <span className="text-danger">*</span>
            </label>
            <Select
              className="w-full"
              value={reason}
              onChange={(next) => setReason(next)}
              placeholder="— Chọn lý do —"
              options={GRACE_REASONS.map((r) => ({ value: r, label: r }))}
            />
          </div>

          {/* Details */}
          <div>
            <label className="text-body font-semibold text-ink-1 block mb-1.5">
              Thông tin bổ sung <span className="text-danger">*</span>
              <span className="text-cap-md text-ink-3 font-normal ml-2">(tối thiểu {minChars} ký tự)</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Mô tả chi tiết tình huống và các bước bạn đang thực hiện để khôi phục hạng…"
              rows={4}
              className="input w-full resize-none"
            />
            <div className={cn("mt-1 text-cap-md text-right", details.length >= minChars ? "text-success" : "text-ink-3")}>
              {details.length >= minChars ? `✓ ${details.length} ký tự` : `Cần thêm ${minChars - details.length} ký tự`}
            </div>
          </div>

          {/* Recovery date */}
          <div>
            <label className="text-body font-semibold text-ink-1 block mb-1.5">
              Ngày phục hồi dự kiến <span className="text-danger">*</span>
              <span className="text-cap-md text-ink-3 font-normal ml-2">(tối đa 45 ngày)</span>
            </label>
            <input
              type="date"
              value={recoveryDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input w-full"
            />
            {dateError && <p className="text-cap-md text-danger mt-1">{dateError}</p>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3">
          <Button onClick={onClose} variant="outline">Hủy</Button>
          <Button
            onClick={() => { if (isValid) onSubmit(); }}
            disabled={!isValid}
            variant="primary"
            className={cn(!isValid && "opacity-40 cursor-not-allowed")}
          >
            Gửi yêu cầu gia hạn
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Active Request Banner ────────────────────────────────────────────────────

function ActiveRequestBanner({ item }: { item: PartnerHistoryItem }) {
  const kindLabel = item.kind === "upgrade" ? "Nâng hạng" : "Đồng bộ hạng";
  const submittedDate = new Date(item.submittedAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  return (
    <div className="flex items-center gap-3 rounded-xl bg-info-light border border-info/20 px-4 py-3">
      <Clock size={15} className="text-info shrink-0" />
      <p className="text-body text-info flex-1">
        Yêu cầu{" "}
        <span className="font-semibold">{kindLabel} (Tier {item.fromTier} → {item.toTier})</span>{" "}
        đang chờ xét duyệt — gửi ngày {submittedDate}.
      </p>
      <Link href="/partner/my-tier/history" className="shrink-0 text-cap-md font-semibold text-info underline underline-offset-2 hover:no-underline whitespace-nowrap">
        Xem chi tiết
      </Link>
    </div>
  );
}

// ─── Inline Recent History ────────────────────────────────────────────────────

const HISTORY_STATUS_META: Record<PartnerHistoryStatus, { label: string; chipClass: string }> = {
  pending:  { label: "Đang chờ",    chipClass: "bg-info-light text-info"        },
  approved: { label: "Đã duyệt",    chipClass: "bg-success-light text-success"  },
  deferred: { label: "Cần bổ sung", chipClass: "bg-warn-light text-warn-text"   },
  expired:  { label: "Hết hạn",     chipClass: "bg-bg-lv3 text-ink-3"           },
};

function RecentHistory({ facilityId }: { facilityId: string }) {
  const items = (PARTNER_HISTORY_BY_FACILITY[facilityId] ?? []).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={15} className="text-ink-3" />
          <h2 className="text-body font-semibold text-ink-1">Lịch sử yêu cầu gần đây</h2>
        </div>
        <Link href="/partner/my-tier/history" className="text-cap-md text-brand hover:underline flex items-center gap-1">
          Xem tất cả <ArrowRight size={11} />
        </Link>
      </div>
      <div className="flex flex-col divide-y divide-line">
        {items.map((item) => {
          const { label, chipClass } = HISTORY_STATUS_META[item.status];
          const kindLabel = item.kind === "upgrade" ? "Nâng hạng" : "Đồng bộ hạng";
          const date = new Date(item.submittedAt).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
          });
          return (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="flex-1 min-w-0">
                <span className="text-body text-ink-1">{kindLabel}</span>
                <span className="text-cap-md text-ink-3 ml-2">Tier {item.fromTier} → {item.toTier}</span>
              </div>
              <span className="text-cap-md text-ink-3 tabular-nums shrink-0">{date}</span>
              <Badge intention="neutral" className={cn("shrink-0", chipClass)}>{label}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-ink-1 text-white text-body rounded-xl px-4 py-3 shadow-lv2">
      <CheckCircle2 size={16} className="text-success shrink-0" />
      {message}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyTierPage() {
  const { selectedFacilityId, setSelectedFacilityId } = usePartnerTierStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayId, setDisplayId] = useState(selectedFacilityId);
  const [dismissedFreshness, setDismissedFreshness] = useState<Set<string>>(new Set());
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showGraceExtendModal, setShowGraceExtendModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isMultiFacility = PARTNER_FACILITIES.length > 1;
  const facilityData = FACILITY_TIER_DATA[displayId];
  const facility = PARTNER_FACILITIES.find((f) => f.id === displayId);

  const complimentaryGrants = useComplimentaryGrants((s) => s.grants);
  const activeGrant = complimentaryGrants[displayId];
  const isGrantActive = activeGrant != null && new Date(activeGrant.expiresAt) > new Date();

  function handleFacilitySelect(id: string) {
    if (id === displayId || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setDisplayId(id);
      setSelectedFacilityId(id);
      setIsTransitioning(false);
    }, 500);
  }

  const freshnessStage = facilityData
    ? getFreshnessStage(facilityData.freshnessDaysStale)
    : null;
  const showFreshness = freshnessStage !== null && !dismissedFreshness.has(displayId);

  function handleVerifySubmit() {
    setShowVerifyModal(false);
    setDismissedFreshness((prev) => new Set([...prev, displayId]));
    setToast(`Thông tin hồ sơ của ${facility?.name ?? "cơ sở"} đã được xác nhận thành công.`);
  }

  if (!facilityData || !facility) return null;

  const facilityHistory = PARTNER_HISTORY_BY_FACILITY[displayId] ?? [];
  const pendingRequest = facilityHistory.find((h) => h.status === "pending") ?? null;

  return (
    <>
      <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col gap-5">

        {/* Single-facility promo */}
        {!isMultiFacility && <SingleFacilityBanner />}

        {/* Active pending request banner */}
        {pendingRequest && <ActiveRequestBanner item={pendingRequest} />}

        {/* Freshness banner */}
        {showFreshness && freshnessStage && (
          <FreshnessBanner
            facilityName={facility.name}
            days={facilityData.freshnessDaysStale}
            stage={freshnessStage}
            onVerify={() => setShowVerifyModal(true)}
          />
        )}

        {/* Content area (with loading overlay) */}
        <div className="relative flex flex-col gap-5">
          {isTransitioning && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-lv2/70 backdrop-blur-[2px] rounded-2xl">
              <Loader2 size={28} className="text-brand animate-spin" />
            </div>
          )}

          <TierHeaderCard
            data={facilityData}
            facilityName={facility.name}
            facilitySelector={isMultiFacility ? <FacilitySwitcher selectedId={displayId} onSelect={handleFacilitySelect} compact /> : undefined}
            onGraceExtend={() => setShowGraceExtendModal(true)}
          />

          <TrackStatusPanel data={facilityData} />

          {/* Complimentary tier banner — hiển thị khi Admin đã cấp hạng đặc cách */}
          {isGrantActive && (
            <div className="flex items-start gap-3 bg-grade-aBg border border-grade-a/30 rounded-xl px-4 py-3.5">
              <div className="w-8 h-8 rounded-full bg-grade-a/10 flex items-center justify-center shrink-0 mt-0.5">
                <Gift size={15} className="text-grade-a" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-semibold text-grade-a">Quyền truy cập đặc biệt do Visit Vietnam cấp</p>
                <p className="text-cap-md text-ink-2 mt-0.5">
                  Hạng <span className="font-semibold">Tier {activeGrant.tier}</span> đang có hiệu lực —
                  hết hạn{" "}
                  <span className="font-semibold">
                    {new Date(activeGrant.expiresAt).toLocaleDateString("vi-VN")}
                  </span>
                </p>
              </div>
            </div>
          )}

          <CompletenessMeter
            completeness={facilityData.completeness}
            missingFields={facilityData.missingFields}
            facilityId={displayId}
          />

          <UpRankRoadmap
            roadmap={facilityData.roadmap}
            currentTier={facilityData.tier}
            readinessStatus={facilityData.tier_readiness_status}
            onUpgrade={() => setShowUpgradeModal(true)}
          />

          {/* Sync CTA (only for multi-facility) */}
          {isMultiFacility && (
            <Card padding="lg" className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-info-light flex items-center justify-center shrink-0">
                <Link2 size={18} className="text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body font-semibold text-ink-1">Đồng bộ hạng cho chi nhánh</div>
                <div className="text-cap-md text-ink-3 mt-0.5">
                  Áp dụng hạng cao từ cơ sở đầu hệ thống xuống các chi nhánh còn lại
                </div>
              </div>
              <Link href="/partner/my-tier/sync-request" className="btn-outline shrink-0 flex items-center gap-1">
                Gửi yêu cầu <ArrowRight size={12} />
              </Link>
            </Card>
          )}

          <RecentHistory facilityId={displayId} />
        </div>
      </div>

      {showVerifyModal && (
        <QuickVerifyModal
          facilityName={facility.name}
          fields={facilityData.quickVerifyFields}
          onClose={() => setShowVerifyModal(false)}
          onSubmit={handleVerifySubmit}
        />
      )}
      {showUpgradeModal && (
        <TierUpgradeModal
          currentTier={facilityData.tier}
          facilityName={facility.name}
          roadmap={facilityData.roadmap}
          onClose={() => setShowUpgradeModal(false)}
          onSubmit={() => {
            setShowUpgradeModal(false);
            setToast("Yêu cầu nâng hạng đã được gửi thành công.");
          }}
        />
      )}
      {showGraceExtendModal && (
        <GracePeriodExtensionModal
          facilityName={facility.name}
          graceExpiry={facilityData.grace_period_expiry}
          onClose={() => setShowGraceExtendModal(false)}
          onSubmit={() => {
            setShowGraceExtendModal(false);
            setToast("Yêu cầu gia hạn Grace Period đã được gửi tới Admin.");
          }}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
