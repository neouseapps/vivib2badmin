"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useScoring } from "@/lib/store/scoring-store";
import { cn } from "@/lib/cn";
import type { CallGuideQuestion, CallGuideSet, SurveyConfig } from "@/lib/scoring/types";

interface Props {
  initial?: CallGuideSet;
  mode: "new" | "edit";
}

const SECTOR_OPTIONS: CallGuideSet["sector"][] = ["Accommodation", "F&B", "Tour", "Retail"];
const SECTOR_LABELS: Record<string, string> = {
  Accommodation: "Lưu trú (Accommodation)",
  "F&B": "F&B (Nhà hàng / Ăn uống)",
  Tour: "Lữ hành (Tour)",
  Retail: "Bán lẻ (Retail)",
};

function newQuestion(order: number): CallGuideQuestion {
  return { id: `q-${Date.now()}-${order}`, text: "", hint: "", axisBCriterionId: undefined, order };
}

function CriterionSelect({ value, onChange, survey }: { value?: string; onChange: (v: string) => void; survey: SurveyConfig }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 px-2 rounded-lg border border-line bg-white text-cap-md text-ink-2 focus:outline-none focus:ring-1 focus:ring-ink-1"
    >
      <option value="">— Không gắn nhãn —</option>
      {survey.criteria.filter((c) => c.active).map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}

export function CallGuideEditor({ initial, mode }: Props) {
  const router = useRouter();
  const survey = useScoring((s) => s.survey);
  const addSet = useScoring((s) => s.addCallGuideSet);
  const updateSet = useScoring((s) => s.updateCallGuideSet);

  const [name, setName] = useState(initial?.name ?? "");
  const [sector, setSector] = useState<CallGuideSet["sector"] | "">(initial?.sector ?? "");
  const [questions, setQuestions] = useState<CallGuideQuestion[]>(
    initial?.questions.length ? [...initial.questions].sort((a, b) => a.order - b.order) : [newQuestion(0)]
  );
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  const canSave = name.trim() && sector && questions.some((q) => q.text.trim());

  function addQuestion() {
    setQuestions((prev) => [...prev, newQuestion(prev.length)]);
  }

  function updateQuestion(id: string, patch: Partial<CallGuideQuestion>) {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, ...patch } : q));
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i })));
  }

  function toggleHint(id: string) {
    setExpandedHints((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function moveQuestion(idx: number, dir: -1 | 1) {
    const next = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setQuestions(next.map((q, i) => ({ ...q, order: i })));
  }

  function handleSave() {
    if (!canSave || !sector) return;
    const now = new Date().toISOString();
    const validQuestions = questions.filter((q) => q.text.trim()).map((q, i) => ({ ...q, order: i }));

    if (mode === "new") {
      addSet({
        id: `cg-${Date.now()}`,
        name: name.trim(),
        sector,
        questions: validQuestions,
        active: false,
        createdAt: now,
        updatedAt: now,
      });
    } else if (initial) {
      updateSet(initial.id, { name: name.trim(), sector, questions: validQuestions });
    }
    router.push("/call-guide");
  }

  return (
    <>
      <Header
        title={mode === "new" ? "Tạo bộ câu hỏi mới" : "Chỉnh sửa bộ câu hỏi"}
        actions={
          <div className="flex gap-2">
            <button onClick={() => router.push("/call-guide")} className="btn-outline h-9">Huỷ</button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={cn("btn-primary h-9", !canSave && "opacity-30 cursor-not-allowed")}
            >
              Lưu bộ câu hỏi
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 max-w-2xl mx-auto w-full">
        <div className="space-y-5">
          {/* Metadata */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="text-cap-md text-ink-2 font-medium mb-1 block">Tên bộ câu hỏi <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vd: Khách sạn — Tiêu chuẩn 2026"
                className="w-full h-9 px-3 rounded-lg border border-line bg-white text-body text-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1 placeholder:text-ink-3"
              />
            </div>
            <div>
              <label className="text-cap-md text-ink-2 font-medium mb-1 block">Ngành nghề <span className="text-red-500">*</span></label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as CallGuideSet["sector"])}
                className="w-full h-9 px-3 rounded-lg border border-line bg-white text-body text-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
              >
                <option value="">— Chọn ngành nghề —</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{SECTOR_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-body font-semibold text-ink-1">Danh sách câu hỏi</h3>
              <span className="text-cap-md text-ink-3">{questions.length} câu</span>
            </div>
            <div className="space-y-2">
              {questions.map((q, idx) => {
                const hintOpen = expandedHints.has(q.id);
                return (
                  <div key={q.id} className="card p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      {/* Drag handle / order indicator */}
                      <div className="flex flex-col items-center gap-0.5 mt-1 shrink-0">
                        <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} className="text-ink-3 hover:text-ink-1 disabled:opacity-20 p-0.5">
                          <ChevronUp size={12} />
                        </button>
                        <GripVertical size={14} className="text-ink-3" />
                        <button onClick={() => moveQuestion(idx, 1)} disabled={idx === questions.length - 1} className="text-ink-3 hover:text-ink-1 disabled:opacity-20 p-0.5">
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <div className="flex-1 space-y-2">
                        {/* Question text */}
                        <textarea
                          value={q.text}
                          onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                          placeholder={`Câu hỏi ${idx + 1}`}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-line bg-white text-body text-ink-1 resize-none focus:outline-none focus:ring-1 focus:ring-ink-1 placeholder:text-ink-3"
                        />
                        {/* Axis B label + hint toggle */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <CriterionSelect
                            value={q.axisBCriterionId}
                            onChange={(v) => updateQuestion(q.id, { axisBCriterionId: v || undefined })}
                            survey={survey}
                          />
                          <button
                            onClick={() => toggleHint(q.id)}
                            className="text-cap-md text-ink-3 hover:text-ink-1 flex items-center gap-0.5 transition-colors"
                          >
                            {hintOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            Gợi ý nghe
                          </button>
                        </div>
                        {/* Hint text */}
                        {hintOpen && (
                          <input
                            value={q.hint ?? ""}
                            onChange={(e) => updateQuestion(q.id, { hint: e.target.value })}
                            placeholder="Gợi ý cho Sale Rep cần nghe gì từ câu trả lời..."
                            className="w-full h-8 px-3 rounded-lg border border-line bg-bg-lv2 text-cap-md text-ink-2 focus:outline-none focus:ring-1 focus:ring-ink-1 placeholder:text-ink-3"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        disabled={questions.length === 1}
                        className="mt-1 shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-ink-3 hover:bg-red-50 hover:text-red-600 disabled:opacity-20 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={addQuestion}
              className="mt-3 w-full h-9 rounded-xl border border-dashed border-line text-ink-3 hover:border-ink-2 hover:text-ink-2 flex items-center justify-center gap-1.5 text-body transition-colors"
            >
              <Plus size={14} /> Thêm câu hỏi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
