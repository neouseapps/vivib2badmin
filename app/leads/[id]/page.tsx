"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import { Header, CreateTaskButton } from "@/components/layout/Header";
import { getLeadDerived, useScoring } from "@/lib/store/scoring-store";
import { AuditTimeline } from "@/components/scoring/AuditTimeline";
import { GradeToast } from "@/components/scoring/GradeToast";
import { Sparkline } from "@/components/scoring/Sparkline";
import { AxisACards } from "@/components/scoring/AxisACards";
import { AxisBWorkspace } from "@/components/scoring/AxisBWorkspace";
import { CompositeSummary } from "@/components/scoring/CompositeSummary";
import { LeadInfoPanel } from "@/components/scoring/LeadInfoPanel";
import { CallGuidePanel } from "@/components/scoring/CallGuidePanel";
import { Info, Save, FileText, Plus, Clock } from "lucide-react";

const STATUS_LABEL: Record<string, string> = { COLD: "Lạnh", CONTACTED: "Đã liên hệ", ACTIVE: "Đang tương tác" };

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const leads = useScoring((s) => s.leads);
  const survey = useScoring((s) => s.survey);
  const matrix = useScoring((s) => s.matrix);
  const submit = useScoring((s) => s.submitPingTest);
  const updateStatus = useScoring((s) => s.updateContactStatus);
  const callGuideSets = useScoring((s) => s.callGuideSets);
  const lead = leads.find((l) => l.id === id);

  if (!lead) return notFound();
  const { axisABase, axisB, grade, leadScore, finalScore, tier } = getLeadDerived(lead, survey, matrix);

  const bLocked = lead.contactStatus === "COLD";
  const allLocked = lead.onboarded;
  const callGuideSet = callGuideSets.find((s) => s.sector === lead.sector && s.active) ?? null;

  const lastPing = lead.auditLog.find((e) => e.axis === "B");
  const staleDays = lastPing ? Math.floor((Date.now() - new Date(lastPing.at).getTime()) / 86400000) : 999;
  const rescoreRecommended = lastPing && staleDays > 30 && !lead.onboarded;

  return (
    <>
      <Header title="Chi tiết lead" actions={<CreateTaskButton />} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-[1fr_320px] gap-0 min-h-full">
          {/* MAIN */}
          <div className="p-6 space-y-5 border-r border-line bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-cap-md text-ink-3">Tên lead</div>
                <h2 className="text-h3 font-semibold">{lead.name}</h2>
              </div>
              <button className="btn-outline"><Save size={16} />Lưu thông tin</button>
            </div>

            {/* Thông tin chung */}
            <section className="card p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <Info size={16} className="text-ink-3" />
                <h3 className="section-title">Thông tin chung</h3>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-body">
                <div className="text-ink-3">Tên</div><div>{lead.name}</div>
                <div className="text-ink-3">Trạng thái</div>
                <div><span className="chip bg-info-light text-info">{STATUS_LABEL[lead.contactStatus]}</span></div>
                <div className="text-ink-3">Mã số DN</div><div className="font-mono">0101234567</div>
                <div className="text-ink-3">Lĩnh vực</div><div>{lead.sector}</div>
                <div className="text-ink-3">Địa chỉ</div><div>{lead.location}</div>
                <div className="text-ink-3">Phụ trách</div><div>{lead.assignedTo}</div>
              </div>
            </section>

            {/* Thông tin nguồn */}
            <section className="card p-5">
              <div className="flex items-center gap-1.5 mb-3">
                <FileText size={16} className="text-ink-3" />
                <h3 className="section-title">Thông tin nguồn</h3>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-body">
                <div className="text-ink-3">Loại</div><div>Chính thống</div>
                <div className="text-ink-3">Chi tiết nguồn</div><div>Content filled</div>
                <div className="text-ink-3">Form</div>
                <div><button className="btn-outline h-8 text-cap-md"><Plus size={12} />Tạo form</button></div>
              </div>
            </section>

            {/* SCORING PANEL */}
            <section className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-grade-aBg text-grade-a flex items-center justify-center">
                    <span className="text-sm">🏆</span>
                  </div>
                  <h3 className="section-title">Đánh giá &amp; xếp hạng tiềm năng</h3>
                </div>
                {allLocked && (
                  <span className="chip bg-bg-lv3 text-ink-3 text-[10px]">
                    Điểm số đã được chốt sau khi đối tác lên sàn (Go-live)
                  </span>
                )}
              </div>

              {/* 2-column grid: Final Score (left) | Axis A + Axis B (right) */}
              <div className="grid grid-cols-[1fr_280px] gap-4 items-start">
                {/* Left — Final Score */}
                <CompositeSummary
                  finalScore={finalScore}
                  leadScore={leadScore}
                  sourceBoost={lead.campaignBoost}
                  tier={tier}
                  allLocked={allLocked}
                  onPrioritize={() => {}}
                />

                {/* Right — Axis A + Axis B stacked */}
                <div className="space-y-3">
                  <AxisACards
                    axisABase={axisABase}
                    campaignBoost={lead.campaignBoost}
                    locked={allLocked}
                  />
                  <AxisBWorkspace
                    survey={survey}
                    current={lead.axisBAnswers}
                    axisB={axisB}
                    locked={bLocked}
                    allLocked={allLocked}
                    onUnlock={() => updateStatus(lead.id, "CONTACTED")}
                    onSubmit={(answers) => submit(lead.id, answers, "Bạn")}
                  />
                </div>
              </div>

              {/* Full-width — Câu hỏi gợi ý */}
              {!bLocked && callGuideSet && (
                <div className="border-t border-line pt-4">
                  <CallGuidePanel
                    guideSet={callGuideSet}
                    survey={survey}
                    hasExistingAnswers={!!lead.axisBAnswers}
                  />
                </div>
              )}

              {rescoreRecommended && (
                <div className="border-t border-line pt-2">
                  <div className="chip bg-warn-light text-warn-text">
                    <Clock size={12} /> Rescore Recommended · {staleDays} ngày
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN — Lead Info Panel */}
          <LeadInfoPanel lead={lead} />
        </div>
      </div>

      <GradeToast />
    </>
  );
}
