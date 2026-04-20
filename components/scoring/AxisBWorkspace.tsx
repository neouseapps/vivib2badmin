"use client";
import { useState } from "react";
import { PhoneCall, Lock, RefreshCw, CheckCircle, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AxisBAnswers, CallGuideSet, SurveyConfig } from "@/lib/scoring/types";

interface Props {
  survey: SurveyConfig;
  current: AxisBAnswers | null;
  axisB: number;
  locked: boolean;
  allLocked: boolean;
  callGuideSet?: CallGuideSet | null;
  onUnlock: () => void;
  onSubmit: (answers: AxisBAnswers) => void;
}

function isDirty(draft: Record<string, number | undefined>, saved: AxisBAnswers | null, ids: string[]) {
  return ids.some((id) => draft[id] !== (saved ? (saved[id] ?? undefined) : undefined));
}

export function AxisBWorkspace({ survey, current, axisB, locked, allLocked, callGuideSet, onUnlock, onSubmit }: Props) {
  const activeCriteria = survey.criteria.filter((c) => c.active);
  const ids = activeCriteria.map((c) => c.id);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, number | undefined>>(() =>
    current ? Object.fromEntries(activeCriteria.map((c) => [c.id, current[c.id]])) : {}
  );

  const dirty = isDirty(draft, current, ids);
  const allAnswered = activeCriteria.every((c) => draft[c.id] !== undefined);

  function handleSelect(criterionId: string, achievement: number) {
    setDraft((prev) => ({ ...prev, [criterionId]: achievement }));
  }

  function handleSubmit() {
    if (!allAnswered || !dirty) return;
    onSubmit(draft as AxisBAnswers);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(current ? Object.fromEntries(activeCriteria.map((c) => [c.id, current[c.id]])) : {});
    setIsEditing(false);
  }

  function handleStartEdit() {
    setDraft(current ? Object.fromEntries(activeCriteria.map((c) => [c.id, current[c.id]])) : {});
    setIsEditing(true);
  }

  return (
    <>
      {/* Card */}
      <div className="relative rounded-xl border border-line overflow-hidden">
        <div className={cn(locked || allLocked ? "opacity-50" : "")}>
          <div className="px-4 pt-3 pb-1">
            <div className="text-cap text-ink-3 font-medium">Axis B</div>
          </div>
          <div className="flex items-center gap-4 px-4 pb-3">
            <div>
              <div className="text-3xl font-bold tabular-nums text-ink-1">
                {current ? Math.round(axisB) : "—"}
              </div>
              <div className="text-cap text-ink-3">/ 100</div>
            </div>
            <div className="flex-1" />
            {!allLocked && !locked && (
              <button onClick={handleStartEdit} className="btn-outline h-8 text-cap-md shrink-0">
                <RefreshCw size={12} />
                {current ? "Cập nhật Axis B" : "Ping Test"}
              </button>
            )}
          </div>
        </div>

        {/* COLD overlay */}
        {locked && !allLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-[2px] px-4">
            <div className="w-10 h-10 rounded-full bg-ink-1/10 flex items-center justify-center text-ink-2">
              <Lock size={18} />
            </div>
            <div className="text-cap-md text-ink-2 font-medium text-center">
              Chưa liên hệ đối tác.<br />Xác nhận để mở Ping Test.
            </div>
            <button onClick={onUnlock} className="btn-primary h-8 text-cap-md">
              <PhoneCall size={12} /> Xác nhận đã liên hệ
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div>
                <div className="text-body font-semibold text-ink-1">Đánh giá Axis B — Ping Test</div>
                <div className="text-cap-md text-ink-3 mt-0.5 flex items-center gap-1">
                  <CheckCircle size={11} className="text-info" />
                  Điểm thành phần bị ẩn để đảm bảo đánh giá khách quan
                </div>
              </div>
              <button onClick={handleCancel} className="text-ink-3 hover:text-ink-1 p-1">
                <X size={18} />
              </button>
            </div>

            {/* Criteria */}
            <div className="overflow-y-auto divide-y divide-line flex-1">
              {activeCriteria.map((criterion) => {
                const selected = draft[criterion.id];
                const questions = callGuideSet?.questions.filter(
                  (q) => q.axisBCriterionId === criterion.id
                ) ?? [];
                return (
                  <div key={criterion.id} className="px-5 py-4 space-y-3">
                    {/* Title */}
                    <div>
                      <div className="text-body font-medium text-ink-1 mb-0.5">{criterion.name}</div>
                      <div className="text-cap-md text-ink-3 leading-snug">{criterion.help}</div>
                    </div>

                    {/* Call guide questions */}
                    {questions.length > 0 && (
                      <div className="rounded-lg bg-bg-lv2 border border-line p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-cap text-ink-3 font-medium">
                          <MessageSquare size={11} />
                          Câu hỏi gợi ý
                        </div>
                        <ul className="space-y-2">
                          {questions.map((q) => (
                            <li key={q.id} className="space-y-0.5">
                              <div className="text-cap-md text-ink-1">{q.text}</div>
                              {q.hint && (
                                <div className="text-cap text-ink-3">{q.hint}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Evaluation options */}
                    <div className="flex gap-2 flex-wrap">
                      {criterion.options.map((opt) => {
                        const isSel = selected === opt.achievement;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelect(criterion.id, opt.achievement)}
                            className={cn(
                              "h-8 px-3 rounded-lg border text-cap-md font-medium transition-colors whitespace-nowrap",
                              isSel
                                ? "border-ink-1 bg-ink-1 text-white"
                                : "border-line bg-white text-ink-2 hover:border-ink-2 hover:text-ink-1"
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-bg-lv2/40 border-t border-line flex items-center justify-end gap-2">
              <button onClick={handleCancel} className="btn-outline h-9 text-cap-md">Huỷ</button>
              <button
                disabled={!dirty || !allAnswered}
                onClick={handleSubmit}
                className={cn("btn-primary h-9 text-cap-md", (!dirty || !allAnswered) && "opacity-30 cursor-not-allowed")}
              >
                <RefreshCw size={12} /> Lưu điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
