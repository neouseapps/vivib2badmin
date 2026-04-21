"use client";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Gift, Inbox, Trophy, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { RequestDrawer } from "@/components/tier-requests/RequestDrawer";
import { GrantModal } from "@/components/tier-requests/GrantModal";
import { AuditTrailDrawer } from "@/components/tier-requests/AuditTrailDrawer";
import { TierJourney } from "@/components/tier-requests/TierJourney";
import { SlaCountdown } from "@/components/tier-requests/SlaCountdown";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import type { TierRequest, Vertical, TierRequestStatus } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";

type TabKind = "upgrade" | "sync";

const VERTICALS: Vertical[] = ["Accommodation", "F&B", "Tour", "Retail"];
const VERTICAL_LABEL: Record<Vertical, string> = {
  Accommodation: "Lưu trú", "F&B": "Ẩm thực", Tour: "Tour", Retail: "Bán lẻ",
};

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
  const [search, setSearch] = useState("");
  const [vertical, setVertical] = useState<Vertical | "">("");
  const [status, setStatus] = useState<TierRequestStatus | "">("");
  const [grantOpen, setGrantOpen] = useState(false);

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

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (r.details.kind !== tab) return false;
      if (search && !r.facility.name.toLowerCase().includes(search.toLowerCase()) &&
          !r.facility.partner.toLowerCase().includes(search.toLowerCase())) return false;
      if (vertical && r.facility.vertical !== vertical) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [requests, tab, search, vertical, status]);

  // ── Upgrade tab ─────────────────────────────────────────────────────────────

  function UpgradeQueueTab() {
    const rows = filtered;

    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center py-16 gap-3 text-ink-4">
          <Inbox size={40} strokeWidth={1.5} />
          <p className="text-h4 font-semibold text-ink-2">Không có yêu cầu nào</p>
          <p className="text-body text-ink-3">Tất cả yêu cầu nâng hạng đã được xử lý hoặc chưa có yêu cầu mới.</p>
        </div>
      );
    }

    return (
      <table className="w-full text-body">
        <thead className="bg-bg-lv2 border-b border-line text-cap-md text-ink-3">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Cơ sở</th>
            <th className="text-left px-4 py-3 font-medium">Lộ trình</th>
            <th className="text-left px-4 py-3 font-medium">Chỉ số</th>
            <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
            <th className="text-left px-4 py-3 font-medium">SLA</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((req) => (
            <RequestRow key={req.id} req={req} onOpen={() => selectRequest(req.id)} onAudit={() => openAuditDrawer(req.id)} />
          ))}
        </tbody>
      </table>
    );
  }

  // ── Sync tab ────────────────────────────────────────────────────────────────

  function SyncQueueTab() {
    const rows = filtered;

    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center py-16 gap-3 text-ink-4">
          <Inbox size={40} strokeWidth={1.5} />
          <p className="text-h4 font-semibold text-ink-2">Không có yêu cầu nào</p>
          <p className="text-body text-ink-3">Tất cả yêu cầu đồng bộ hạng đã được xử lý hoặc chưa có yêu cầu mới.</p>
        </div>
      );
    }

    return (
      <table className="w-full text-body">
        <thead className="bg-bg-lv2 border-b border-line text-cap-md text-ink-3">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Cơ sở nguồn</th>
            <th className="text-left px-4 py-3 font-medium">Hạng mục tiêu</th>
            <th className="text-left px-4 py-3 font-medium">Số cơ sở đích</th>
            <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
            <th className="text-left px-4 py-3 font-medium">SLA</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((req) => (
            <SyncRow key={req.id} req={req} onOpen={() => selectRequest(req.id)} onAudit={() => openAuditDrawer(req.id)} />
          ))}
        </tbody>
      </table>
    );
  }

  const upgradeCount = requests.filter((r) => r.details.kind === "upgrade").length;
  const syncCount = requests.filter((r) => r.details.kind === "sync").length;

  return (
    <>
      <Header
        title="Yêu cầu nâng hạng"
        actions={
          <button
            onClick={() => setGrantOpen(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Gift size={14} /> Cấp hạng ưu đãi
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-4">
        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-8 w-full"
              placeholder="Tìm cơ sở hoặc đối tác…"
            />
          </div>
          <div className="flex items-center gap-1.5 text-ink-3">
            <Filter size={14} />
          </div>
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value as Vertical | "")}
            className="input min-w-[140px]"
          >
            <option value="">Tất cả vertical</option>
            {VERTICALS.map((v) => (
              <option key={v} value={v}>{VERTICAL_LABEL[v]}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TierRequestStatus | "")}
            className="input min-w-[140px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="deferred">Trì hoãn</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="card overflow-hidden">
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

          {tab === "upgrade" ? <UpgradeQueueTab /> : <SyncQueueTab />}
        </div>
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
        <div className="text-cap text-ink-3">{req.facility.partner} · {req.facility.location}</div>
      </td>
      <td className="px-4 py-3">
        <TierJourney
          from={req.fromTier}
          to={req.toTier}
          onClickFrom={(e) => { e.stopPropagation(); onAudit(); }}
        />
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
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="text-cap-md text-info hover:underline"
        >
          Xem chi tiết
        </button>
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
        <div className="text-cap text-ink-3">{req.facility.partner} · {req.facility.location}</div>
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
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="text-cap-md text-info hover:underline"
        >
          Xem chi tiết
        </button>
      </td>
    </tr>
  );
}
