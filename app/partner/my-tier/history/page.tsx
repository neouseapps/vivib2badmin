"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CheckCircle2, Clock, AlertCircle, XCircle, ChevronDown, MessageSquare,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { TierJourney } from "@/components/tier-requests/TierJourney";
import { TierBadge } from "@/components/tier-requests/TierBadge";
import {
  PARTNER_FACILITIES,
  PARTNER_HISTORY_BY_FACILITY,
  PARTNER_HISTORY,
  type PartnerHistoryStatus,
  type PartnerHistoryItem,
} from "@/lib/mock/partnerTier";
import { usePartnerTierStore } from "@/lib/store/partner-tier-store";

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<PartnerHistoryStatus, { label: string; chipClass: string; Icon: React.ElementType }> = {
  pending:  { label: "Đang chờ",    chipClass: "bg-info-light text-info",        Icon: Clock         },
  approved: { label: "Đã duyệt",    chipClass: "bg-success-light text-success",  Icon: CheckCircle2  },
  deferred: { label: "Cần bổ sung", chipClass: "bg-warn-light text-warn-text",   Icon: AlertCircle   },
  expired:  { label: "Hết hạn",     chipClass: "bg-bg-lv3 text-ink-3",           Icon: XCircle       },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Deferred panel ───────────────────────────────────────────────────────────

function DeferredPanel({ item }: { item: PartnerHistoryItem }) {
  return (
    <div className="bg-warn-light/60 border-t border-warn/20 rounded-b-xl px-5 py-4">
      <div className="flex items-start gap-2 mb-3">
        <MessageSquare size={14} className="text-warn-text shrink-0 mt-0.5" />
        <div>
          <p className="text-cap-md font-semibold text-warn-text mb-1">Phản hồi từ Quản trị viên</p>
          <p className="text-body text-ink-2">{item.adminComment}</p>
        </div>
      </div>
      {item.adminChecklist && (
        <div className="mt-3">
          <p className="text-cap-md font-semibold text-ink-2 mb-2">Danh sách việc cần làm:</p>
          <div className="flex flex-col gap-1.5">
            {item.adminChecklist.map((task, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded border-2 border-warn/40 shrink-0 mt-0.5" />
                <span className="text-body text-ink-2">{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function HistoryRow({ item }: { item: PartnerHistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const { label, chipClass, Icon } = STATUS_META[item.status];
  const isDeferred = item.status === "deferred";

  return (
    <div className={cn("border border-line rounded-xl overflow-hidden", isDeferred && expanded && "border-warn/40")}>
      <div className="flex items-center gap-4 px-5 py-4 bg-bg-lv1">
        <div className="flex-1 min-w-0">
          <div className="text-body font-semibold text-ink-1 truncate">{item.facilityName}</div>
          <div className="text-cap-md text-ink-3 mt-0.5">{item.kind === "upgrade" ? "Nâng hạng" : "Đồng bộ hạng"}</div>
        </div>
        <div className="shrink-0"><TierJourney from={item.fromTier} to={item.toTier} /></div>
        <div className="text-cap-md text-ink-3 tabular-nums w-24 text-right shrink-0">{formatDate(item.submittedAt)}</div>
        <div className={cn("chip flex items-center gap-1.5 shrink-0 w-32 justify-center", chipClass)}>
          <Icon size={12} />{label}
        </div>
        {isDeferred ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-warn-text hover:opacity-70 transition-opacity shrink-0"
            title={expanded ? "Thu gọn" : "Xem chi tiết"}
          >
            <ChevronDown size={16} className={cn("transition-transform duration-200", expanded && "rotate-180")} />
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}
      </div>
      {isDeferred && expanded && <DeferredPanel item={item} />}
    </div>
  );
}

// ─── Facility filter tabs ─────────────────────────────────────────────────────

function FacilityTabs({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-cap-md font-medium transition-colors",
          selectedId === null
            ? "bg-ink-1 text-white"
            : "bg-bg-lv3 text-ink-2 hover:bg-bg-lv2"
        )}
      >
        Tất cả
      </button>
      {PARTNER_FACILITIES.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-cap-md font-medium transition-colors",
            selectedId === f.id
              ? "bg-ink-1 text-white"
              : "bg-bg-lv3 text-ink-2 hover:bg-bg-lv2"
          )}
        >
          <Building2 size={11} />
          {f.name}
          <TierBadge tier={f.currentTier} />
        </button>
      ))}
    </div>
  );
}

// ─── Inner (needs useSearchParams) ───────────────────────────────────────────

function HistoryInner() {
  const searchParams = useSearchParams();
  const { selectedFacilityId } = usePartnerTierStore();
  const [toast, setToast] = useState<string | null>(null);
  const [filterFacilityId, setFilterFacilityId] = useState<string | null>(selectedFacilityId);

  useEffect(() => {
    if (searchParams.get("submitted") === "1") {
      setToast("Yêu cầu của bạn đã được gửi tới Quản trị viên.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const items = filterFacilityId
    ? (PARTNER_HISTORY_BY_FACILITY[filterFacilityId] ?? [])
    : PARTNER_HISTORY;

  const pending = items.filter((h) => h.status === "pending").length;
  const deferred = items.filter((h) => h.status === "deferred").length;

  return (
    <>
      {/* Facility filter */}
      {PARTNER_FACILITIES.length > 1 && (
        <FacilityTabs selectedId={filterFacilityId} onSelect={setFilterFacilityId} />
      )}

      {/* Summary */}
      <div className="flex items-center gap-2">
        <span className="chip bg-bg-lv3 text-ink-2">{items.length} yêu cầu</span>
        {pending > 0 && (
          <span className="chip bg-info-light text-info flex items-center gap-1">
            <Clock size={11} />{pending} đang chờ
          </span>
        )}
        {deferred > 0 && (
          <span className="chip bg-warn-light text-warn-text flex items-center gap-1">
            <AlertCircle size={11} />{deferred} cần bổ sung
          </span>
        )}
      </div>

      {deferred > 0 && (
        <div className="flex items-center gap-2 text-cap-md text-ink-3">
          <ChevronDown size={12} />
          <span>Nhấn vào yêu cầu <span className="text-warn-text font-medium">Cần bổ sung</span> để xem phản hồi từ Admin</span>
        </div>
      )}

      {/* Rows */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-ink-3">
          <Building2 size={32} className="mx-auto mb-3 text-ink-4" />
          <p className="text-body">Chưa có yêu cầu nào cho cơ sở này.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => <HistoryRow key={item.id} item={item} />)}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-ink-1 text-white text-body rounded-xl px-4 py-3 shadow-lv2">
          <CheckCircle2 size={16} className="text-success shrink-0" />{toast}
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-bg-lv2">
      <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col gap-5">
        <div>
          <h1 className="text-h3 font-bold text-ink-1">Lịch sử yêu cầu</h1>
          <p className="text-body text-ink-3 mt-1">Theo dõi trạng thái các yêu cầu nâng hạng và đồng bộ hạng</p>
        </div>
        <Suspense fallback={null}>
          <HistoryInner />
        </Suspense>
      </div>
    </div>
  );
}
