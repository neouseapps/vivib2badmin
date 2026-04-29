"use client";
import { useState, useMemo, useRef } from "react";
import { Search, Gift, Clock } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import { PARTNER_FACILITIES } from "@/lib/mock/partnerTier";
import type { TierLevel, FacilityRef } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";
import { Dialog, Button } from "@/components/ui";

const TIER_LEVELS: TierLevel[] = [1, 2, 3, 4];
const TIER_NAME: Record<TierLevel, string> = {
  0: "Khởi tạo",
  1: "Đồng hành",
  2: "Tinh hoa",
  3: "Biểu tượng",
  4: "Chiến lược",
  5: "Hạng 5",
};
const DURATION_OPTIONS = [30, 60, 90] as const;
type DurationDays = typeof DURATION_OPTIONS[number];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GrantModal({ open, onClose }: Props) {
  const grantComplimentary = useTierRequests((s) => s.grantComplimentary);
  const requests = useTierRequests((s) => s.requests);

  const allFacilities = useMemo<FacilityRef[]>(() => {
    const seen = new Set<string>(PARTNER_FACILITIES.map((f) => f.id));
    const fromRequests = requests
      .filter((r) => { if (seen.has(r.facility.id)) return false; seen.add(r.facility.id); return true; })
      .map((r) => r.facility);
    return [...PARTNER_FACILITIES, ...fromRequests];
  }, [requests]);

  const [search, setSearch]                     = useState("");
  const [showDropdown, setShowDropdown]         = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [targetTier, setTargetTier]             = useState<TierLevel | null>(null);
  const [durationDays, setDurationDays]         = useState<DurationDays | null>(null);
  const [notes, setNotes]                       = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFacility = allFacilities.find((f) => f.id === selectedFacilityId) ?? null;

  const filteredFacilities = useMemo(
    () => allFacilities
      .filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.partner.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 8),
    [allFacilities, search]
  );

  function selectFacility(id: string, name: string) {
    setSelectedFacilityId(id);
    setSearch(name);
    setShowDropdown(false);
    setTargetTier(null);
  }

  function handleClose() {
    setSearch(""); setSelectedFacilityId(null); setTargetTier(null);
    setDurationDays(null); setNotes("");
    onClose();
  }

  function handleSubmit() {
    if (!selectedFacilityId || targetTier === null || !durationDays || notes.trim().length < 20) return;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();
    grantComplimentary(selectedFacilityId, targetTier, expiresAt, notes.trim());
    handleClose();
  }

  const canSubmit =
    selectedFacilityId !== null &&
    targetTier !== null &&
    durationDays !== null &&
    notes.trim().length >= 20;

  return (
    <Dialog open={open} onClose={handleClose} size="md">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
        <div className="w-8 h-8 rounded-full bg-grade-aBg flex items-center justify-center shrink-0">
          <Gift size={16} className="text-grade-a" />
        </div>
        <div className="flex-1">
          <h2 className="text-body font-semibold text-ink-1">Cấp hạng ưu đãi</h2>
          <p className="text-cap text-ink-3">Cấp quyền truy cập hạng đặc cách cho cơ sở dịch vụ</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {/* 1 — Facility search */}
        <div className="space-y-1.5">
          <label className="text-cap-md font-semibold text-ink-1">
            Cơ sở mục tiêu <span className="text-danger">*</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
            <input
              className="input pl-8 w-full"
              placeholder="Tìm theo tên cơ sở hoặc đối tác…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setSelectedFacilityId(null); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && filteredFacilities.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-line rounded-lg shadow-lv2 z-10 max-h-[200px] overflow-y-auto scrollbar-thin">
                {filteredFacilities.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onMouseDown={() => selectFacility(f.id, f.name)}
                    className="w-full text-left px-3 py-2.5 hover:bg-bg-lv2 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-body font-medium text-ink-1 flex-1 min-w-0 truncate">{f.name}</span>
                      <TierBadge tier={f.currentTier} />
                    </div>
                    <div className="text-cap text-ink-3 mt-0.5">{f.partner} · {f.location}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Facility summary card */}
        {selectedFacility && (
          <div className="bg-bg-lv2 rounded-lg p-3 flex gap-4 items-center">
            <div className="text-cap-md text-ink-2 flex-1 min-w-0">
              <span className="font-semibold text-ink-1 block truncate">{selectedFacility.name}</span>
              <div className="mt-0.5 text-ink-3 truncate">{selectedFacility.location} · {selectedFacility.vertical}</div>
            </div>
            <div className="text-center shrink-0">
              <div className="text-h4 font-bold text-ink-1">{selectedFacility.dataScore}</div>
              <div className="text-cap text-ink-4">Data</div>
            </div>
            <div className="text-center shrink-0">
              <div className="text-h4 font-bold text-ink-1">{selectedFacility.serviceScore}</div>
              <div className="text-cap text-ink-4">Service</div>
            </div>
            <div className="text-center shrink-0">
              <TierBadge tier={selectedFacility.currentTier} />
              <div className="text-cap text-ink-4 mt-0.5">Hạng tự nhiên</div>
            </div>
          </div>
        )}

        {/* 2 — Tier level */}
        <div className="space-y-1.5">
          <label className="text-cap-md font-semibold text-ink-1">
            Mức hạng cấp <span className="text-danger">*</span>
          </label>
          {selectedFacility && (
            <p className="text-cap text-ink-3">
              Chỉ có thể cấp cao hơn hạng tự nhiên hiện tại (Tier {selectedFacility.currentTier})
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            {TIER_LEVELS.map((t) => {
              const disabled = selectedFacility ? t <= selectedFacility.currentTier : false;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => setTargetTier(t)}
                  className={cn(
                    "flex flex-col items-center px-4 py-2 rounded-lg border transition-colors",
                    targetTier === t
                      ? "bg-ink-1 text-white border-ink-1"
                      : "bg-bg-lv1 text-ink-2 border-line hover:border-ink-3",
                    disabled && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <span className="text-body font-semibold">Tier {t}</span>
                  <span className={cn("text-cap mt-0.5", targetTier === t ? "text-white/70" : "text-ink-4")}>
                    {TIER_NAME[t]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 — Duration */}
        <div className="space-y-1.5">
          <label className="text-cap-md font-semibold text-ink-1 flex items-center gap-1.5">
            <Clock size={14} /> Thời hạn <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationDays(d)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-body font-medium border transition-colors",
                  durationDays === d
                    ? "bg-ink-1 text-white border-ink-1"
                    : "bg-bg-lv1 text-ink-2 border-line hover:border-ink-3"
                )}
              >
                {d} ngày
              </button>
            ))}
          </div>
          {durationDays && targetTier !== null && (
            <p className="text-cap text-ink-3">
              Hết hạn:{" "}
              <span className="font-medium text-ink-2">
                {new Date(Date.now() + durationDays * 24 * 3600 * 1000).toLocaleDateString("vi-VN")}
              </span>
            </p>
          )}
        </div>

        {/* 4 — Business justification */}
        <div className="space-y-1.5">
          <label className="text-cap-md font-semibold text-ink-1">
            Lý do nghiệp vụ <span className="text-danger">*</span>
          </label>
          <textarea
            className="input w-full resize-none text-cap-md"
            rows={3}
            placeholder="Mô tả lý do cấp hạng đặc cách — thông tin này sẽ được lưu vào Audit Log…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className={cn("text-cap", notes.trim().length >= 20 ? "text-success" : "text-ink-4")}>
            {notes.trim().length} / 20 ký tự tối thiểu
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-bg-lv2/40 rounded-b-lg">
        <Button variant="outline" onClick={handleClose}>Huỷ</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit} leftIcon={Gift}>
          Cấp hạng ưu đãi
        </Button>
      </div>
    </Dialog>
  );
}
