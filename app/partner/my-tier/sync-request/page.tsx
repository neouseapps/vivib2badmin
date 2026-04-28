"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Link2, ArrowRight, ArrowLeft, Check, Building2, MapPin, ChevronDown,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import { PARTNER_FACILITIES, FACILITY_TIER_DATA } from "@/lib/mock/partnerTier";
import type { FacilityRef, TierLevel } from "@/lib/tier-requests/types";

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          {i > 0 && <div className={cn("h-px w-8", step > s - 1 ? "bg-brand" : "bg-line")} />}
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-cap-md font-semibold transition-colors",
            step === s ? "bg-brand text-white" : step > s ? "bg-success text-white" : "bg-bg-lv3 text-ink-3"
          )}>
            {step > s ? <Check size={12} /> : s}
          </div>
          <span className={cn("text-cap-md whitespace-nowrap", step === s ? "text-ink-1 font-semibold" : "text-ink-3")}>
            {s === 1 ? "Chọn nguồn & đích" : "Thông tin bổ sung"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Facility card ────────────────────────────────────────────────────────────

function FacilityCard({
  facility,
  selected,
  disabled,
  disabledReason,
  onClick,
  showCheckbox,
  receivedTier,
}: {
  facility: FacilityRef;
  selected: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
  showCheckbox?: boolean;
  receivedTier?: TierLevel | null;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-full text-left rounded-xl border p-4 transition-all",
          selected && !disabled
            ? "border-brand bg-brand/5 shadow-sm"
            : "border-line hover:border-ink-3 hover:bg-bg-lv2",
          disabled && "opacity-50 cursor-not-allowed bg-bg-lv2"
        )}
      >
        <div className="flex items-start gap-3">
          {showCheckbox && (
            <div className={cn(
              "w-5 h-5 rounded shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors",
              selected && !disabled ? "border-brand bg-brand" : "border-line"
            )}>
              {selected && !disabled && <Check size={11} className="text-white" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-body font-semibold text-ink-1 truncate">{facility.name}</span>
              <TierBadge tier={facility.currentTier} />
              {receivedTier != null && !disabled && (
                <span className="flex items-center gap-1 text-cap-md text-info bg-info-light rounded px-1.5 py-0.5 whitespace-nowrap">
                  → Sẽ nhận <TierBadge tier={receivedTier} />
                </span>
              )}
              {disabled && <AlertCircle size={13} className="text-warn-text shrink-0" />}
            </div>
            <div className="flex items-center gap-1 text-cap-md text-ink-3">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{facility.location}</span>
              <span className="mx-1">·</span>
              <span>{facility.vertical}</span>
            </div>
            {disabled && disabledReason && (
              <p className="text-cap-md text-warn-text mt-1.5">{disabledReason}</p>
            )}
          </div>
          {selected && !showCheckbox && <Check size={16} className="text-brand shrink-0 mt-0.5" />}
        </div>
      </button>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

// Source must: have organic period_tier ≥ 2, be active (not grace), not itself a sync/complimentary recipient
const sourceFacilities = PARTNER_FACILITIES.filter((f) => {
  const state = FACILITY_TIER_DATA[f.id];
  if (!state) return false;
  return (
    state.period_tier >= 2 &&
    state.tier_status === "active" &&
    state.synchronized_tier === null &&
    state.complimentary_tier === null
  );
});

// The tier a target facility would receive = source's period_tier (capped by target eligibility)
function getReceivedTier(sourcePeriodTier: TierLevel): TierLevel {
  return sourcePeriodTier as TierLevel;
}

function Step1({
  sourceId,
  setSourceId,
  targetIds,
  setTargetIds,
}: {
  sourceId: string;
  setSourceId: (id: string) => void;
  targetIds: Set<string>;
  setTargetIds: (ids: Set<string>) => void;
}) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const sourceFacility = PARTNER_FACILITIES.find((f) => f.id === sourceId);
  const sourceState = sourceId ? FACILITY_TIER_DATA[sourceId] : null;
  const sourcePeriodTier = (sourceState?.period_tier ?? null) as TierLevel | null;
  const targets = PARTNER_FACILITIES.filter((f) => f.id !== sourceId);

  function toggleTarget(id: string) {
    const facilityState = FACILITY_TIER_DATA[id];
    if (facilityState?.syncDisabledReason) return;
    const next = new Set(targetIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setTargetIds(next);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Source */}
      <div>
        <label className="text-body font-semibold text-ink-1 block mb-2">
          Cơ sở nguồn <span className="text-danger">*</span>
          <span className="text-cap-md text-ink-3 font-normal ml-2">(Hữu cơ Tier ≥ 2, đang hoạt động)</span>
        </label>

        {sourceFacilities.length === 0 ? (
          <div className="rounded-xl border border-line bg-bg-lv2 px-4 py-3 text-body text-ink-3">
            Chưa có cơ sở nào đạt Tier 2 trở lên để làm nguồn đồng bộ.
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSourceOpen((v) => !v)}
              className="input flex items-center gap-2 w-full text-left"
            >
              {sourceFacility ? (
                <>
                  <span className="flex-1 text-ink-1 font-medium">{sourceFacility.name}</span>
                  <TierBadge tier={sourceFacility.currentTier} />
                </>
              ) : (
                <span className="flex-1 text-ink-4">Chọn cơ sở nguồn…</span>
              )}
              <ChevronDown size={14} className={cn("text-ink-3 transition-transform", sourceOpen && "rotate-180")} />
            </button>

            {sourceOpen && (
              <div className="absolute z-20 mt-1 w-full bg-bg-lv1 border border-line rounded-xl shadow-lv2 py-1">
                {sourceFacilities.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { setSourceId(f.id); setTargetIds(new Set()); setSourceOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-bg-lv3 text-left"
                  >
                    <span className="flex-1 text-body text-ink-1">{f.name}</span>
                    <TierBadge tier={f.currentTier} />
                    {f.id === sourceId && <Check size={13} className="text-brand shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Targets */}
      <div>
        <label className="text-body font-semibold text-ink-1 block mb-2">
          Cơ sở đích <span className="text-danger">*</span>
          <span className="text-cap-md text-ink-3 font-normal ml-2">(có thể chọn nhiều)</span>
        </label>

        {!sourceId || targets.length === 0 ? (
          <p className="text-body text-ink-3 text-center py-6">Chọn cơ sở nguồn trước.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {targets.map((f) => {
              const state = FACILITY_TIER_DATA[f.id];
              const disabledReason = state?.syncDisabledReason;
              return (
                <FacilityCard
                  key={f.id}
                  facility={f}
                  selected={targetIds.has(f.id)}
                  disabled={!!disabledReason}
                  disabledReason={disabledReason}
                  onClick={() => toggleTarget(f.id)}
                  showCheckbox
                  receivedTier={sourcePeriodTier}
                />
              );
            })}
          </div>
        )}
      </div>

      {sourceFacility && sourcePeriodTier && targetIds.size > 0 && (
        <div className="rounded-xl bg-info-light border border-info/20 px-4 py-3 flex items-center gap-3">
          <Link2 size={15} className="text-info shrink-0" />
          <p className="text-cap-md text-info">
            Hạng hữu cơ <span className="font-semibold">Tier {sourcePeriodTier}</span> từ{" "}
            <span className="font-semibold">{sourceFacility.name}</span> sẽ được đồng bộ tới{" "}
            <span className="font-semibold">{targetIds.size} cơ sở</span> được chọn.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

const DURATIONS: { value: 30 | 60 | 90; label: string }[] = [
  { value: 30, label: "30 ngày" },
  { value: 60, label: "60 ngày" },
  { value: 90, label: "90 ngày" },
];

function Step2({
  duration,
  setDuration,
  justification,
  setJustification,
}: {
  duration: 30 | 60 | 90;
  setDuration: (d: 30 | 60 | 90) => void;
  justification: string;
  setJustification: (s: string) => void;
}) {
  const minChars = 50;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-body font-semibold text-ink-1 block mb-2">
          Thời hạn đề xuất <span className="text-danger">*</span>
        </label>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-body font-medium transition-all",
                duration === d.value ? "border-brand bg-brand/5 text-brand" : "border-line text-ink-2 hover:border-ink-3"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-body font-semibold text-ink-1 block mb-2">
          Lý do đồng bộ hạng <span className="text-danger">*</span>
          <span className="text-cap-md text-ink-3 font-normal ml-2">(tối thiểu {minChars} ký tự)</span>
        </label>
        <textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Mô tả lý do bạn muốn đồng bộ hạng giữa các cơ sở. Ví dụ: Các chi nhánh đang đáp ứng cùng tiêu chuẩn dịch vụ với cơ sở đầu hệ thống…"
          rows={5}
          className="input w-full resize-none"
        />
        <div className={cn("mt-1 text-cap-md text-right", justification.length >= minChars ? "text-success" : "text-ink-3")}>
          {justification.length >= minChars ? `✓ ${justification.length} ký tự` : `Cần thêm ${minChars - justification.length} ký tự`}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state (only 1 facility) ───────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="w-20 h-20 rounded-2xl bg-info-light flex items-center justify-center mb-5">
        <Building2 size={32} className="text-info" />
      </div>
      <h2 className="text-h3 font-bold text-ink-1 mb-2">Chỉ có một cơ sở</h2>
      <p className="text-body text-ink-2 max-w-sm mb-6">
        Đồng bộ hạng yêu cầu ít nhất <span className="font-semibold">2 cơ sở trở lên</span>.
        Hãy đăng ký thêm cơ sở để sử dụng tính năng này.
      </p>
      <button className="btn-primary mt-2 flex items-center gap-2">
        <Building2 size={15} />
        Mở rộng cơ sở mới
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SyncRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceId, setSourceId] = useState(sourceFacilities[0]?.id ?? "");
  const [targetIds, setTargetIds] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState<30 | 60 | 90>(30);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (PARTNER_FACILITIES.length <= 1) {
    return <div className="flex-1 flex flex-col min-h-0 bg-bg-lv2"><EmptyState /></div>;
  }

  const step1Valid = !!sourceId && targetIds.size > 0;
  const step2Valid = justification.length >= 50;

  async function handleSubmit() {
    if (!step2Valid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/partner/my-tier/history?submitted=1");
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-bg-lv2">
      <div className="max-w-2xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        <div>
          <button
            onClick={() => step === 2 ? setStep(1) : router.back()}
            className="flex items-center gap-1.5 text-cap-md text-ink-3 hover:text-ink-1 mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            {step === 2 ? "Quay lại bước 1" : "Quay lại"}
          </button>
          <h1 className="text-h3 font-bold text-ink-1">Gửi yêu cầu đồng bộ hạng</h1>
          <p className="text-body text-ink-3 mt-1">
            Áp dụng hạng cao từ cơ sở đầu hệ thống xuống các chi nhánh còn lại
          </p>
        </div>

        <StepIndicator step={step} />

        <div className="card p-6">
          {step === 1 ? (
            <Step1
              sourceId={sourceId}
              setSourceId={setSourceId}
              targetIds={targetIds}
              setTargetIds={setTargetIds}
            />
          ) : (
            <Step2
              duration={duration}
              setDuration={setDuration}
              justification={justification}
              setJustification={setJustification}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => step === 2 ? setStep(1) : router.back()}
            className="btn-outline flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            {step === 2 ? "Bước trước" : "Hủy"}
          </button>

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className={cn("btn-primary flex items-center gap-1", !step1Valid && "opacity-40 cursor-not-allowed")}
            >
              Tiếp theo <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!step2Valid || submitting}
              className={cn("btn-primary flex items-center gap-1", (!step2Valid || submitting) && "opacity-40 cursor-not-allowed")}
            >
              {submitting ? "Đang gửi…" : <>Gửi yêu cầu <ArrowRight size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
