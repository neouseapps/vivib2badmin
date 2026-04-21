"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import type { TierAuditEntry, TierTrack } from "@/lib/tier-requests/types";
import { cn } from "@/lib/cn";

const TRACK_STYLE: Record<TierTrack, { dot: string; label: string; chip: string }> = {
  organic: { dot: "bg-info", label: "Hữu cơ", chip: "bg-info-light text-info" },
  sync: { dot: "bg-[#7d3c98]", label: "Đồng bộ", chip: "bg-[#f0e6f9] text-[#7d3c98]" },
  complimentary: { dot: "bg-warn", label: "Ưu đãi", chip: "bg-warn-light text-warn-text" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function TierAuditTimeline({ entries }: { entries: TierAuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-ink-4">
        <Clock size={32} className="mb-2" />
        <p className="text-body">Chưa có lịch sử thay đổi</p>
      </div>
    );
  }

  return (
    <ol className="relative border-l border-line ml-3 space-y-6">
      {entries.map((entry) => {
        const style = TRACK_STYLE[entry.track];
        return (
          <li key={entry.id} className="ml-5">
            <span className={cn("absolute -left-[5px] w-2.5 h-2.5 rounded-full border-2 border-white", style.dot)} />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-cap-md text-ink-3">{formatDate(entry.at)}</span>
                <span className={cn("text-cap px-1.5 py-0.5 rounded font-medium", style.chip)}>
                  {style.label}
                </span>
              </div>
              <p className="text-body font-semibold text-ink-1">{entry.action}</p>
              <p className="text-cap-md text-ink-3">oleh {entry.actor}</p>
              {entry.reason && (
                <p className="text-cap-md text-ink-2 bg-bg-lv2 rounded px-2.5 py-1.5 mt-1">
                  {entry.reason}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function AuditTrailDrawer() {
  const auditId = useTierRequests((s) => s.auditDrawerRequestId);
  const requests = useTierRequests((s) => s.requests);
  const close = useTierRequests((s) => s.closeAuditDrawer);

  const request = auditId ? requests.find((r) => r.id === auditId) : null;

  return (
    <AnimatePresence>
      {auditId && (
        <>
          <motion.div
            key="audit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[65]"
            onClick={close}
          />
          <motion.div
            key="audit-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-[480px] bg-bg-lv1 shadow-lv2 flex flex-col z-[70]"
          >
            <div className="h-[60px] flex items-center justify-between px-5 bg-bg-lv2 border-b border-line shrink-0">
              <div>
                <span className="text-body font-semibold text-ink-1">Lịch sử phân hạng</span>
                {request && (
                  <p className="text-cap text-ink-3 truncate max-w-[320px]">{request.facility.name}</p>
                )}
              </div>
              <button
                onClick={close}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:bg-bg-lv3 hover:text-ink-1 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {request ? (
                <TierAuditTimeline entries={request.auditHistory} />
              ) : (
                <div className="flex flex-col items-center py-12 text-ink-4">
                  <p className="text-body">Không tìm thấy yêu cầu</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
