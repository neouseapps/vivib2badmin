"use client";

import { useState } from "react";
import {
  X, Link2, ArrowLeft, ArrowRight, Check, Building2, MapPin,
  ChevronDown, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
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
  facility, selected, disabled, disabledReason, onClick, showCheckbox, receivedTier,
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all",
        selected && !disabled ? "border-brand bg-brand/5 shadow-sm" : "border-line hover:border-ink-3 hover:bg-bg-lv2",
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
  );
}

// ─── Source filter ────────────────────────────────────────────────────────────

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

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({
  sourceId, setSourceId, targetIds, setTargetIds,
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
    if (FACILITY_TIER_DATA[id]?.syncDisabledReason) return;
    const next = new Set(targetIds);
    next.has(id) ? next.delete(id) : next.add(id);
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
  duration, setDuration, justification, setJustification,
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
          placeholder="Mô tả lý do bạn muốn đồng bộ hạng giữa các cơ sở…"
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

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SyncRequestModal({
  onClose,
  onSubmit,
  initialTargetIds,
}: {
  onClose: () => void;
  /** Called after the mock submit delay. Parent should show a toast. */
  onSubmit: () => void;
  /** Pre-selected target facility IDs (from bulk selection in the table). */
  initialTargetIds?: Set<string>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceId, setSourceId] = useState(sourceFacilities[0]?.id ?? "");
  const [targetIds, setTargetIds] = useState<Set<string>>(initialTargetIds ?? new Set());
  const [duration, setDuration] = useState<30 | 60 | 90>(30);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const step1Valid = !!sourceId && targetIds.size > 0;
  const step2Valid = justification.length >= 50;

  async function handleSubmit() {
    if (!step2Valid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    onSubmit();
    onClose();
  }

  const isOnlyOneFacility = PARTNER_FACILITIES.length <= 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-1/40 backdrop-blur-sm p-4">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-full max-w-[640px] max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-ink-1">Gửi yêu cầu đồng bộ hạng</h3>
            <p className="text-cap-md text-ink-3 mt-0.5">
              Áp dụng hạng cao từ cơ sở đầu hệ thống xuống các chi nhánh còn lại
            </p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors ml-4 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {isOnlyOneFacility ? (
            <div className="flex flex-col items-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-info-light flex items-center justify-center mb-4">
                <Building2 size={28} className="text-info" />
              </div>
              <h4 className="text-h3 font-bold text-ink-1 mb-2">Chỉ có một cơ sở</h4>
              <p className="text-body text-ink-2 max-w-xs">
                Đồng bộ hạng yêu cầu ít nhất <span className="font-semibold">2 cơ sở trở lên</span>.
              </p>
            </div>
          ) : (
            <>
              <StepIndicator step={step} />
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
            </>
          )}
        </div>

        {/* Footer */}
        {!isOnlyOneFacility && (
          <div className="px-6 py-4 border-t border-line flex items-center justify-between shrink-0">
            <Button
              onClick={() => step === 2 ? setStep(1) : onClose()}
              variant="outline"
            >
              <ArrowLeft size={14} />
              {step === 2 ? "Bước trước" : "Hủy"}
            </Button>

            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                variant="primary"
                className={cn(!step1Valid && "opacity-40 cursor-not-allowed")}
              >
                Tiếp theo <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!step2Valid || submitting}
                variant="primary"
                className={cn((!step2Valid || submitting) && "opacity-40 cursor-not-allowed")}
              >
                {submitting ? "Đang gửi…" : <>Gửi yêu cầu <ArrowRight size={14} /></>}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
