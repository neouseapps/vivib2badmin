"use client";
import { type JSX, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle2, Clock, Send,
  User, CalendarDays, Timer, MapPin,
  Building2, UtensilsCrossed, Compass, ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { UpgradeDetails } from "./UpgradeDetails";
import { SyncDetails } from "./SyncDetails";
import { ApproveModal } from "./ApproveModal";
import { TierJourney } from "./TierJourney";
import { SlaCountdown } from "./SlaCountdown";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import type { TierRequest, Vertical } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

const VERTICAL_STYLE: Record<Vertical, string> = {
  "Accommodation": "bg-info-light text-info",
  "F&B":           "bg-success-light text-success",
  "Tour":          "bg-warn-light text-warn-text",
  "Retail":        "bg-bg-lv3 text-ink-2",
};

const VERTICAL_ICON: Record<Vertical, JSX.Element> = {
  "Accommodation": <Building2 size={11} />,
  "F&B":           <UtensilsCrossed size={11} />,
  "Tour":          <Compass size={11} />,
  "Retail":        <ShoppingBag size={11} />,
};

// ─── RequestMetaBar ───────────────────────────────────────────────────────────

interface MetaBarProps {
  submittedBy: string;
  submittedAt: string;
  slaDeadlineAt: string;
  vertical: Vertical;
  location: string;
  fromTier: number;
  toTier: number;
  onClickFrom: (e: React.MouseEvent) => void;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-ink-3">{label}</span>
      <span className="text-ink-1">{children}</span>
    </>
  );
}

function RequestMetaBar({ submittedBy, submittedAt, slaDeadlineAt, vertical, location, fromTier, toTier, onClickFrom }: MetaBarProps) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 px-4 py-3 mb-5 bg-bg-lv2 rounded-lg border border-line text-cap-md">
      <MetaRow label="Người nộp">
        <span className="font-medium">{submittedBy}</span>
      </MetaRow>
      <MetaRow label="Loại hình">
        <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-cap font-medium", VERTICAL_STYLE[vertical])}>
          {VERTICAL_ICON[vertical]}{vertical}
        </span>
      </MetaRow>
      <MetaRow label="Ngày nộp">
        <span className="text-ink-2">{formatRelative(submittedAt)}</span>
      </MetaRow>
      <MetaRow label="Địa điểm">
        <span className="text-ink-2 flex items-center gap-1">
          <MapPin size={12} className="shrink-0" />{location}
        </span>
      </MetaRow>
      <MetaRow label="SLA">
        <SlaCountdown deadline={slaDeadlineAt} />
      </MetaRow>
      <MetaRow label="Lộ trình">
        <TierJourney from={fromTier} to={toTier} onClickFrom={onClickFrom} />
      </MetaRow>
    </div>
  );
}

// ─── RequestDrawer ────────────────────────────────────────────────────────────

interface Props {
  request: TierRequest | null;
  onClose: () => void;
}

export function RequestDrawer({ request, onClose }: Props) {
  const approveRequest = useTierRequests((s) => s.approveRequest);
  const deferRequest = useTierRequests((s) => s.deferRequest);
  const openAuditDrawer = useTierRequests((s) => s.openAuditDrawer);

  const [approveOpen, setApproveOpen] = useState(false);
  const [deferOpen, setDeferOpen] = useState(false);
  const [deferText, setDeferText] = useState("");

  // Lifted checklist state for approval gate
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  useEffect(() => { setCheckedItems(new Set()); }, [request?.id]);

  function toggleItem(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Phê duyệt chỉ được bật khi toàn bộ chỉ số đạt + tất cả hạng mục thủ công đã tick
  const canApprove = (() => {
    if (!request) return false;
    if (request.details.kind === "upgrade") {
      const systemOk = Object.values(request.details.systemChecklist).every((m) => m.passed);
      const manualOk = request.details.complianceItems.every((item) => checkedItems.has(item.id));
      return systemOk && manualOk;
    }
    return true; // sync requests không có checklist
  })();

  function handleApproveConfirm() {
    if (!request) return;
    approveRequest(request.id);
    setApproveOpen(false);
    onClose();
  }

  function handleDefer() {
    if (!request || deferText.trim().length < 50) return;
    deferRequest(request.id, deferText.trim());
    setDeferText("");
    setDeferOpen(false);
    onClose();
  }

  function handleClose() {
    setApproveOpen(false);
    setDeferOpen(false);
    setDeferText("");
    onClose();
  }

  return (
    <>
      <AnimatePresence>
        {request && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={handleClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-[60vw] min-w-[720px] max-w-[960px] bg-bg-lv1 shadow-lv2 flex flex-col z-50"
            >
              {/* Header — facility name first, then status + tier journey */}
              <div className="h-[60px] flex items-center gap-3 px-5 bg-bg-lv2 border-b border-line shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-body font-semibold text-ink-1 truncate">
                    {request.facility.name}
                    <span className="font-normal text-ink-3"> · {request.facility.partner}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      "text-cap px-2 py-0.5 rounded font-medium",
                      request.status === "pending" ? "bg-info-light text-info" : "bg-warn-light text-warn-text"
                    )}>
                      {request.status === "pending" ? "Đang chờ" : "Trì hoãn"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:bg-bg-lv3 hover:text-ink-1 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <RequestMetaBar
                  submittedBy={request.submittedBy}
                  submittedAt={request.submittedAt}
                  slaDeadlineAt={request.slaDeadlineAt}
                  vertical={request.facility.vertical}
                  location={request.facility.location}
                  fromTier={request.fromTier}
                  toTier={request.toTier}
                  onClickFrom={(e) => { e.stopPropagation(); openAuditDrawer(request.id); }}
                />

                {request.deferReason && (
                  <div className="mb-5 bg-warn-light rounded-lg p-4 text-body text-ink-2">
                    <p className="text-cap-md font-semibold text-warn-text mb-1">Lý do trì hoãn trước đó</p>
                    {request.deferReason}
                  </div>
                )}

                {/* Banner cảnh báo khi chỉ số đã thay đổi sau khi nộp */}
                {request.details.kind === "upgrade" && !canApprove &&
                  Object.values(request.details.systemChecklist).some((m) => !m.passed) && (
                  <div className="mb-5 flex items-start gap-2.5 bg-warn-light border border-warn/30 rounded-lg px-4 py-3 text-cap-md text-warn-text">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Chỉ số thay đổi sau khi nộp —</span>{" "}
                      Dữ liệu hệ thống phản ánh trạng thái hiện tại của đối tác. Nếu điểm số bị tụt sau khi phiếu đã nộp, hãy dùng <strong>Trì hoãn</strong> để yêu cầu đối tác cải thiện lại.
                    </div>
                  </div>
                )}

                {request.details.kind === "upgrade" ? (
                  <UpgradeDetails details={request.details} facility={request.facility} checked={checkedItems} onToggle={toggleItem} />
                ) : (
                  <SyncDetails details={request.details} />
                )}
              </div>

              {/* Defer panel (expands above action bar) */}
              <AnimatePresence>
                {deferOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-line"
                  >
                    <div className="p-4 bg-bg-lv2 space-y-2">
                      <label className="text-cap-md font-semibold text-ink-1 flex items-center gap-1.5">
                        <Clock size={14} /> Lý do trì hoãn & Action Items cho đối tác
                      </label>
                      <textarea
                        className="input w-full resize-none text-body"
                        rows={4}
                        placeholder="Mô tả rõ lý do và những hạng mục đối tác cần bổ sung…"
                        value={deferText}
                        onChange={(e) => setDeferText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <span className={cn("text-cap", deferText.trim().length >= 50 ? "text-success" : "text-ink-4")}>
                          {deferText.trim().length} / 50 ký tự tối thiểu
                        </span>
                        <button
                          onClick={handleDefer}
                          disabled={deferText.trim().length < 50}
                          className="btn-primary flex items-center gap-1.5 disabled:opacity-50 text-cap-md"
                        >
                          <Send size={13} /> Gửi yêu cầu bổ sung
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sticky action bar */}
              <div className="shrink-0 border-t border-line bg-bg-lv1 px-5 py-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => { setDeferOpen((v) => !v); }}
                  className={cn(
                    "btn-outline flex items-center gap-1.5 border-warn/60 text-warn-text hover:bg-warn-light",
                    deferOpen && "bg-warn-light"
                  )}
                >
                  <Clock size={14} />
                  Trì hoãn
                </button>
                <button
                  onClick={() => setApproveOpen(true)}
                  disabled={!canApprove}
                  className="btn-primary flex items-center gap-1.5 bg-success border-success hover:bg-success/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={!canApprove ? "Cần hoàn thành tất cả chỉ số và kiểm tra thủ công trước khi phê duyệt" : undefined}
                >
                  <CheckCircle2 size={14} />
                  Phê duyệt
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ApproveModal
        open={approveOpen}
        request={request}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApproveConfirm}
      />
    </>
  );
}
