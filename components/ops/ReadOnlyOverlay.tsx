"use client";
import { useScoringOps } from "@/lib/context/scoring-ops-context";
import { useScoring } from "@/lib/store/scoring-store";
import { Lock, Eye, X } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export function ReadOnlyOverlay({ children }: Props) {
  const { isLocked, isPreview, isReadOnly, previewVersionId } = useScoringOps();
  const exitPreview = useScoring((s) => s.exitPreview);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div className={`flex-1 min-h-0 flex flex-col${isReadOnly ? " pointer-events-none select-none" : ""}`}>
        {children}
      </div>

      {isLocked && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg px-3 py-1.5 text-cap-md font-medium shadow-sm">
          <Lock size={12} />
          Hệ thống đang khoá
        </div>
      )}

      {isPreview && (
        <>
          <div className="absolute top-0 left-0 right-0 z-10 bg-info-light border-b border-info/30 px-4 py-2 flex items-center gap-2">
            <Eye size={14} className="text-info shrink-0" />
            <span className="text-cap-md font-semibold text-info flex-1">
              Mode xem trước: {previewVersionId} — Chỉ đọc
            </span>
            <button
              onClick={exitPreview}
              className="flex items-center gap-1 text-cap-md font-semibold text-info hover:text-brand transition-colors pointer-events-auto"
            >
              <X size={12} />
              Thoát xem trước
            </button>
          </div>
        </>
      )}
    </div>
  );
}
