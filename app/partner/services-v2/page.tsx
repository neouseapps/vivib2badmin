"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search, Plus, X, MapPin, ExternalLink,
  CheckCircle2, Lock, Link2, Building2,
  AlertCircle, History, ChevronDown, ChevronRight,
  Sprout, Gift, Clock,
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
  type PartnerHistoryStatus,
  type PartnerHistoryItem,
  type FacilityTierState,
  type RoadmapMetric,
} from "@/lib/mock/partnerTier";
import {
  INITIAL_LOCATIONS,
  LOCATION_MAIN_FACILITY,
  getFacilityFullAddress,
  type BusinessLocation,
  type ServiceCard as ServiceCardType,
} from "@/lib/mock/businessLocations";
import { LocationGroup, AddressEditModal } from "@/components/partner/LocationGroup";
import { SyncRequestModal } from "@/components/partner/SyncRequestModal";
import { TierTrackPanel } from "@/components/partner/TierTrackPanel";
import { QuickVerifyModal } from "@/components/partner/QuickVerifyModal";

// ─── Constants & helpers ──────────────────────────────────────────────────────

const COMPANY = {
  name: "Tập đoàn Mặt Trời",
  taxCode: "0301234567-001",
  address: "Lô 18A KCN Hòa Khánh, Liên Chiểu, Đà Nẵng",
  verified: true,
};

const STATUS_META: Record<PartnerHistoryStatus, { label: string; chipClass: string }> = {
  pending:  { label: "Đang chờ",    chipClass: "bg-info-light text-info"        },
  approved: { label: "Đã duyệt",    chipClass: "bg-success-light text-success"  },
  deferred: { label: "Cần bổ sung", chipClass: "bg-warn-light text-warn-text"   },
  expired:  { label: "Hết hạn",     chipClass: "bg-bg-lv3 text-ink-3"           },
};

function getOverallCompleteness(data?: FacilityTierState): number {
  if (!data) return 0;
  const ps = [data.completeness.facilities, data.completeness.operations, data.completeness.gallery, data.completeness.skus];
  return Math.round(ps.reduce((s, p) => s + Math.min((p.score / p.threshold) * 100, 100), 0) / ps.length);
}

function getActiveRequest(facilityId: string) {
  const items = PARTNER_HISTORY_BY_FACILITY[facilityId] ?? [];
  return items.find(i => i.status === "pending" || i.status === "deferred") ?? null;
}

function getActiveSyncRequestStatus(facilityId: string): "pending" | "deferred" | null {
  const items = PARTNER_HISTORY_BY_FACILITY[facilityId] ?? [];
  const req = items.find(i => i.kind === "sync" && (i.status === "pending" || i.status === "deferred"));
  return (req?.status as "pending" | "deferred") ?? null;
}

function formatDaysAgo(days: number): string {
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Color for the "N ngày" label based on freshness thresholds:
 *  0–19 days  → green  (no warning)
 * 20–60 days  → blue   (hint)
 * 61–90 days  → amber  (warn / pre_urgent)
 * 91+ days    → red    (urgent / score = 0)
 */
function getFreshnessDayColor(days: number): string {
  if (days >= 91) return "text-danger";
  if (days >= 61) return "text-warn-text";
  if (days >= 20) return "text-info";
  return "text-success";
}

const TIER_OPTIONS: { value: number | "all"; label: string }[] = [
  { value: "all", label: "Tất cả hạng" }, { value: 0, label: "Tier 0" }, { value: 1, label: "Tier 1" },
  { value: 2, label: "Tier 2" }, { value: 3, label: "Tier 3" }, { value: 4, label: "Tier 4" }, { value: 5, label: "Tier 5" },
];

// ─── Business Profile header ─────────────────────────────────────────────────

function BusinessProfileHeader() {
  return (
    <Card padding="lg" className="flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
        <span className="text-brand text-h3 font-bold">M</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-ink-1 truncate">{COMPANY.name}</h2>
          {COMPANY.verified && (
            <Badge intention="success" style="light">
              <CheckCircle2 size={11} /> Đã xác thực
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-cap-md text-ink-3 flex-wrap">
          <span>MST: <span className="font-medium text-ink-2">{COMPANY.taxCode}</span></span>
          <span className="flex items-center gap-1 min-w-0">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{COMPANY.address}</span>
          </span>
        </div>
      </div>
      <Link
        href="/partner/business-profile"
        className="btn-outline text-cap-md flex items-center gap-1 shrink-0"
      >
        Xem chi tiết hồ sơ <ExternalLink size={11} />
      </Link>
    </Card>
  );
}

// ─── Tab: Locations View — uses shared LocationGroup (same as business-profile)

function LocationsView({ onSelect }: { onSelect: (facilityId: string) => void }) {
  const [locations, setLocations] = useState<BusinessLocation[]>(INITIAL_LOCATIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressEditId, setAddressEditId] = useState<string | null>(null);

  const updateServices = (locId: string, services: ServiceCardType[]) =>
    setLocations((ls) => ls.map((l) => l.id === locId ? { ...l, services } : l));

  const saveAddress = (locId: string, fields: { address: string; ward: string; district: string; city: string }) =>
    setLocations((ls) => ls.map((l) => l.id === locId ? { ...l, ...fields } : l));

  const addressEditLocation = locations.find((l) => l.id === addressEditId) ?? null;

  /** Click on service card → open drawer with the service's facilityId
      (or fall back to its location's main facility). */
  const handleCardClick = (locationId: string, card: ServiceCardType) => {
    const fid = card.facilityId ?? LOCATION_MAIN_FACILITY[locationId];
    if (fid) onSelect(fid);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {locations.map((loc) => (
          <LocationGroup
            key={loc.id}
            location={loc}
            editing={editingId === loc.id}
            onStartEdit={() => setEditingId(loc.id)}
            onCancelEdit={() => setEditingId(null)}
            onSaveEdit={() => setEditingId(null)}
            onEditAddress={() => setAddressEditId(loc.id)}
            onUpdateServices={(services) => updateServices(loc.id, services)}
            onCardClick={(card) => handleCardClick(loc.id, card)}
          />
        ))}
      </div>

      {addressEditLocation && (
        <AddressEditModal
          location={addressEditLocation}
          onClose={() => setAddressEditId(null)}
          onSave={(fields) => {
            saveAddress(addressEditLocation.id, fields);
            setAddressEditId(null);
          }}
        />
      )}
    </>
  );
}

// ─── Tab: Tier Table View ────────────────────────────────────────────────────

function TierTableView({
  onSelect,
  onSyncSelected,
}: {
  onSelect: (id: string) => void;
  onSyncSelected: (ids: Set<string>) => void;
}) {
  const [query, setQuery] = useState("");
  const [locFilter, setLocFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<number | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allLocations = useMemo(() => Array.from(new Set(PARTNER_FACILITIES.map(f => f.location))), []);

  const filtered = useMemo(() => {
    return PARTNER_FACILITIES.filter((f) => {
      if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (locFilter !== "all" && f.location !== locFilter) return false;
      if (tierFilter !== "all" && f.currentTier !== tierFilter) return false;
      return true;
    });
  }, [query, locFilter, tierFilter]);

  const allSelected = filtered.length > 0 && filtered.every(f => selected.has(f.id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(f => f.id)));
  }
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  return (
    <Card className="overflow-hidden">
      {/* Filter row */}
      <div className="px-5 py-3 border-b border-line flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 input flex-1 min-w-[200px]">
          <Search size={14} className="text-ink-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm dịch vụ theo tên…"
            className="flex-1 bg-transparent outline-none text-body text-ink-1 placeholder:text-ink-4"
          />
        </div>
        <Select
          className="w-auto min-w-[160px]"
          size="sm"
          value={locFilter}
          onChange={(next) => setLocFilter(next)}
          options={[
            { value: "all", label: "Tất cả địa điểm" },
            ...allLocations.map((loc) => ({ value: loc, label: loc })),
          ]}
        />
        <Select
          className="w-auto min-w-[140px]"
          size="sm"
          value={String(tierFilter)}
          onChange={(next) => setTierFilter(next === "all" ? "all" : Number(next))}
          options={TIER_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
        />
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-cap-md text-ink-3">Đã chọn <span className="font-semibold text-ink-1">{selected.size}</span> dịch vụ</span>
            <Button
              onClick={() => onSyncSelected(new Set(selected))}
              variant="primary"
              className="text-cap-md"
            >
              <Link2 size={12} /> Đồng bộ hạng
            </Button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-ink-3 hover:text-ink-1 transition-colors"
              title="Bỏ chọn tất cả"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <table className="w-full text-body">
        <thead>
          <tr className="bg-bg-lv2 border-b border-line text-cap-md text-ink-3">
            <th className="w-10 px-4 py-3">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-brand" />
            </th>
            <th className="text-left px-4 py-3 font-semibold">Cơ sở dịch vụ</th>
            <th className="text-left px-4 py-3 font-semibold">Địa chỉ</th>
            <th className="text-left px-4 py-3 font-semibold">Dịch vụ chính</th>
            <th className="text-center px-4 py-3 font-semibold">Hạng hiện tại</th>
            <th className="text-left px-4 py-3 font-semibold">Trạng thái yêu cầu</th>
            <th className="text-right px-4 py-3 font-semibold">Freshness Score</th>
            <th className="text-left px-4 py-3 font-semibold">Cập nhật cuối</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-12 text-ink-3">
                <Building2 size={28} className="mx-auto mb-2 text-ink-4" />
                <p className="text-body">Không tìm thấy dịch vụ phù hợp.</p>
              </td>
            </tr>
          ) : (
            filtered.map((f) => {
              const data = FACILITY_TIER_DATA[f.id];
              const active = getActiveRequest(f.id);
              const isSelected = selected.has(f.id);
              return (
                <tr
                  key={f.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected ? "bg-brand/5" : "hover:bg-bg-lv2"
                  )}
                  onClick={() => onSelect(f.id)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(f.id)}
                      className="accent-brand"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-body font-medium text-ink-1">{f.name}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{f.location}</td>
                  <td className="px-4 py-3 text-ink-2">{f.vertical}</td>
                  <td className="px-4 py-3 text-center"><TierBadge tier={f.currentTier} /></td>
                  <td className="px-4 py-3">
                    {data?.synchronized_tier !== null && data?.synchronized_tier !== undefined ? (
                      <Badge intention="info" style="light">Đồng bộ</Badge>
                    ) : active ? (
                      <Badge intention="neutral" className={STATUS_META[active.status].chipClass}>
                        {STATUS_META[active.status].label}
                      </Badge>
                    ) : (
                      <span className="text-cap-md text-ink-4">—</span>
                    )}
                  </td>
                  {/* Freshness Score */}
                  <td className="px-4 py-3 text-right">
                    {data ? (() => {
                      const score = getFreshnessScore(data.freshnessDaysStale);
                      const scoreColor = score === 100 ? "text-success" : score >= 50 ? "text-warn-text" : "text-danger";
                      return (
                        <div className="flex items-center justify-end gap-1">
                          <span className={cn("text-cap-md font-semibold tabular-nums", scoreColor)}>{score}</span>
                          <span className="text-cap-md text-ink-4">/ 100</span>
                        </div>
                      );
                    })() : <span className="text-cap-md text-ink-4">—</span>}
                  </td>
                  {/* Cập nhật cuối */}
                  <td className="px-4 py-3">
                    {data ? (() => {
                      const days = data.freshnessDaysStale;
                      const dayColor = getFreshnessDayColor(days);
                      return (
                        <span className={cn("text-cap-md font-medium tabular-nums", dayColor)}>
                          {days} ngày
                        </span>
                      );
                    })() : <span className="text-cap-md text-ink-4">—</span>}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </Card>
  );
}

// ─── Drawer Completeness Meter ────────────────────────────────────────────────

function DrawerCompletenessMeter({ data }: { data: FacilityTierState }) {
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const pillars = [data.completeness.facilities, data.completeness.operations, data.completeness.gallery, data.completeness.skus];
  const overallPct = Math.round(
    pillars.reduce((s, p) => s + Math.min((p.score / p.threshold) * 100, 100), 0) / pillars.length
  );

  return (
    <div>
      <div className="flex flex-col gap-0.5">
        {pillars.map((p) => {
          const pct = Math.round((p.score / p.threshold) * 100);
          const passed = pct >= 100;
          const missing = data.missingFields[p.id] ?? [];
          const isOpen = !passed && openPillar === p.id;

          const rowContent = (
            <>
              <div className="flex items-center gap-2 w-full">
                <span className="flex-1 text-cap-md text-ink-1">{p.label}</span>
                <span className="text-cap-md font-semibold text-ink-2 tabular-nums">{p.score}/{p.threshold}</span>
                <span className={cn(
                  "text-cap-md font-medium w-10 text-right",
                  passed ? "text-success" : pct >= 80 ? "text-warn-text" : "text-danger"
                )}>{pct}%</span>
                {/* chevron only for non-passed pillars */}
                {!passed && (
                  <ChevronDown size={13} className={cn("text-ink-3 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
                )}
                {passed && <CheckCircle2 size={13} className="text-success shrink-0" />}
              </div>
              <div className="w-full h-1.5 bg-bg-lv3 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700 ease-out", passed ? "bg-success" : "bg-danger")}
                  style={{ width: mounted ? `${Math.min(pct, 100)}%` : "0%" }}
                />
              </div>
            </>
          );

          return (
            <div key={p.id}>
              {passed ? (
                /* Passed: static display, no toggle */
                <div className="w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg text-left opacity-70">
                  {rowContent}
                </div>
              ) : (
                /* Not passed: clickable with expand */
                <button
                  onClick={() => setOpenPillar(isOpen ? null : p.id)}
                  className="w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg hover:bg-bg-lv3 transition-colors text-left"
                >
                  {rowContent}
                </button>
              )}

              {isOpen && missing.length > 0 && (
                <div className="mx-3 mb-2 rounded-lg bg-bg-lv2 border border-line p-3 flex flex-col gap-1.5">
                  <p className="text-cap-md font-semibold text-ink-2 mb-0.5">Các mục cần bổ sung:</p>
                  {missing.map((m, mi) => (
                    <div key={mi} className="flex items-start gap-1.5 text-cap-md text-ink-2">
                      <ChevronRight size={11} className="text-ink-4 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end px-4 pt-2 pb-3">
        <Link href="/partner/business-profile" className="btn-primary text-cap-md shrink-0">
          Hoàn thiện ngay
        </Link>
      </div>
    </div>
  );
}

// ─── Drawer Roadmap ───────────────────────────────────────────────────────────

function DrawerRoadmap({ roadmap }: { roadmap: RoadmapMetric[]; currentTier: number }) {
  return (
    <div>
      <div className="rounded-xl border border-line overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-lv2 border-b border-line">
              <th className="text-left px-3 py-2 text-cap-md font-semibold text-ink-3">Chỉ số</th>
              <th className="text-right px-3 py-2 text-cap-md font-semibold text-ink-3">Hiện tại</th>
              <th className="text-right px-3 py-2 text-cap-md font-semibold text-ink-3">Ngưỡng</th>
              <th className="text-right px-3 py-2 text-cap-md font-semibold text-ink-3">Còn thiếu</th>
              <th className="text-center px-3 py-2 text-cap-md font-semibold text-ink-3">TT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {roadmap.map((m) => (
              <tr key={m.id} className="hover:bg-bg-lv2 transition-colors">
                <td className="px-3 py-2.5 text-cap-md text-ink-1 max-w-[120px]">
                  <span className="line-clamp-2 leading-tight">{m.label}</span>
                </td>
                <td className="px-3 py-2.5 text-right text-cap-md font-medium tabular-nums text-ink-1 whitespace-nowrap">
                  {m.current}
                  {m.unit && <span className="text-ink-4 font-normal ml-0.5 text-[10px]">{m.unit}</span>}
                </td>
                <td className="px-3 py-2.5 text-right text-cap-md tabular-nums text-ink-3 whitespace-nowrap">
                  {m.threshold}
                  {m.unit && <span className="text-ink-4 ml-0.5 text-[10px]">{m.unit}</span>}
                </td>
                <td className="px-3 py-2.5 text-right text-cap-md tabular-nums whitespace-nowrap">
                  {m.passed
                    ? <span className="text-success">—</span>
                    : <span className="text-danger font-medium">
                        +{m.threshold - m.current}
                        {m.unit && <span className="font-normal ml-0.5 text-[10px]">{m.unit}</span>}
                      </span>
                  }
                </td>
                <td className="px-3 py-2.5 text-center">
                  {m.passed
                    ? <CheckCircle2 size={14} className="text-success inline-block" />
                    : <Lock size={13} className="text-ink-4 inline-block" />
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Drawer History List ─────────────────────────────────────────────────────

function DrawerHistoryRow({ item }: { item: PartnerHistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const hasBatch = item.kind === "sync" && !!item.syncTargets?.length;

  return (
    <div>
      {/* Main row */}
      <div className="flex items-start gap-3 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="text-cap-md text-ink-1">
            {item.kind === "upgrade" ? "Nâng hạng" : "Đồng bộ hạng"}
            <span className="text-ink-3 ml-2">Tier {item.fromTier} → {item.toTier}</span>
          </div>
          <div className="text-cap-md text-ink-3 mt-0.5 tabular-nums">{formatDate(item.submittedAt)}</div>
          {hasBatch && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 flex items-center gap-1 text-cap-md text-ink-3 hover:text-ink-1 transition-colors"
            >
              <Building2 size={11} className="shrink-0" />
              <span>Cùng với <span className="font-medium text-ink-2">{item.syncTargets!.length}</span> dịch vụ khác</span>
              <span className="ml-1 text-brand font-medium flex items-center gap-0.5">
                Chi tiết
                <ChevronDown
                  size={11}
                  className={cn("transition-transform duration-150", expanded && "rotate-180")}
                />
              </span>
            </button>
          )}
        </div>
        <Badge intention="neutral" className={cn("shrink-0 mt-0.5", STATUS_META[item.status].chipClass)}>
          {STATUS_META[item.status].label}
        </Badge>
      </div>

      {/* Expanded targets */}
      {expanded && hasBatch && (
        <div className="mx-3 mb-2.5 rounded-lg bg-bg-lv2 border border-line px-3 py-2 flex flex-col gap-1.5">
          {item.syncTargets!.map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-cap-md text-ink-2">
              <Building2 size={12} className="text-ink-4 shrink-0" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DrawerHistoryList({ items }: { items: PartnerHistoryItem[] }) {
  return (
    <div className="rounded-xl border border-line divide-y divide-line overflow-hidden">
      {items.map((h) => <DrawerHistoryRow key={h.id} item={h} />)}
    </div>
  );
}

// ─── Drawer Section (collapsible) ────────────────────────────────────────────

function DrawerSection({
  title, subtitle, subtitleClass, icon, defaultOpen = false, children,
}: {
  title: string;
  subtitle?: string;
  subtitleClass?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-lv1 hover:bg-bg-lv2 transition-colors text-left gap-2"
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="text-ink-3 shrink-0">{icon}</span>}
          <span className="text-body font-semibold text-ink-1">{title}</span>
          {subtitle && (
            <span className={cn("text-cap-md ml-1 shrink-0", subtitleClass ?? "text-ink-3")}>
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={cn("text-ink-3 shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && <div className="border-t border-line">{children}</div>}
    </div>
  );
}

// ─── Service Detail Drawer ───────────────────────────────────────────────────

function ServiceDetailDrawer({
  facilityId, onClose, onSyncRequest, onVerifyRequest,
}: {
  facilityId: string;
  onClose: () => void;
  onSyncRequest: () => void;
  onVerifyRequest: (id: string) => void;
}) {
  const facility = PARTNER_FACILITIES.find(f => f.id === facilityId);
  const data = FACILITY_TIER_DATA[facilityId];
  const history = (PARTNER_HISTORY_BY_FACILITY[facilityId] ?? []).slice(0, 3);

  if (!facility || !data) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-ink-1/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 z-50 h-screen w-[480px] max-w-[90vw] bg-bg-lv1 shadow-lv2 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-start gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-ink-1 truncate">{facility.name}</h3>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5 flex flex-col gap-5">

          {/* Facility info */}
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Địa điểm", value: getFacilityFullAddress(facilityId, facility.location) },
              { label: "Loại hình", value: facility.vertical },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-cap-md text-ink-3 w-20 shrink-0">{label}</span>
                <span className="text-cap-md text-ink-1 font-medium">{value}</span>
              </div>
            ))}

            {/* Effective tier info rows */}
            {(() => {
              const syncTier = data.synchronized_tier;
              const compTier = data.complimentary_tier;
              const isSync  = syncTier !== null && (syncTier ?? 0) >= data.period_tier && (syncTier ?? 0) >= (compTier ?? 0);
              const isComp  = !isSync && compTier !== null && (compTier ?? 0) >= data.period_tier;
              const trackName = isSync ? "Hạng đồng bộ" : isComp ? "Hạng trải nghiệm" : "Hạng tiêu chuẩn";
              const expiry = isSync ? data.synchronized_tier_expiry : isComp ? data.complimentary_tier_expiry : null;
              const expiryColor = isSync ? "text-info" : "text-warn-text";
              return (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-cap-md text-ink-3 w-20 shrink-0">Hạng hiệu lực</span>
                    <span className="text-cap-md text-ink-1 font-medium">{trackName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-cap-md text-ink-3 w-20 shrink-0">Mức hạng</span>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={data.tier} />
                      <span className="text-cap-md text-ink-1 font-medium">{data.tierName}</span>
                    </div>
                  </div>
                  {expiry && (
                    <div className="flex items-center gap-3">
                      <span className="text-cap-md text-ink-3 w-20 shrink-0">Hiệu lực đến</span>
                      <SlaCountdown deadline={expiry} className={cn("text-cap-md font-medium", expiryColor)} />
                    </div>
                  )}
                </>
              );
            })()}
            {/* Freshness Score */}
            {(() => {
              const days = data.freshnessDaysStale;
              const score = getFreshnessScore(days);
              const scoreColor = score === 100 ? "text-success" : score >= 50 ? "text-warn-text" : "text-danger";
              const barColor   = score === 100 ? "bg-success"   : score >= 50 ? "bg-warn"        : "bg-danger";
              const dayColor   = getFreshnessDayColor(days);
              const needsVerify = days >= 20;
              return (
                <div className="flex items-center gap-3">
                  <span className="text-cap-md text-ink-3 w-20 shrink-0">Freshness</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={cn("text-cap-md font-semibold tabular-nums", scoreColor)}>
                      {score} điểm
                    </span>
                    <div className="flex-1 h-1.5 bg-bg-lv3 rounded-full overflow-hidden max-w-[60px]">
                      <div className={cn("h-full rounded-full", barColor)} style={{ width: `${score}%` }} />
                    </div>
                    <span className={cn("text-cap-md font-medium tabular-nums", dayColor)}>
                      {days} ngày
                    </span>
                    {needsVerify && (
                      <button
                        onClick={() => onVerifyRequest(facilityId)}
                        className={cn(
                          "text-cap-md font-semibold underline underline-offset-2 hover:no-underline whitespace-nowrap shrink-0",
                          scoreColor
                        )}
                      >
                        Xác nhận ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tier Status — open by default */}
          <DrawerSection
            title="Hạng hiệu lực"
            defaultOpen={true}
          >
            <TierTrackPanel
              data={data}
              compact
              syncRequestStatus={getActiveSyncRequestStatus(facilityId)}
              onSyncRequest={
                data.syncDisabledReason || data.synchronized_tier !== null
                  ? undefined
                  : onSyncRequest
              }
            />
          </DrawerSection>

          {/* Completeness — collapsed by default */}
          {(() => {
            const ps = [data.completeness.facilities, data.completeness.operations, data.completeness.gallery, data.completeness.skus];
            const pct = Math.round(ps.reduce((s, p) => s + Math.min((p.score / p.threshold) * 100, 100), 0) / ps.length);
            const pctColor = pct >= 100 ? "text-success" : pct >= 80 ? "text-warn-text" : "text-danger";
            return (
              <DrawerSection title="Độ hoàn thiện hồ sơ" subtitle={`${pct}%`} subtitleClass={pctColor}>
                <div className="px-1 py-1">
                  <DrawerCompletenessMeter data={data} />
                </div>
              </DrawerSection>
            );
          })()}

          {/* Roadmap — collapsed by default */}
          {(() => {
            const passed = data.roadmap.filter(r => r.passed).length;
            const total  = data.roadmap.length;
            return (
              <DrawerSection title={`Lộ trình lên Tier ${data.tier + 1}`} subtitle={`${passed}/${total} đã đạt`}>
                <div className="px-1 py-1">
                  <DrawerRoadmap roadmap={data.roadmap} currentTier={data.tier} />
                </div>
              </DrawerSection>
            );
          })()}

          {/* History — collapsed by default */}
          <DrawerSection
            title="Lịch sử yêu cầu gần đây"
            subtitle={history.length > 0 ? `${history.length} yêu cầu` : undefined}
            icon={<History size={13} />}
          >
            {history.length === 0 ? (
              <p className="px-4 py-3 text-cap-md text-ink-3 italic">Chưa có yêu cầu nào.</p>
            ) : (
              <DrawerHistoryList items={history} />
            )}
          </DrawerSection>
        </div>

        {data.syncDisabledReason && (
          <div className="px-5 pb-4 shrink-0">
            <div className="rounded-lg bg-warn-light/60 border border-warn/20 px-3 py-2.5 flex items-start gap-2">
              <AlertCircle size={13} className="text-warn-text shrink-0 mt-0.5" />
              <p className="text-cap-md text-warn-text">{data.syncDisabledReason}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type TabId = "locations" | "tiers";

const TABS: { id: TabId; label: string }[] = [
  { id: "locations", label: "Địa điểm kinh doanh" },
  { id: "tiers",     label: "Xếp hạng dịch vụ"   },
];

export default function ServicesV2Page() {
  const [tab, setTab] = useState<TabId>("locations");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncInitialTargets, setSyncInitialTargets] = useState<Set<string>>(new Set());
  const [syncToast, setSyncToast] = useState(false);
  const [verifyFacilityId, setVerifyFacilityId] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-bg-lv2">
      <div className="max-w-[1200px] mx-auto w-full px-6 py-6 flex flex-col gap-5">

        {/* Page header */}
        <div>
          <h1 className="text-h3 font-bold text-ink-1">Dịch vụ & Xếp hạng</h1>
          <p className="text-body text-ink-3 mt-1">
            Quản lý hồ sơ doanh nghiệp, địa điểm kinh doanh và xếp hạng dịch vụ trong cùng một nơi
          </p>
        </div>

        {/* Business Profile (top) */}
        <BusinessProfileHeader />

        {/* Tab switcher + Add button */}
        <div className="flex items-center justify-between border-b border-line">
          <nav className="flex gap-1 -mb-px">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-4 py-2.5 text-body font-medium border-b-2 transition-colors",
                    active
                      ? "border-brand text-ink-1"
                      : "border-transparent text-ink-3 hover:text-ink-2"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
          <Button variant="primary" className="text-cap-md mb-2">
            <Plus size={13} /> Thêm dịch vụ
          </Button>
        </div>

        {/* Tab content */}
        {tab === "locations"
          ? <LocationsView onSelect={setDrawerId} />
          : <TierTableView
              onSelect={setDrawerId}
              onSyncSelected={(ids) => {
                setSyncInitialTargets(ids);
                setShowSyncModal(true);
              }}
            />
        }
      </div>

      {/* Drawer */}
      {drawerId && (
        <ServiceDetailDrawer
          facilityId={drawerId}
          onClose={() => setDrawerId(null)}
          onSyncRequest={() => { setDrawerId(null); setShowSyncModal(true); }}
          onVerifyRequest={(id) => { setDrawerId(null); setVerifyFacilityId(id); }}
        />
      )}

      {showSyncModal && (
        <SyncRequestModal
          onClose={() => { setShowSyncModal(false); setSyncInitialTargets(new Set()); }}
          onSubmit={() => { setSyncToast(true); setTimeout(() => setSyncToast(false), 3500); }}
          initialTargetIds={syncInitialTargets.size > 0 ? syncInitialTargets : undefined}
        />
      )}

      {verifyFacilityId && (() => {
        const vFacility = PARTNER_FACILITIES.find(f => f.id === verifyFacilityId);
        const vData = FACILITY_TIER_DATA[verifyFacilityId];
        if (!vFacility || !vData) return null;
        return (
          <QuickVerifyModal
            facilityName={vFacility.name}
            fields={vData.quickVerifyFields}
            onClose={() => setVerifyFacilityId(null)}
            onSubmit={() => {
              setVerifyFacilityId(null);
              setSyncToast(true);
              setTimeout(() => setSyncToast(false), 3500);
            }}
          />
        );
      })()}

      {syncToast && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 bg-ink-1 text-white text-body rounded-xl px-4 py-3 shadow-lv2">
          <CheckCircle2 size={16} className="text-success shrink-0" />
          Yêu cầu đồng bộ hạng đã được gửi tới Admin.
        </div>
      )}
    </div>
  );
}
