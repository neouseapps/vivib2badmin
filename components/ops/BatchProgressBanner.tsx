"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import type { BatchJobState } from "@/lib/scoring/types";

interface Props {
  batchJob: BatchJobState;
  onDismiss: () => void;
}

export function BatchProgressBanner({ batchJob, onDismiss }: Props) {
  const visible = batchJob.status === "running" || batchJob.status === "done";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          {batchJob.status === "running" ? (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-cap-md font-semibold text-amber-800">
                  Đang áp dụng cấu hình {batchJob.versionId}... ({batchJob.progress}%)
                </span>
                <span className="text-cap text-amber-600 ml-auto">Vui lòng không đóng trình duyệt</span>
              </div>
              <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  animate={{ width: `${batchJob.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span className="text-cap-md font-semibold text-emerald-800 flex-1">
                Đã áp dụng thành công cấu hình {batchJob.versionId}
              </span>
              <button onClick={onDismiss} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
