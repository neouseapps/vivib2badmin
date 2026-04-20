"use client";
import { create } from "zustand";
import type { AxisBAnswers, BatchJobState, CallGuideSet, ConfigSnapshot, ContactStatus, CustomVariable, GradingMatrix, Lead, RuleBlock, RoutedLead, RoutingConfig, RoutingStatus, SurveyCriterion, SurveyConfig, VersionRecord } from "@/lib/scoring/types";
import { LEADS } from "@/lib/mock/leads";
import { DEFAULT_MATRIX, DEFAULT_RULES, DEFAULT_SURVEY } from "@/lib/mock/config";
import { DEFAULT_CALL_GUIDE_SETS } from "@/lib/mock/callGuide";
import { computeAxisABase, computeAxisADisplay, computeAxisAEffective, computeAxisB, computeFinalScore, computeLeadScore, gradeFromMatrix, tierFromFinalScore } from "@/lib/scoring/formulas";
import { activateCriterionRebalance, removeToAdjacentRebalance } from "@/lib/scoring/rebalance";

const CRITERION_COLORS = [
  "#135b96", "#19674f", "#7d3c98", "#d65800",
  "#c8a53a", "#0986ec", "#c0392b", "#1abc9c",
];

interface State {
  leads: Lead[];
  rules: RuleBlock[];
  survey: SurveyConfig;
  matrix: GradingMatrix;
  customVariables: CustomVariable[];
  lastGradeChange: { leadId: string; from: string; to: string } | null;
  routingConfig: RoutingConfig;
  // Ops
  draftDirty: boolean;
  batchJob: BatchJobState;
  // Version control
  versions: VersionRecord[];
  activeVersionId: string | null;
  previewVersionId: string | null;
  // Call Guide
  callGuideSets: CallGuideSet[];
}
interface Actions {
  updateRule: (id: string, patch: Partial<RuleBlock>) => void;
  setRules: (rules: RuleBlock[]) => void;
  setSurvey: (s: SurveyConfig) => void;
  setMatrix: (m: GradingMatrix) => void;
  addVariable: (v: CustomVariable) => void;
  updateVariable: (id: string, patch: Partial<CustomVariable>) => void;
  deleteVariable: (id: string) => void;
  reorderVariables: (vars: CustomVariable[]) => void;
  submitPingTest: (leadId: string, answers: AxisBAnswers, actor: string) => void;
  updateContactStatus: (leadId: string, status: ContactStatus) => void;
  clearGradeChange: () => void;
  setRoutingConfig: (patch: Partial<RoutingConfig>) => void;
  // Survey criterion CRUD
  addCriterion: () => void;
  updateCriterion: (id: string, patch: Partial<SurveyCriterion>) => void;
  deleteCriterion: (id: string) => void;
  toggleCriterion: (id: string) => void;
  reorderCriteria: (from: number, to: number) => void;
  setCriterionWeights: (weights: number[]) => void;
  // Call Guide CRUD
  addCallGuideSet: (set: CallGuideSet) => void;
  updateCallGuideSet: (id: string, patch: Partial<CallGuideSet>) => void;
  deleteCallGuideSet: (id: string) => void;
  activateCallGuideSet: (id: string) => void;
  // Ops
  saveDraft: () => void;
  publishConfig: (changeNote: string, isRevert?: boolean) => void;
  dismissBatchDone: () => void;
  // Version control
  previewVersion: (versionId: string) => void;
  exitPreview: () => void;
  revertToVersion: (versionId: string) => void;
}

function nextVersionNum(versions: VersionRecord[], isRevert: boolean) {
  if (!versions.length) return { id: "v1.0", major: 1, minor: 0 };
  const last = versions[versions.length - 1];
  if (isRevert) return { id: `v${last.major + 1}.0`, major: last.major + 1, minor: 0 };
  return { id: `v${last.major}.${last.minor + 1}`, major: last.major, minor: last.minor + 1 };
}

let _batchTimer: ReturnType<typeof setInterval> | null = null;

export const useScoring = create<State & Actions>((set, get) => ({
  leads: LEADS,
  rules: DEFAULT_RULES,
  survey: DEFAULT_SURVEY,
  matrix: DEFAULT_MATRIX,
  customVariables: [],
  lastGradeChange: null,
  routingConfig: { minScoreA: 60, maxLeadsPerRepPerDay: 30 },
  draftDirty: false,
  batchJob: { status: "idle", progress: 0, versionId: null, startedAt: null, estimatedMs: 0 },
  versions: [],
  activeVersionId: null,
  previewVersionId: null,
  callGuideSets: DEFAULT_CALL_GUIDE_SETS,

  updateRule: (id, patch) =>
    set({ rules: get().rules.map((r) => (r.id === id ? { ...r, ...patch } : r)), draftDirty: true }),
  setRules: (rules) => set({ rules, draftDirty: true }),
  setSurvey: (survey) => set({ survey, draftDirty: true }),
  setMatrix: (matrix) => { set({ matrix, draftDirty: true }); },
  addVariable: (v) => set({ customVariables: [...get().customVariables, v], draftDirty: true }),
  updateVariable: (id, patch) =>
    set({ customVariables: get().customVariables.map((v) => v.id === id ? { ...v, ...patch } : v), draftDirty: true }),
  deleteVariable: (id) =>
    set({ customVariables: get().customVariables.filter((v) => v.id !== id), draftDirty: true }),
  reorderVariables: (vars) => set({ customVariables: vars, draftDirty: true }),

  submitPingTest: (leadId, answers, actor) => {
    const s = get();
    const prev = s.leads.find((l) => l.id === leadId);
    if (!prev || prev.onboarded) return;
    const prevGrade = gradeFromMatrix(
      computeAxisAEffective(prev),
      computeAxisB(prev.axisBAnswers, s.survey),
      s.matrix
    );
    const newLead: Lead = {
      ...prev,
      axisBAnswers: answers,
      auditLog: [
        {
          id: `ping-${Date.now()}`,
          source: "CRM",
          axis: "B",
          description: "Ping Test (cập nhật lại)",
          delta: Math.round(computeAxisB(answers, s.survey) - computeAxisB(prev.axisBAnswers, s.survey)),
          actor,
          at: new Date().toISOString(),
        },
        ...prev.auditLog,
      ],
    };
    const newGrade = gradeFromMatrix(
      computeAxisAEffective(newLead),
      computeAxisB(answers, s.survey),
      s.matrix
    );
    set({
      leads: s.leads.map((l) => (l.id === leadId ? newLead : l)),
      lastGradeChange: prevGrade !== newGrade ? { leadId, from: prevGrade, to: newGrade } : null,
    });
  },
  updateContactStatus: (leadId, status) =>
    set({ leads: get().leads.map((l) => (l.id === leadId ? { ...l, contactStatus: status } : l)) }),
  clearGradeChange: () => set({ lastGradeChange: null }),
  setRoutingConfig: (patch) =>
    set({ routingConfig: { ...get().routingConfig, ...patch }, draftDirty: true }),

  addCriterion: () => {
    const { survey } = get();
    const active = survey.criteria.filter((c) => c.active);
    const newWeights = activateCriterionRebalance(active.map((c) => c.weight));
    let aIdx = 0;
    const updated = survey.criteria.map((c) => {
      if (!c.active) return c;
      return { ...c, weight: newWeights[aIdx++] };
    });
    const newCriterion: SurveyCriterion = {
      id: `crit-${Date.now()}`,
      name: `Tiêu chí ${survey.criteria.length + 1}`,
      help: "",
      options: [
        { id: `o-${Date.now()}-1`, label: "Tốt", achievement: 100 },
        { id: `o-${Date.now()}-2`, label: "Trung bình", achievement: 50 },
        { id: `o-${Date.now()}-3`, label: "Chưa đạt", achievement: 0 },
      ],
      weight: newWeights[newWeights.length - 1],
      active: true,
      color: CRITERION_COLORS[survey.criteria.length % CRITERION_COLORS.length],
      order: survey.criteria.length,
    };
    set({ survey: { criteria: [...updated, newCriterion] }, draftDirty: true });
  },

  updateCriterion: (id, patch) => {
    const { survey } = get();
    set({ survey: { criteria: survey.criteria.map((c) => c.id === id ? { ...c, ...patch } : c) }, draftDirty: true });
  },

  deleteCriterion: (id) => {
    const { survey } = get();
    const crit = survey.criteria.find((c) => c.id === id);
    if (!crit) return;
    if (crit.active) {
      const active = survey.criteria.filter((c) => c.active);
      if (active.length > 1) {
        const activeIdx = active.findIndex((c) => c.id === id);
        const newWeights = removeToAdjacentRebalance(active.map((c) => c.weight), activeIdx);
        let aIdx = 0;
        const updated = survey.criteria
          .filter((c) => c.id !== id)
          .map((c) => {
            if (!c.active) return c;
            return { ...c, weight: newWeights[aIdx++] };
          });
        set({ survey: { criteria: updated }, draftDirty: true });
        return;
      }
    }
    set({ survey: { criteria: survey.criteria.filter((c) => c.id !== id) }, draftDirty: true });
  },

  toggleCriterion: (id) => {
    const { survey } = get();
    const crit = survey.criteria.find((c) => c.id === id);
    if (!crit) return;
    if (crit.active) {
      const active = survey.criteria.filter((c) => c.active);
      if (active.length <= 1) return;
      const activeIdx = active.findIndex((c) => c.id === id);
      const newWeights = removeToAdjacentRebalance(active.map((c) => c.weight), activeIdx);
      let aIdx = 0;
      const updated = survey.criteria.map((c) => {
        if (c.id === id) return { ...c, active: false, weight: 0 };
        if (!c.active) return c;
        return { ...c, weight: newWeights[aIdx++] };
      });
      set({ survey: { criteria: updated }, draftDirty: true });
    } else {
      const active = survey.criteria.filter((c) => c.active);
      const newWeights = activateCriterionRebalance(active.map((c) => c.weight));
      let aIdx = 0;
      const updated = survey.criteria.map((c) => {
        if (c.id === id) return { ...c, active: true, weight: newWeights[newWeights.length - 1] };
        if (!c.active) return c;
        return { ...c, weight: newWeights[aIdx++] };
      });
      set({ survey: { criteria: updated }, draftDirty: true });
    }
  },

  reorderCriteria: (from, to) => {
    const { survey } = get();
    const next = [...survey.criteria];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set({ survey: { criteria: next.map((c, i) => ({ ...c, order: i })) }, draftDirty: true });
  },

  setCriterionWeights: (weights) => {
    const { survey } = get();
    const active = survey.criteria.filter((c) => c.active);
    if (weights.length !== active.length) return;
    let aIdx = 0;
    const updated = survey.criteria.map((c) => {
      if (!c.active) return c;
      return { ...c, weight: weights[aIdx++] };
    });
    set({ survey: { criteria: updated }, draftDirty: true });
  },

  addCallGuideSet: (set_) =>
    set({ callGuideSets: [...get().callGuideSets, set_] }),
  updateCallGuideSet: (id, patch) =>
    set({ callGuideSets: get().callGuideSets.map((s) => s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s) }),
  deleteCallGuideSet: (id) =>
    set({ callGuideSets: get().callGuideSets.filter((s) => s.id !== id) }),
  activateCallGuideSet: (id) => {
    const target = get().callGuideSets.find((s) => s.id === id);
    if (!target) return;
    set({
      callGuideSets: get().callGuideSets.map((s) =>
        s.sector === target.sector ? { ...s, active: s.id === id } : s
      ),
    });
  },

  saveDraft: () => set({ draftDirty: false }),

  publishConfig: (changeNote, isRevert = false) => {
    const s = get();
    const { id, major, minor } = nextVersionNum(s.versions, isRevert);
    const snapshot: ConfigSnapshot = {
      rules: s.rules,
      survey: s.survey,
      matrix: s.matrix,
      routingConfig: s.routingConfig,
      customVariables: s.customVariables,
    };
    const newVersion: VersionRecord = {
      id,
      major,
      minor,
      publishedAt: new Date().toISOString(),
      publishedBy: "Admin",
      changeNote,
      status: "active",
      snapshot,
      affectedLeadsCount: s.leads.length,
    };
    const updatedVersions = s.versions.map((v) => ({ ...v, status: "old" as const }));
    set({
      versions: [...updatedVersions, newVersion],
      activeVersionId: id,
      draftDirty: false,
      batchJob: { status: "running", progress: 0, versionId: id, startedAt: new Date().toISOString(), estimatedMs: 15000 },
    });
    if (_batchTimer) clearInterval(_batchTimer);
    _batchTimer = setInterval(() => {
      const cur = get().batchJob.progress;
      if (cur >= 100) {
        clearInterval(_batchTimer!);
        _batchTimer = null;
        set({ batchJob: { ...get().batchJob, status: "done", progress: 100 } });
      } else {
        set({ batchJob: { ...get().batchJob, progress: Math.min(100, cur + 2) } });
      }
    }, 300);
  },

  dismissBatchDone: () =>
    set({ batchJob: { status: "idle", progress: 0, versionId: null, startedAt: null, estimatedMs: 0 } }),

  previewVersion: (versionId) => set({ previewVersionId: versionId }),

  exitPreview: () => set({ previewVersionId: null }),

  revertToVersion: (versionId) => {
    const version = get().versions.find((v) => v.id === versionId);
    if (!version) return;
    const { rules, survey, matrix, routingConfig, customVariables } = version.snapshot;
    set({ rules, survey, matrix, routingConfig, customVariables, draftDirty: true, previewVersionId: null });
  },
}));

export function getLeadDerived(lead: Lead, cfg: SurveyConfig, matrix: GradingMatrix) {
  const axisADisplay = computeAxisADisplay(lead);
  const axisAEff = computeAxisAEffective(lead);
  const axisABase = computeAxisABase(lead);
  const axisB = computeAxisB(lead.axisBAnswers, cfg);
  const grade = gradeFromMatrix(axisAEff, axisB, matrix);
  const leadScore = computeLeadScore(axisABase, axisB);
  const finalScore = computeFinalScore(axisABase, axisB, lead.campaignBoost);
  const tier = tierFromFinalScore(finalScore);
  return { axisADisplay, axisAEff, axisABase, axisB, grade, leadScore, finalScore, tier };
}

export function getRoutedLeads(leads: Lead[], cfg: RoutingConfig): RoutedLead[] {
  const scored = leads.map((lead) => ({
    lead,
    axisAEff: computeAxisAEffective(lead),
  }));

  const qualified = scored
    .filter((r) => r.axisAEff >= cfg.minScoreA)
    .sort((a, b) => b.axisAEff - a.axisAEff);

  const nurture = scored.filter((r) => r.axisAEff < cfg.minScoreA);

  const uniqueReps = new Set(
    leads.map((l) => l.assignedTo).filter((r) => r !== "—")
  ).size;
  const quota = cfg.maxLeadsPerRepPerDay * Math.max(1, uniqueReps);

  const routed: RoutedLead[] = qualified.map((r, idx) => ({
    ...r,
    routingStatus: (idx < quota ? "Pending_Audit" : "Qualified_For_Audit") as RoutingStatus,
  }));

  const nurtureRouted: RoutedLead[] = nurture.map((r) => ({
    ...r,
    routingStatus: "Marketing_Nurture" as RoutingStatus,
  }));

  return [...routed, ...nurtureRouted];
}
