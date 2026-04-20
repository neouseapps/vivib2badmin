"use client";
import { createContext, useContext } from "react";
import { useScoring } from "@/lib/store/scoring-store";

interface ScoringOpsCtx {
  isLocked: boolean;
  isPreview: boolean;
  isReadOnly: boolean;
  previewVersionId: string | null;
}

const ScoringOpsContext = createContext<ScoringOpsCtx>({
  isLocked: false,
  isPreview: false,
  isReadOnly: false,
  previewVersionId: null,
});

export function ScoringOpsProvider({ children }: { children: React.ReactNode }) {
  const batchStatus = useScoring((s) => s.batchJob.status);
  const previewVersionId = useScoring((s) => s.previewVersionId);

  const isLocked = batchStatus === "running";
  const isPreview = previewVersionId !== null;
  const isReadOnly = isLocked || isPreview;

  return (
    <ScoringOpsContext.Provider value={{ isLocked, isPreview, isReadOnly, previewVersionId }}>
      {children}
    </ScoringOpsContext.Provider>
  );
}

export function useScoringOps() {
  return useContext(ScoringOpsContext);
}
