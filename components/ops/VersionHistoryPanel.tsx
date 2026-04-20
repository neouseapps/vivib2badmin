"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, RotateCcw, Eye, Clock, CheckCircle } from "lucide-react";
import { useScoring } from "@/lib/store/scoring-store";
import type { VersionRecord } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function VersionItem({ record, onPreview, onRevert }: {
  record: VersionRecord;
  onPreview: () => void;
  onRevert: () => void;
}) {
  const isActive = record.status === "active";
  return (
    <div className={cn(
      "p-4 border-b border-line last:border-0",
      isActive ? "border-l-4 border-l-success bg-success/5" : "border-l-4 border-l-transparent"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0",
          isActive ? "bg-success/15" : "bg-bg-lv3"
        )}>
          {isActive
            ? <CheckCircle size={14} className="text-success" />
            : <Clock size={12} className="text-ink-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "chip text-[11px] font-semibold",
              isActive ? "bg-success/15 text-success" : "bg-bg-lv3 text-ink-2"
            )}>
              {record.id}
            </span>
            {isActive && (
              <span className="chip bg-success/10 text-success text-[10px]">Đang hoạt động</span>
            )}
          </div>
          <p className="text-cap text-ink-3 mt-1">
            {formatDate(record.publishedAt)} · {record.publishedBy} · {record.affectedLeadsCount} leads
          </p>
          <p className="text-cap-md text-ink-2 mt-1.5 leading-relaxed">{record.changeNote}</p>
          {!isActive && (
            <div className="flex items-center gap-2 mt-2.5">
              <button onClick={onPreview} className="btn-ghost h-7 text-cap flex items-center gap-1">
                <Eye size={12} />Xem trước
              </button>
              <button onClick={onRevert} className="btn-outline h-7 text-cap flex items-center gap-1">
                <RotateCcw size={12} />Revert về đây
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VersionHistoryPanel({ open, onClose }: Props) {
  const versions = useScoring((s) => s.versions);
  const previewVersion = useScoring((s) => s.previewVersion);
  const revertToVersion = useScoring((s) => s.revertToVersion);

  const sorted = [...versions].reverse();

  function handleRevert(versionId: string) {
    revertToVersion(versionId);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-30"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-line shrink-0">
              <h2 className="text-body font-semibold text-ink-1 flex-1">Lịch sử Phiên bản</h2>
              <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-ink-3 p-8 text-center">
                  <Clock size={32} className="opacity-30" />
                  <p className="text-body font-medium">Chưa có phiên bản nào</p>
                  <p className="text-cap">Bấm [Publish &amp; Tính lại] để tạo phiên bản đầu tiên.</p>
                </div>
              ) : (
                sorted.map((v) => (
                  <VersionItem
                    key={v.id}
                    record={v}
                    onPreview={() => { previewVersion(v.id); onClose(); }}
                    onRevert={() => handleRevert(v.id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
