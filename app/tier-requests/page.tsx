"use client";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Gift, Inbox, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { RequestDrawer } from "@/components/tier-requests/RequestDrawer";
import { GrantModal } from "@/components/tier-requests/GrantModal";
import { AuditTrailDrawer } from "@/components/tier-requests/AuditTrailDrawer";
import { SlaCountdown } from "@/components/tier-requests/SlaCountdown";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import type { TierRequest, Vertical, TierRequestStatus, TierLevel } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";
import { Button, Card, Select } from "@/components/ui";

type TabKind = "upgrade" | "sync";

const PAGE_SIZE = 25;

const VERTICALS: Vertical[] = ["Accommodation", "F&B", "Tour", "Retail"];
const VERTICAL_LABEL: Record<Vertical, string> = {
  Accommodation: "Lưu trú", "F&B": "Ẩm thực", Tour: "Tour", Retail: "Bán lẻ",
};
const TIER_LEVELS: TierLevel[] = [0, 1, 2, 3, 4];

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 text-body font-medium border-b-2 transition-colors whitespace-nowrap",
        active
          ? "border-ink-1 text-ink-1"
          : "border-transparent text-ink-3 hover:text-ink-2"
      )}
    >
      {children}
    </button>
  );
}

export default function TierRequestsPage() {
  const requests = useTierRequests((s) => s.requests);
  const selectedId = useTierRequests((s) => s.selectedRequestId);
  const selectRequest = useTierRequests((s) => s.selectRequest);
  const openAuditDrawer = useTierRequests((s) => s.openAuditDrawer);
  const lastAction = useTierRequests((s) => s.lastApprovedAction);
  const clearAction = useTierRequests((s) => s.clearApprovedAction);

  const [tab, setTab] = useState<TabKind>("upgrade");
  const [grantOpen, setGrantOpen] = useState(false);

  // ── Per-tab filter state ──────────────────────────────────────────────────────
  const [uSearch, setUSearch] = useState("");
  const [uVertical, setUVertical] = useState<Vertical | "">("");
  const [uStatus, setUStatus] = useState<TierRequestStatus | "">("");
  const [uFromTier, setUFromTier] = useState<TierLevel | "">("");
  const [uToTier, setUToTier] = useState<TierLevel | "">("");
  const [upgradePage, setUpgradePage] = useState(1);

  const [sSearch, setSSearch] = useState("");
  const [sVertical, setSVertical] = useState<Vertical | "">("");
  const [sStatus, setSStatus] = useState<TierRequestStatus | "">("");
  const [sFromTier, setSFromTier] = useState<TierLevel | "">("");
  const [sToTier, setSToTier] = useState<TierLevel | "">("");
  const [syncPage, setSyncPage] = useState(1);

  // Reset page khi filter thay đổi
  useEffect(() => { setUpgradePage(1); }, [uSearch, uVertical, uStatus, uFromTier, uToTier]);
  useEffect(() => { setSyncPage(1); }, [sSearch, sVertical, sStatus, sFromTier, sToTier]);

  // Auto-clear toast
  useEffect(() => {
    if (!lastAction) return;
    const t = setTimeout(clearAction, 4500);
    return () => clearTimeout(t);
  }, [lastAction, clearAction]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? null,
    [requests, selectedId]
  );

  // ── Per-tab filtered lists ────────────────────────────────────────────────────
  const upgradeFiltered = useMemo(() =>
    requests
      .filter((r) => r.details.kind === "upgrade")
      .filter((r) => !uSearch ||
        r.facility.name.toLowerCase().includes(uSearch.toLowerCase()) ||
        r.facility.partner.toLowerCase().includes(uSearch.toLowerCase()))
      .filter((r) => !uVertical || r.facility.vertical === uVertical)
      .filter((r) => !uStatus || r.status === uStatus)
      .filter((r) => uFromTier === "" || r.fromTier === uFromTier)
      .filter((r) => uToTier === "" || r.toTier === uToTier),
    [requests, uSearch, uVertical, uStatus, uFromTier, uToTier]
  );

  const syncFiltered = useMemo(() =>
    requests
      .filter((r) => r.details.kind === "sync")
      .filter((r) => !sSearch ||
        r.facility.name.toLowerCase().includes(sSearch.toLowerCase()) ||
        r.facility.partner.toLowerCase().includes(sSearch.toLowerCase()))
      .filter((r) => !sVertical || r.facility.vertical === sVertical)
      .filter((r) => !sStatus || r.status === sStatus)
      .filter((r) => sFromTier === "" || r.fromTier === sFromTier)
      .filter((r) => sToTier === "" || r.toTier === sToTier),
    [requests, sSearch, sVertical, sStatus, sFromTier, sToTier]
  );

  // ── Paginated slices ──────────────────────────────────────────────────────────
  const upgradeRows = upgradeFiltered.slice(
    (upgradePage - 1) * PAGE_SIZE,
    upgradePage * PAGE_SIZE
  );
  const upgradePageCount = Math.max(1, Math.ceil(upgradeFiltered.length / PAGE_SIZE));

  const syncRows = syncFiltered.slice(
    (syncPage - 1) * PAGE_SIZE,
    syncPage * PAGE_SIZE
  );
  const syncPageCount = Math.max(1, Math.ceil(syncFiltered.length / PAGE_SIZE));

  // ── Tab counts (total unfiltered) ─────────────────────────────────────────────
  const upgradeCount = requests.filter((r) => r.details.kind === "upgrade").length;
  const syncCount = requests.filter((r) => r.details.kind === "sync").length;

  // ── Upgrade tab ───────────────────────────────────────────────────────────────
  function UpgradeQueueTab() {
    return (
      <div>
        {/* Filter bar */}
        <div className="flex items-center gap-2 p-4 border-b border-line">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={uSearch}
              onChange={(e) => setUSearch(e.target.value)}
              className="input pl-9"
              placeholder="Tìm cơ sở hoặc đối tác…"
            />
          </div>
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={uVertical}
            onChange={(next) => setUVertical(next as Vertical | "")}
            options={[
              { value: "", label: "Tất cả vertical" },
              ...VERTICALS.map((v) => ({ value: v, label: VERTICAL_LABEL[v] })),
            ]}
          />
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={uStatus}
            onChange={(next) => setUStatus(next as TierRequestStatus | "")}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "pending", label: "Đang chờ" },
              { value: "deferred", label: "Trì hoãn" },
            ]}
          />
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={uFromTier === "" ? "" : String(uFromTier)}
            onChange={(next) => setUFromTier(next === "" ? "" : (Number(next) as TierLevel))}
            options={[
              { value: "", label: "Hạng hiện tại" },
              ...TIER_LEVELS.map((t) => ({ value: String(t), label: `Tier ${t}` })),
            ]}
          />
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={uToTier === "" ? "" : String(uToTier)}
            onChange={(next) => setUToTier(next === "" ? "" : (Number(next) as TierLevel))}
            options={[
              { value: "", label: "Hạng yêu cầu" },
              ...TIER_LEVELS.map((t) => ({ value: String(t), label: `Tier ${t}` })),
            ]}
          />
        </div>

        {upgradeRows.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-ink-4">
            <Inbox size={40} strokeWidth={1.5} />
            <p className="text-h4 font-semibold text-ink-2">Không có yêu cầu nào</p>
            <p className="text-body text-ink-3">Tất cả yêu cầu nâng hạng đã được xử lý hoặc chưa có yêu cầu mới.</p>
          </div>
        ) : (
          <table className="w-full text-body">
            <thead className="bg-bg-lv2 border-b border-line text-cap-md text-ink-3">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Cơ sở</th>
                <th className="text-left px-4 py-3 font-medium">Đối tác</th>
                <th className="text-left px-4 py-3 font-medium">Hạng hiện tại</th>
                <th className="text-left px-4 py-3 font-medium">Hạng yêu cầu</th>
                <th className="text-left px-4 py-3 font-medium">Chỉ số</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {upgradeRows.map((req) => (
                <RequestRow key={req.id} req={req} onOpen={() => selectRequest(req.id)} onAudit={() => openAuditDrawer(req.facility.id)} />
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {upgradePageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-bg-lv1">
            <span className="text-cap-md text-ink-3">
              {(upgradePage - 1) * PAGE_SIZE + 1}–{Math.min(upgradePage * PAGE_SIZE, upgradeFiltered.length)} / {upgradeFiltered.length} yêu cầu
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={upgradePage === 1}
                onClick={() => setUpgradePage((p) => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-line text-ink-3 hover:bg-bg-lv2 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-cap-md text-ink-2 px-2 tabular-nums">{upgradePage} / {upgradePageCount}</span>
              <button
                disabled={upgradePage === upgradePageCount}
                onClick={() => setUpgradePage((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-line text-ink-3 hover:bg-bg-lv2 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Sync tab ──────────────────────────────────────────────────────────────────
  function SyncQueueTab() {
    return (
      <div>
        {/* Filter bar */}
        <div className="flex items-center gap-2 p-4 border-b border-line">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={sSearch}
              onChange={(e) => setSSearch(e.target.value)}
              className="input pl-9"
              placeholder="Tìm cơ sở hoặc đối tác…"
            />
          </div>
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={sVertical}
            onChange={(next) => setSVertical(next as Vertical | "")}
            options={[
              { value: "", label: "Tất cả vertical" },
              ...VERTICALS.map((v) => ({ value: v, label: VERTICAL_LABEL[v] })),
            ]}
          />
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={sStatus}
            onChange={(next) => setSStatus(next as TierRequestStatus | "")}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "pending", label: "Đang chờ" },
              { value: "deferred", label: "Trì hoãn" },
            ]}
          />
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={sFromTier === "" ? "" : String(sFromTier)}
            onChange={(next) => setSFromTier(next === "" ? "" : (Number(next) as TierLevel))}
            options={[
              { value: "", label: "Hạng hiện tại" },
              ...TIER_LEVELS.map((t) => ({ value: String(t), label: `Tier ${t}` })),
            ]}
          />
          <Select
            className="min-w-[140px] max-w-[180px]"
            size="sm"
            value={sToTier === "" ? "" : String(sToTier)}
            onChange={(next) => setSToTier(next === "" ? "" : (Number(next) as TierLevel))}
            options={[
              { value: "", label: "Hạng yêu cầu" },
              ...TIER_LEVELS.map((t) => ({ value: String(t), label: `Tier ${t}` })),
            ]}
          />
        </div>

        {syncRows.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-ink-4">
            <Inbox size={40} strokeWidth={1.5} />
            <p className="text-h4 font-semibold text-ink-2">Không có yêu cầu nào</p>
            <p className="text-body text-ink-3">Tất cả yêu cầu đồng bộ hạng đã được xử lý hoặc chưa có yêu cầu mới.</p>
          </div>
        ) : (
          <table className="w-full text-body">
            <thead className="bg-bg-lv2 border-b border-line text-cap-md text-ink-3">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Cơ sở nguồn</th>
                <th className="text-left px-4 py-3 font-medium">Đối tác</th>
                <th className="text-left px-4 py-3 font-medium">Hạng mục tiêu</th>
                <th className="text-left px-4 py-3 font-medium">Số cơ sở đích</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {syncRows.map((req) => (
                <SyncRow key={req.id} req={req} onOpen={() => selectRequest(req.id)} onAudit={() => openAuditDrawer(req.facility.id)} />
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {syncPageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-bg-lv1">
            <span className="text-cap-md text-ink-3">
              {(syncPage - 1) * PAGE_SIZE + 1}–{Math.min(syncPage * PAGE_SIZE, syncFiltered.length)} / {syncFiltered.length} yêu cầu
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={syncPage === 1}
                onClick={() => setSyncPage((p) => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-line text-ink-3 hover:bg-bg-lv2 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-cap-md text-ink-2 px-2 tabular-nums">{syncPage} / {syncPageCount}</span>
              <button
                disabled={syncPage === syncPageCount}
                onClick={() => setSyncPage((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-line text-ink-3 hover:bg-bg-lv2 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Header
        title="Yêu cầu xếp hạng"
        actions={
          <Button
            variant="primary"
            onClick={() => setGrantOpen(true)}
          >
            <Gift size={14} /> Cấp hạng ưu đãi
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {/* Tabs */}
        <Card className="overflow-hidden">
          <div className="flex border-b border-line bg-bg-lv1 px-4 gap-0">
            <TabBtn active={tab === "upgrade"} onClick={() => setTab("upgrade")}>
              Nâng hạng
              {upgradeCount > 0 && (
                <span className="ml-2 text-cap bg-brand/10 text-brand px-1.5 py-0.5 rounded font-semibold">{upgradeCount}</span>
              )}
            </TabBtn>
            <TabBtn active={tab === "sync"} onClick={() => setTab("sync")}>
              Đồng bộ hạng
              {syncCount > 0 && (
                <span className="ml-2 text-cap bg-[#f0e6f9] text-[#7d3c98] px-1.5 py-0.5 rounded font-semibold">{syncCount}</span>
              )}
            </TabBtn>
          </div>

          {tab === "upgrade" && <UpgradeQueueTab />}
          {tab === "sync"    && <SyncQueueTab />}
        </Card>
      </div>

      <RequestDrawer request={selectedRequest} onClose={() => selectRequest(null)} />
      <GrantModal open={grantOpen} onClose={() => setGrantOpen(false)} />
      <AuditTrailDrawer />

      {/* Success toast */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[80] card px-4 py-3 flex items-center gap-3 min-w-[300px] shadow-lv2 bg-success-light border-success/30"
          >
            <div className="w-9 h-9 rounded-full bg-success text-white flex items-center justify-center shrink-0">
              <Trophy size={18} />
            </div>
            <div>
              <div className="text-body font-semibold text-success">Cập nhật hạng thành công</div>
              <div className="text-cap-md text-ink-2">
                {lastAction.facilityName} → Tier {lastAction.toTier}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Row components ─────────────────────────────────────────────────────────────

function RequestRow({ req, onOpen, onAudit }: { req: TierRequest; onOpen: () => void; onAudit: () => void }) {
  return (
    <tr
      className="border-t border-line hover:bg-bg-lv2/50 cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <td className="px-4 py-3">
        <div className="font-semibold text-ink-1">{req.facility.name}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-body text-ink-1">{req.facility.partner}</div>
      </td>
      <td className="px-4 py-3">
        <TierBadge tier={req.fromTier} onClick={(e) => { e.stopPropagation(); onAudit(); }} />
      </td>
      <td className="px-4 py-3">
        <TierBadge tier={req.toTier} />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-3">
          <div className="text-center">
            <div className="text-body font-bold text-ink-1">{req.facility.dataScore}</div>
            <div className="text-cap text-ink-4">Data</div>
          </div>
          <div className="text-center">
            <div className="text-body font-bold text-ink-1">{req.facility.serviceScore}</div>
            <div className="text-cap text-ink-4">Service</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          "chip",
          req.status === "pending" ? "bg-info-light text-info" : "bg-warn-light text-warn-text"
        )}>
          {req.status === "pending" ? "Đang chờ" : "Trì hoãn"}
        </span>
      </td>
      <td className="px-4 py-3">
        <SlaCountdown deadline={req.slaDeadlineAt} />
      </td>
    </tr>
  );
}

function SyncRow({ req, onOpen, onAudit }: { req: TierRequest; onOpen: () => void; onAudit: () => void }) {
  const targets = req.details.kind === "sync" ? req.details.targetFacilities.length : 0;
  return (
    <tr
      className="border-t border-line hover:bg-bg-lv2/50 cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <td className="px-4 py-3">
        <div className="font-semibold text-ink-1">{req.facility.name}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-body text-ink-1">{req.facility.partner}</div>
      </td>
      <td className="px-4 py-3">
        <TierBadge tier={req.toTier} onClick={(e) => { e.stopPropagation(); onAudit(); }} />
      </td>
      <td className="px-4 py-3">
        <span className="text-body font-semibold text-ink-1">{targets}</span>
        <span className="text-cap text-ink-3 ml-1">cơ sở</span>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          "chip",
          req.status === "pending" ? "bg-info-light text-info" : "bg-warn-light text-warn-text"
        )}>
          {req.status === "pending" ? "Đang chờ" : "Trì hoãn"}
        </span>
      </td>
      <td className="px-4 py-3">
        <SlaCountdown deadline={req.slaDeadlineAt} />
      </td>
    </tr>
  );
}
