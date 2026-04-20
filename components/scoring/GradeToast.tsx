"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect } from "react";
import { useScoring } from "@/lib/store/scoring-store";

export function GradeToast() {
  const change = useScoring((s) => s.lastGradeChange);
  const clear = useScoring((s) => s.clearGradeChange);

  useEffect(() => {
    if (!change) return;
    const t = setTimeout(clear, 4500);
    return () => clearTimeout(t);
  }, [change, clear]);

  return (
    <AnimatePresence>
      {change && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-[60] card px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-lv2 bg-grade-aBg border-grade-a/40"
        >
          <div className="w-9 h-9 rounded-full bg-grade-a text-white flex items-center justify-center">
            <Trophy size={18}/>
          </div>
          <div>
            <div className="text-body font-semibold text-grade-a">
              Lead nhảy hạng {change.from} → {change.to}
            </div>
            <div className="text-cap-md text-ink-2">
              {change.to === "A" ? "Lead đã đạt “Sales Ready” — ưu tiên xử lý ngay!" : "Cập nhật xếp hạng mới sau Ping Test."}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
