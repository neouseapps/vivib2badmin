"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CallGuideSet, SurveyConfig } from "@/lib/scoring/types";

interface Props {
  guideSet: CallGuideSet | null;
  survey: SurveyConfig;
  hasExistingAnswers: boolean;
}

export function CallGuidePanel({ guideSet, survey, hasExistingAnswers }: Props) {
  const [open, setOpen] = useState(!hasExistingAnswers);

  if (!guideSet || guideSet.questions.length === 0) return null;

  const sortedQuestions = [...guideSet.questions].sort((a, b) => a.order - b.order);

  function getCriterionName(criterionId: string) {
    return survey.criteria.find((c) => c.id === criterionId)?.name ?? null;
  }

  return (
    <div className="rounded-xl border border-line bg-bg-lv1 overflow-hidden mb-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-bg-lv2 transition-colors text-left"
      >
        <MessageSquare size={14} className="text-brand shrink-0" />
        <span className="text-body font-medium text-ink-1 flex-1">Câu hỏi gợi ý khi gọi điện</span>
        <span className="text-cap-md text-ink-3 mr-1">{sortedQuestions.length} câu</span>
        {open ? <ChevronUp size={14} className="text-ink-3" /> : <ChevronDown size={14} className="text-ink-3" />}
      </button>

      {open && (
        <div className="border-t border-line divide-y divide-line/60">
          {sortedQuestions.map((q, idx) => {
            const criterionName = q.axisBCriterionId ? getCriterionName(q.axisBCriterionId) : null;
            return (
              <div key={q.id} className="px-4 py-2.5 flex gap-3">
                <span className="text-cap-md text-ink-3 tabular-nums mt-0.5 shrink-0 w-5">{idx + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="text-body text-ink-1 leading-snug">{q.text}</p>
                  {q.hint && (
                    <p className="text-cap-md text-ink-3 mt-0.5 leading-snug italic">{q.hint}</p>
                  )}
                </div>
                {criterionName && (
                  <span className={cn(
                    "shrink-0 self-start mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                    "bg-brand/10 text-brand"
                  )}>
                    {criterionName}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
