"use client";
import { useState } from "react";
import type { AxisBAnswers, SurveyConfig } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { X, Check } from "lucide-react";

interface Props {
  survey: SurveyConfig;
  current: AxisBAnswers | null;
  onCancel: () => void;
  onSubmit: (answers: AxisBAnswers) => void;
}

type Draft = Record<string, number | undefined>;

export function PingTestForm({ survey, current, onCancel, onSubmit }: Props) {
  const activeCriteria = survey.criteria.filter((c) => c.active);

  const [draft, setDraft] = useState<Draft>(
    current
      ? Object.fromEntries(activeCriteria.map((c) => [c.id, current[c.id]]))
      : {}
  );
  const allAnswered = activeCriteria.every((c) => draft[c.id] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-6">
      <div className="w-full sm:max-w-[600px] bg-white rounded-t-2xl sm:rounded-lg shadow-lv2 max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="text-h4 font-semibold">Ping Test</h2>
            <p className="text-cap-md text-ink-3 mt-0.5">Chọn mức độ quan sát được sau khi liên hệ đối tác.</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-md hover:bg-bg-lv3 text-ink-3"><X size={18}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          {activeCriteria.map((c) => {
            const selected = draft[c.id];
            return (
              <fieldset key={c.id}>
                <legend className="text-body font-semibold text-ink-1">{c.name}</legend>
                <p className="text-cap-md text-ink-3 mt-0.5">{c.help}</p>
                <div className="mt-3 grid gap-2">
                  {c.options.map((opt) => {
                    const isSelected = selected === opt.achievement;
                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          "flex items-center gap-3 h-11 px-3 rounded-lg border cursor-pointer transition-colors",
                          isSelected ? "border-ink-1 bg-ink-1/5" : "border-line hover:bg-bg-lv3"
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={c.id}
                          checked={isSelected}
                          onChange={() => setDraft({ ...draft, [c.id]: opt.achievement })}
                        />
                        <span className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                          isSelected ? "border-ink-1" : "border-ink-3"
                        )}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-ink-1" />}
                        </span>
                        <span className="text-body text-ink-1">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
          <div className="rounded-lg bg-info-light/60 border border-info/20 px-3 py-2 text-cap-md text-info">
            Sales Rep không nhìn thấy điểm số để tránh thao túng kết quả.
          </div>
        </div>
        <div className="px-5 py-4 border-t border-line flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Huỷ</Button>
          <Button
            variant="primary"
            disabled={!allAnswered}
            onClick={() => allAnswered && onSubmit(draft as AxisBAnswers)}
            className={cn(!allAnswered && "opacity-40 cursor-not-allowed")}
          >
            <Check size={16} /> Submit Ping Test
          </Button>
        </div>
      </div>
    </div>
  );
}
