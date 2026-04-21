"use client";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Gift, CalendarDays } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import type { TierLevel } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";

const TIER_LEVELS: TierLevel[] = [0, 1, 2, 3, 4, 5];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GrantModal({ open, onClose }: Props) {
  const grantComplimentary = useTierRequests((s) => s.grantComplimentary);
  const requests = useTierRequests((s) => s.requests);

  // Deduplicated facility list from mock requests
  const allFacilities = useMemo(() => {
    const seen = new Set<string>();
    return requests
      .filter((r) => { if (seen.has(r.facility.id)) return false; seen.add(r.facility.id); return true; })
      .map((r) => r.facility);
  }, [requests]);

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [targetTier, setTargetTier] = useState<TierLevel | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFacility = allFacilities.find((f) => f.id === selectedFacilityId) ?? null;

  const filteredFacilities = useMemo(
    () => allFacilities.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8),
    [allFacilities, search]
  );

  function selectFacility(id: string, name: string) {
    setSelectedFacilityId(id);
    setSearch(name);
    setShowDropdown(false);
    setTargetTier(null);
  }

  function handleBlur() {
    setTimeout(() => setShowDropdown(false), 150);
  }

  function handleClose() {
    setSearch(""); setSelectedFacilityId(null); setTargetTier(null);
    setExpiryDate(""); setNotes("");
    onClose();
  }

  function handleSubmit() {
    if (!selectedFacilityId || targetTier === null || !expiryDate || notes.trim().length < 10) return;
    grantComplimentary(selectedFacilityId, targetTier, expiryDate, notes.trim());
    handleClose();
  }

  const canSubmit = selectedFacilityId && targetTier !== null && expiryDate && notes.trim().length >= 10;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-[520px]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
            <div className="w-8 h-8 rounded-full bg-grade-aBg flex items-center justify-center shrink-0">
              <Gift size={16} className="text-grade-a" />
            </div>
            <div className="flex-1">
              <h2 className="text-body font-semibold text-ink-1">Cấp hạng ưu đãi</h2>
              <p className="text-cap text-ink-3">Cấp quyền truy cập hạng chủ động cho cơ sở</p>
            </div>
            <button onClick={handleClose} className="text-ink-3 hover:text-ink-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Facility search */}
            <div className="space-y-1.5">
              <label className="text-cap-md font-semibold text-ink-1">
                Cơ sở <span className="text-danger">*</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
                <input
                  className="input pl-8 w-full"
                  placeholder="Tìm tên cơ sở…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setSelectedFacilityId(null); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={handleBlur}
                />
                {showDropdown && filteredFacilities.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-line rounded-lg shadow-lv2 z-10 max-h-[200px] overflow-y-auto">
                    {filteredFacilities.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onMouseDown={() => selectFacility(f.id, f.name)}
                        className="w-full text-left px-3 py-2.5 hover:bg-bg-lv2 transition-colors"
                      >
                        <div className="text-body font-medium text-ink-1">{f.name}</div>
                        <div className="text-cap text-ink-3">{f.location} · {f.partner}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current metrics (shown after facility selected) */}
            {selectedFacility && (
              <div className="bg-bg-lv2 rounded-lg p-3 flex gap-4 items-center">
                <div className="text-cap-md text-ink-2 flex-1">
                  <span className="font-semibold text-ink-1">{selectedFacility.name}</span>
                  <div className="mt-1 text-ink-3">{selectedFacility.location} · {selectedFacility.vertical}</div>
                </div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-ink-1">{selectedFacility.dataScore}</div>
                  <div className="text-cap text-ink-4">Data</div>
                </div>
                <div className="text-center">
                  <div className="text-h4 font-bold text-ink-1">{selectedFacility.serviceScore}</div>
                  <div className="text-cap text-ink-4">Service</div>
                </div>
                <div className="text-center">
                  <TierBadge tier={selectedFacility.currentTier} />
                  <div className="text-cap text-ink-4 mt-0.5">Hiện tại</div>
                </div>
              </div>
            )}

            {/* Tier selector */}
            <div className="space-y-1.5">
              <label className="text-cap-md font-semibold text-ink-1">
                Hạng mục tiêu <span className="text-danger">*</span>
              </label>
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
                        "px-3 py-1.5 rounded-lg text-body font-medium border transition-colors",
                        targetTier === t ? "bg-ink-1 text-white border-ink-1" : "bg-bg-lv1 text-ink-2 border-line hover:border-ink-3",
                        disabled && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      Tier {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expiry date */}
            <div className="space-y-1.5">
              <label className="text-cap-md font-semibold text-ink-1 flex items-center gap-1.5">
                <CalendarDays size={14} /> Ngày hết hạn <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="input w-full"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Strategic notes */}
            <div className="space-y-1.5">
              <label className="text-cap-md font-semibold text-ink-1">
                Lý do chiến lược <span className="text-danger">*</span>
              </label>
              <textarea
                className="input w-full resize-none text-cap-md"
                rows={3}
                placeholder="Mô tả lý do cấp hạng ưu đãi (bắt buộc, tối thiểu 10 ký tự)…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-cap text-ink-4">{notes.trim().length} ký tự</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-bg-lv2/40 rounded-b-xl">
            <button onClick={handleClose} className="btn-outline">Huỷ</button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
            >
              <Gift size={14} /> Cấp hạng ưu đãi
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
