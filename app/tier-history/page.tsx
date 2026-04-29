"use client";
import { useState, useMemo } from "react";
import { Search, ArrowRight, MapPin, Inbox } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AuditContent } from "@/components/tier-requests/AuditContent";
import { AuditTrailDrawer } from "@/components/tier-requests/AuditTrailDrawer";
import { SlaCountdown } from "@/components/tier-requests/SlaCountdown";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import {
  GRACE_PERIOD_EVENTS,
  MOCK_GRANT_HISTORY,
  PARTNER_BENEFITS_EVENTS,
} from "@/lib/mock/tierRequests";
import type { TierAuditEntry } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";
import { Badge, Card } from "@/components/ui";

function formatRelative(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function TierHistoryPage() {
  const requests             = useTierRequests((s) => s.requests);
  const completedAuditHistory = useTierRequests((s) => s.completedAuditHistory);
  const grantHistory         = useTierRequests((s) => s.grantHistory);
  const openAuditDrawer      = useTierRequests((s) => s.openAuditDrawer);

  const [viewMode, setViewMode]       = useState<"facility" | "sync">("facility");
  const [facilitySearch, setFacilitySearch] = useState("");
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [syncSearch, setSyncSearch]   = useState("");

  // ── Facility list ────────────────────────────────────────────────────────────
  const allFacilities = useMemo(() => {
    const map = new Map<string, { id: string; name: string; partner: string }>();
    requests.forEach((r) => {
      if (!map.has(r.facility.id))
        map.set(r.facility.id, { id: r.facility.id, name: r.facility.name, partner: r.facility.partner });
    });
    Object.keys(GRACE_PERIOD_EVENTS).forEach((id) => {
      if (!map.has(id)) map.set(id, { id, name: id, partner: "" });
    });
    [...MOCK_GRANT_HISTORY, ...grantHistory].forEach((g) => {
      if (!map.has(g.facilityId))
        map.set(g.facilityId, { id: g.facilityId, name: g.facilityName, partner: "" });
    });
    Object.keys(completedAuditHistory).forEach((id) => {
      if (!map.has(id)) {
        const req = requests.find((r) => r.facility.id === id);
        map.set(id, { id, name: req?.facility.name ?? id, partner: req?.facility.partner ?? "" });
      }
    });
    return Array.from(map.values());
  }, [requests, completedAuditHistory, grantHistory]);

  const filteredFacilities = allFacilities.filter((f) =>
    !facilitySearch ||
    f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
    f.partner.toLowerCase().includes(facilitySearch.toLowerCase())
  );

  const effectiveSelectedId = selectedId ?? filteredFacilities[0]?.id ?? null;
  const selectedFac = allFacilities.find((f) => f.id === effectiveSelectedId);
  const partnerName = selectedFac?.partner ?? "";

  const requestEntries: TierAuditEntry[] = effectiveSelectedId ? [
    ...(requests.find((r) => r.facility.id === effectiveSelectedId)?.auditHistory ?? []),
    ...(completedAuditHistory[effectiveSelectedId] ?? []),
  ] : [];
  const graceEvents   = effectiveSelectedId ? (GRACE_PERIOD_EVENTS[effectiveSelectedId] ?? []) : [];
  const grants        = effectiveSelectedId
    ? [...MOCK_GRANT_HISTORY, ...grantHistory].filter((g) => g.facilityId === effectiveSelectedId)
    : [];
  const benefitEvents = partnerName ? (PARTNER_BENEFITS_EVENTS[partnerName] ?? []) : [];

  // ── Sync batch data ──────────────────────────────────────────────────────────
  const syncRequests = requests.filter((r) => r.details.kind === "sync");
  const syncFiltered = syncRequests.filter((r) =>
    !syncSearch ||
    r.facility.name.toLowerCase().includes(syncSearch.toLowerCase()) ||
    r.facility.partner.toLowerCase().includes(syncSearch.toLowerCase())
  );

  return (
    <>
      <Header title="Lịch sử phân hạng" />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-line bg-bg-lv1 shrink-0">
          <span className="text-cap-md text-ink-3 mr-2">Xem theo:</span>
          <button
            type="button"
            onClick={() => setViewMode("facility")}
            className={cn(
              "px-3 py-1.5 text-cap-md rounded-lg font-medium transition-colors",
              viewMode === "facility" ? "bg-ink-1 text-white" : "text-ink-3 hover:bg-bg-lv3"
            )}
          >
            Cơ sở
          </button>
          <button
            type="button"
            onClick={() => setViewMode("sync")}
            className={cn(
              "px-3 py-1.5 text-cap-md rounded-lg font-medium transition-colors",
              viewMode === "sync" ? "bg-ink-1 text-white" : "text-ink-3 hover:bg-bg-lv3"
            )}
          >
            Yêu cầu đồng bộ
            {syncRequests.length > 0 && (
              <span className={cn(
                "ml-1.5 text-cap px-1.5 py-0.5 rounded font-semibold",
                viewMode === "sync" ? "bg-white/20 text-white" : "bg-[#f0e6f9] text-[#7d3c98]"
              )}>
                {syncRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* ── View: Theo cơ sở ──────────────────────────────────────── */}
        {viewMode === "facility" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-[240px] shrink-0 border-r border-line flex flex-col overflow-hidden">
              <div className="p-3 border-b border-line shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                  <input
                    value={facilitySearch}
                    onChange={(e) => setFacilitySearch(e.target.value)}
                    className="input pl-8 text-body w-full"
                    placeholder="Tìm cơ sở, đối tác…"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {filteredFacilities.length === 0 ? (
                  <p className="text-cap-md text-ink-4 px-4 py-6 text-center">Không có kết quả</p>
                ) : filteredFacilities.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedId(f.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-line/50 transition-colors",
                      effectiveSelectedId === f.id ? "bg-ink-1/5" : "hover:bg-bg-lv2"
                    )}
                  >
                    <div className="text-body font-medium text-ink-1 truncate">{f.name}</div>
                    {f.partner && <div className="text-cap text-ink-3 truncate mt-0.5">{f.partner}</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {selectedFac ? (
                <>
                  <p className="text-body font-semibold text-ink-1 mb-1">{selectedFac.name}</p>
                  {selectedFac.partner && <p className="text-cap-md text-ink-3 mb-5">{selectedFac.partner}</p>}
                  <AuditContent
                    requestEntries={requestEntries}
                    graceEvents={graceEvents}
                    grants={grants}
                    benefitEvents={benefitEvents}
                  />
                </>
              ) : (
                <p className="text-cap-md text-ink-4 text-center py-12">Chọn cơ sở để xem lịch sử</p>
              )}
            </div>
          </div>
        )}

        {/* ── View: Theo yêu cầu đồng bộ ───────────────────────────── */}
        {viewMode === "sync" && (
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className="relative mb-4 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={syncSearch}
                onChange={(e) => setSyncSearch(e.target.value)}
                className="input pl-8 text-body w-full"
                placeholder="Tìm cơ sở nguồn, đối tác…"
              />
            </div>

            {syncFiltered.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-ink-4">
                <Inbox size={36} strokeWidth={1.5} />
                <p className="text-body text-ink-3">Không có yêu cầu đồng bộ nào</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {syncFiltered.map((req) => {
                  if (req.details.kind !== "sync") return null;
                  const { sourceFacility, targetFacilities, justification, durationDays } = req.details;
                  return (
                    <Card key={req.id} padding="md">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <TierBadge tier={req.toTier} />
                            <ArrowRight size={14} className="text-ink-4 shrink-0" />
                            <span className="text-cap-md text-ink-3 font-medium">{targetFacilities.length} cơ sở</span>
                            <Badge intention="neutral" size="sm" className="bg-[#f0e6f9] text-[#7d3c98]">{durationDays} ngày</Badge>
                          </div>
                          <p className="text-body font-semibold text-ink-1">{sourceFacility.name}</p>
                          <p className="text-cap-md text-ink-3">
                            {sourceFacility.partner} · {formatRelative(req.submittedAt)} · {req.submittedBy}
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <Badge intention={req.status === "pending" ? "info" : "warning"} style="light" size="sm">
                            {req.status === "pending" ? "Đang chờ" : "Trì hoãn"}
                          </Badge>
                          <span className="text-cap-md text-ink-3">
                            SLA: <SlaCountdown deadline={req.slaDeadlineAt} className="inline" />
                          </span>
                        </div>
                      </div>

                      <p className="text-cap-md text-ink-2 bg-bg-lv2 rounded px-3 py-2 mb-3 line-clamp-2">
                        {justification}
                      </p>

                      <div className="rounded-lg border border-line divide-y divide-line mb-3">
                        {targetFacilities.map((fac) => (
                          <div key={fac.id} className="flex items-center gap-2 px-3 py-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7d3c98] shrink-0" />
                            <span className="text-body text-ink-1 flex-1 min-w-0 truncate">{fac.name}</span>
                            <span className="text-cap-md text-ink-3 flex items-center gap-1 shrink-0">
                              <MapPin size={11} />{fac.location}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => openAuditDrawer(req.facility.id)}
                          className="flex items-center gap-1 text-cap-md text-brand hover:underline"
                        >
                          Xem lịch sử <ArrowRight size={12} />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <AuditTrailDrawer />
    </>
  );
}
