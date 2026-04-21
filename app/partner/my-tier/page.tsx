"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle2, Lock, Sprout, Link2, Gift,
  ChevronDown, ChevronRight, X, ArrowRight, Building2, Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import { SlaCountdown } from "@/components/tier-requests/SlaCountdown";
import {
  PARTNER_FACILITIES,
  FACILITY_TIER_DATA,
  type FacilityTierState,
  type QuickVerifyField,
  type RoadmapMetric,
} from "@/lib/mock/partnerTier";
import type { TierTrack, SystemChecklist } from "@/lib/tier-requests/types";
import { usePartnerTierStore } from "@/lib/store/partner-tier-store";

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

const FRESHNESS_THRESHOLD = 90;

// ─── Facility Switcher ────────────────────────────────────────────────────────

function FacilitySwitcher({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
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
        {selected && <TierBadge tier={selected.currentTier} />}
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
      <button className="btn-outline text-cap-md shrink-0 text-info border-info/40 whitespace-nowrap">
        Thêm cơ sở
      </button>
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

function FreshnessBanner({ facilityName, days, onVerify }: { facilityName: string; days: number; onVerify: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-warn-light border border-warn/30 px-4 py-3">
      <AlertTriangle size={16} className="text-warn-text shrink-0 mt-0.5" />
      <p className="text-body text-warn-text flex-1">
        Thông tin hồ sơ của{" "}
        <span className="font-semibold">{facilityName}</span> đã{" "}
        <span className="font-semibold">{days} ngày</span> chưa được cập nhật.
        Hãy xác nhận ngay để duy trì điểm tín nhiệm.
      </p>
      <button
        onClick={onVerify}
        className="shrink-0 text-cap-md font-semibold text-warn-text underline underline-offset-2 hover:no-underline whitespace-nowrap"
      >
        Xác nhận ngay
      </button>
    </div>
  );
}

// ─── Tier Header Card ─────────────────────────────────────────────────────────

function TierHeaderCard({ data, facilityName }: { data: FacilityTierState; facilityName: string }) {
  const { tier, tierName, track, expiresAt } = data;
  const trackMeta = track ? TRACK_META[track] : null;

  return (
    <div className="card overflow-hidden">
      <div className={cn("h-1.5 w-full", TIER_ACCENT[tier])} />
      <div className="p-6 flex items-center gap-6">
        <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 font-bold text-h3", TIER_ICON_CLASS[tier])}>
          T{tier}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-cap-md text-ink-3 truncate mb-1">{facilityName}</p>
          <div className="flex items-center gap-2 mb-1.5">
            <TierBadge tier={tier} size="md" />
            <span className="text-ink-3">·</span>
            <span className="text-lg font-semibold text-ink-1">{tierName}</span>
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

        <Link href="/partner/my-tier/history" className="shrink-0 btn-outline text-cap-md flex items-center gap-1">
          Lịch sử yêu cầu <ArrowRight size={12} />
        </Link>
      </div>
    </div>
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

  const pillars = [completeness.facilities, completeness.operations, completeness.gallery, completeness.skus];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-1">Độ hoàn thiện hồ sơ</h2>
          <p className="text-cap-md text-ink-3 mt-0.5">4 trụ cột ảnh hưởng trực tiếp đến điểm tín nhiệm</p>
        </div>
        <Link href="/partner/business-profile" className="btn-primary text-cap-md">Hoàn thiện ngay</Link>
      </div>

      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-bg-lv3 mb-4">
        {pillars.map((p, i) => (
          <div
            key={p.id}
            className={cn("h-full rounded-full transition-[width] duration-700 ease-out", PILLAR_COLORS[i])}
            style={{ width: mounted ? `${Math.min((p.score / p.threshold) * 25, 25)}%` : "0%" }}
          />
        ))}
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-lv3 transition-colors text-left"
              >
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", PILLAR_COLORS[i])} />
                <span className="flex-1 text-body text-ink-1">{p.label}</span>
                <span className="text-body font-semibold text-ink-2 tabular-nums">{p.score}/{p.threshold}</span>
                <span className={cn(
                  "text-cap-md font-medium w-12 text-right",
                  pct >= 100 ? "text-success" : pct >= 80 ? "text-warn-text" : "text-danger"
                )}>{pct}%</span>
                <ChevronDown size={14} className={cn("text-ink-3 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
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
    </div>
  );
}

// ─── Up-Rank Roadmap ──────────────────────────────────────────────────────────

function UpRankRoadmap({ roadmap, currentTier }: { roadmap: RoadmapMetric[]; currentTier: number }) {
  const allPassed = roadmap.every((m) => m.passed);

  return (
    <div className="card p-5">
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
            {roadmap.map((m) => (
              <tr key={m.id} className="hover:bg-bg-lv2 transition-colors">
                <td className="px-4 py-3 text-ink-1">{m.label}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-ink-1">
                  {m.current} <span className="text-ink-4 font-normal">{m.unit}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-3">
                  {m.threshold} <span className="text-ink-4">{m.unit}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {m.passed
                    ? <span className="text-success">—</span>
                    : <span className="text-danger font-medium">+{m.threshold - m.current} {m.unit}</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {m.passed
                    ? <CheckCircle2 size={16} className="text-success inline-block" />
                    : <Lock size={14} className="text-ink-4 inline-block" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-cap-md text-ink-3">
          {allPassed
            ? "Bạn đã đủ điều kiện nâng hạng. Hãy gửi yêu cầu ngay!"
            : `Cần hoàn thiện thêm ${roadmap.filter((m) => !m.passed).length} chỉ số để nâng hạng.`}
        </p>
        <div className="relative group">
          <button
            disabled={!allPassed}
            className={cn(
              "btn-primary transition-all",
              allPassed
                ? "shadow-[0_0_20px_4px_rgba(200,165,58,0.5)] animate-pulse"
                : "opacity-40 cursor-not-allowed"
            )}
          >
            Gửi yêu cầu nâng hạng
          </button>
          {!allPassed && (
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-ink-1 text-white text-cap-md rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lv2">
              Hoàn thiện đủ các chỉ số bên trên để mở khoá tính năng này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Verify Modal ───────────────────────────────────────────────────────

function QuickVerifyModal({
  facilityName,
  fields,
  onClose,
  onSubmit,
}: {
  facilityName: string;
  fields: QuickVerifyField[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = fields.every((f) => checked[f.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/40 backdrop-blur-sm">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-[480px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h3 className="text-lg font-semibold text-ink-1">Xác nhận thông tin hồ sơ</h3>
            <p className="text-cap-md text-ink-3 mt-0.5">{facilityName}</p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <p className="text-body text-ink-2 mb-4">Vui lòng xác nhận các thông tin dưới đây vẫn còn chính xác:</p>
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
              <label
                key={field.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                  checked[field.id] ? "border-success bg-success-light/40" : "border-line hover:bg-bg-lv2"
                )}
              >
                <input
                  type="checkbox"
                  checked={!!checked[field.id]}
                  onChange={() => setChecked((prev) => ({ ...prev, [field.id]: !prev[field.id] }))}
                  className="mt-0.5 shrink-0 accent-success"
                />
                <div className="min-w-0">
                  <div className="text-cap-md text-ink-3 mb-0.5">{field.label}</div>
                  <div className="text-body font-medium text-ink-1">{field.value}</div>
                </div>
                {checked[field.id] && <CheckCircle2 size={16} className="text-success shrink-0 ml-auto mt-0.5" />}
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Để sau</button>
          <button
            onClick={() => { if (allChecked) onSubmit(); }}
            disabled={!allChecked}
            className={cn("btn-primary", !allChecked && "opacity-40 cursor-not-allowed")}
          >
            Xác nhận — Vẫn chính xác
          </button>
        </div>
      </div>
    </div>
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
  const [toast, setToast] = useState<string | null>(null);

  const isMultiFacility = PARTNER_FACILITIES.length > 1;
  const facilityData = FACILITY_TIER_DATA[displayId];
  const facility = PARTNER_FACILITIES.find((f) => f.id === displayId);

  function handleFacilitySelect(id: string) {
    if (id === displayId || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setDisplayId(id);
      setSelectedFacilityId(id);
      setIsTransitioning(false);
    }, 500);
  }

  const showFreshness =
    facilityData &&
    facilityData.freshnessDaysStale >= FRESHNESS_THRESHOLD &&
    !dismissedFreshness.has(displayId);

  function handleVerifySubmit() {
    setShowVerifyModal(false);
    setDismissedFreshness((prev) => new Set([...prev, displayId]));
    setToast(`Thông tin hồ sơ của ${facility?.name ?? "cơ sở"} đã được xác nhận thành công.`);
  }

  if (!facilityData || !facility) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-bg-lv2">
      <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col gap-5">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h3 font-bold text-ink-1">Hạng của tôi</h1>
            <p className="text-body text-ink-3 mt-1">Theo dõi phân hạng, lộ trình nâng cấp và đồng bộ hạng</p>
          </div>
          {isMultiFacility && (
            <FacilitySwitcher selectedId={displayId} onSelect={handleFacilitySelect} />
          )}
        </div>

        {/* Single-facility promo */}
        {!isMultiFacility && <SingleFacilityBanner />}

        {/* Freshness banner */}
        {showFreshness && (
          <FreshnessBanner
            facilityName={facility.name}
            days={facilityData.freshnessDaysStale}
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

          <TierHeaderCard data={facilityData} facilityName={facility.name} />

          <CompletenessMeter
            completeness={facilityData.completeness}
            missingFields={facilityData.missingFields}
            facilityId={displayId}
          />

          <UpRankRoadmap roadmap={facilityData.roadmap} currentTier={facilityData.tier} />

          {/* Sync CTA (only for multi-facility) */}
          {isMultiFacility && (
            <div className="card p-5 flex items-center gap-4">
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
            </div>
          )}
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
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
