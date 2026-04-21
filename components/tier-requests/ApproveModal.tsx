"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import type { TierRequest } from "@/lib/tier-requests/types";

interface Props {
  open: boolean;
  request: TierRequest | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApproveModal({ open, request, onClose, onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleConfirm() {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 1200);
  }

  if (!open || !request) return null;

  const isSync = request.details.kind === "sync";

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-[480px]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
            <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-success" />
            </div>
            <div className="flex-1">
              <h2 className="text-body font-semibold text-ink-1">Xác nhận phê duyệt</h2>
              <p className="text-cap text-ink-3">Hành động này sẽ cập nhật hạng ngay lập tức</p>
            </div>
            <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            {!isSync ? (
              <div className="bg-success-light/60 rounded-lg p-4">
                <p className="text-body text-ink-1">
                  Xác nhận nâng hạng cho{" "}
                  <span className="font-semibold">{request.facility.name}</span>{" "}
                  lên <span className="font-semibold">Tier {request.toTier}</span>?
                </p>
              </div>
            ) : (
              <div className="bg-success-light/60 rounded-lg p-4 space-y-2">
                <p className="text-body text-ink-1 font-semibold mb-2">
                  Xác nhận đồng bộ hạng cho{" "}
                  {(request.details as import("@/lib/tier-requests/types").SyncRequest).targetFacilities.length}{" "}
                  cơ sở mục tiêu lên Tier {request.toTier}?
                </p>
                {(request.details as import("@/lib/tier-requests/types").SyncRequest).targetFacilities.map((t) => (
                  <div key={t.id} className="text-cap-md text-ink-2 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-ink-3 shrink-0" />
                    {t.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-bg-lv2/40 rounded-b-xl">
            <button onClick={onClose} className="btn-outline" disabled={isSubmitting}>
              Huỷ
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {isSubmitting ? "Đang xử lý…" : "Xác nhận"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
