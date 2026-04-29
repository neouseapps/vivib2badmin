"use client";
import { useMemo, useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Header } from "@/components/layout/Header";
import { BalanceSlider } from "@/components/rules/BalanceSlider";
import { RuleBlock } from "@/components/rules/RuleBlock";
import { ResourceManager } from "@/components/rules/ResourceManager";
import { SimulationPanel } from "@/components/rules/SimulationPanel";
import { PingTestBuilder } from "@/components/survey/PingTestBuilder";
import { AxisAControl, QuotaControl } from "@/components/routing/RoutingConfig";
import { FunnelChart, type FunnelData } from "@/components/routing/FunnelChart";
import { LeadBuckets } from "@/components/routing/LeadBuckets";
import { RepAllocation } from "@/components/routing/RepAllocation";
import { getRoutedLeads, useScoring } from "@/lib/store/scoring-store";
import { addRuleRebalance, removeRuleRebalance } from "@/lib/scoring/rebalance";
import type { RuleBlock as RuleT } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";
import { Plus, LayoutGrid, Zap } from "lucide-react";
import { ScoringOpsProvider } from "@/lib/context/scoring-ops-context";
import { OpsToolbar } from "@/components/ops/OpsToolbar";
import { BatchProgressBanner } from "@/components/ops/BatchProgressBanner";
import { PublishConfirmModal } from "@/components/ops/PublishConfirmModal";
import { VersionHistoryPanel } from "@/components/ops/VersionHistoryPanel";
import { ReadOnlyOverlay } from "@/components/ops/ReadOnlyOverlay";
import { Button, Badge, Card } from "@/components/ui";

type Tab = "axisA" | "axisB" | "routing";

const RULE_COLORS = ["#135b96", "#19674f", "#d65800", "#7d3c98", "#c8a53a", "#0986ec", "#c0392b"];

export default function ScoringSettingsPage() {
  const [tab, setTab] = useState<Tab>("axisA");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const leads = useScoring((s) => s.leads);
  const draftDirty = useScoring((s) => s.draftDirty);
  const batchJob = useScoring((s) => s.batchJob);
  const saveDraft = useScoring((s) => s.saveDraft);
  const publishConfig = useScoring((s) => s.publishConfig);
  const dismissBatchDone = useScoring((s) => s.dismissBatchDone);
  const isLocked = batchJob.status === "running";

  return (
    <ScoringOpsProvider>
      <Header
        title="Cấu hình chấm điểm & xếp hạng lead"
        actions={
          <OpsToolbar
            draftDirty={draftDirty}
            isReadOnly={isLocked}
            onSaveDraft={saveDraft}
            onPublishClick={() => setPublishModalOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        }
      />
      <div className="px-6 pt-4 border-b border-line bg-white flex items-center gap-1">
        <TabBtn active={tab === "axisA"} onClick={() => setTab("axisA")}>Axis A · Ecosystem Value</TabBtn>
        <TabBtn active={tab === "axisB"} onClick={() => setTab("axisB")}>Axis B · Partnership Viability</TabBtn>
        <TabBtn active={tab === "routing"} onClick={() => setTab("routing")}>Phân luồng & Năng suất</TabBtn>
      </div>
      <BatchProgressBanner batchJob={batchJob} onDismiss={dismissBatchDone} />
      <ReadOnlyOverlay>
        <div className="flex-1 min-h-0 flex flex-col">
          {tab === "axisA" && <AxisATab/>}
          {tab === "axisB" && <AxisBTab/>}
          {tab === "routing" && <RoutingTab/>}
        </div>
      </ReadOnlyOverlay>
      <VersionHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <PublishConfirmModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={(note) => { publishConfig(note); setPublishModalOpen(false); }}
        affectedLeadsCount={leads.length}
        estimatedSeconds={Math.ceil(leads.length * 2)}
      />
    </ScoringOpsProvider>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; }) {
  return (
    <button onClick={onClick}
      className={cn(
        "px-4 h-10 text-body font-semibold border-b-2 -mb-[1px]",
        active ? "text-ink-1 border-ink-1" : "text-ink-3 border-transparent hover:text-ink-1"
      )}>
      {children}
    </button>
  );
}

function AxisATab() {
  const rules = useScoring((s) => s.rules);
  const setRules = useScoring((s) => s.setRules);

  const weights = rules.map((r) => r.weight);
  const colors = rules.map((_, i) => RULE_COLORS[i % RULE_COLORS.length]);
  const labels = rules.map((r) => r.name);

  function onSliderChange(next: number[]) {
    setRules(rules.map((r, i) => ({ ...r, weight: next[i] })));
  }
  function onAddRule() {
    const currentWeights = rules.map((r) => r.weight);
    const rebalanced = addRuleRebalance(currentWeights, 5);
    const updated: RuleT[] = rules.map((r, i) => ({ ...r, weight: rebalanced[i] }));
    updated.push({
      id: `r-${Date.now()}`,
      name: `Rule mới ${rules.length + 1}`,
      field: "lead.enrichment.rating",
      operator: ">=",
      value: "4.0",
      weight: rebalanced.at(-1)!,
      active: true,
      source: "API",
      conditions: [{ id: `c-${Date.now()}`, negate: false, field: "lead.enrichment.rating", operator: "gte", value: "4.0" }],
      conditionConnector: "AND",
      conditionMode: "visual",
      conditionCode: "lead.enrichment.rating >= 4.0",
      formula: "",
      minScore: 0,
      maxScore: 100,
    });
    setRules(updated);
  }
  function onRemove(idx: number) {
    const rebalanced = removeRuleRebalance(rules.map((r) => r.weight), idx);
    const kept = rules.filter((_, i) => i !== idx).map((r, i) => ({ ...r, weight: rebalanced[i] ?? r.weight }));
    setRules(kept);
  }
  function onDuplicate(idx: number) {
    const src = rules[idx];
    const currentWeights = rules.map((r) => r.weight);
    const rebalanced = addRuleRebalance(currentWeights, 5);
    const updated: RuleT[] = rules.map((r, i) => ({ ...r, weight: rebalanced[i] }));
    updated.splice(idx + 1, 0, { ...src, id: `r-${Date.now()}`, name: `${src.name} (bản sao)`, weight: rebalanced.at(-1)! });
    setRules(normalizeWeights(updated));
  }
  function onUpdate(idx: number, patch: Partial<RuleT>) {
    setRules(rules.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }
  function onMove(idx: number, dir: -1 | 1) {
    const next = [...rules];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setRules(next);
  }

  const sum = weights.reduce((a,b) => a+b, 0);

  return (
    <div className="grid grid-cols-[1fr_300px] gap-0 flex-1 min-h-0">
      {/* Left: Rule workspace */}
      <div className="p-6 space-y-5 border-r border-line bg-white overflow-y-auto scrollbar-thin">
        {/* Balance Slider */}
        <Card padding="lg">
          <BalanceSlider
            values={weights}
            labels={labels}
            colors={colors}
            onChange={onSliderChange}
          />
        </Card>

        {/* Add rule */}
        <div className="flex items-center gap-2">
          <Badge intention="info" style="light" className="text-[10px]">
            <Zap size={10} />Source: API
          </Badge>
          <Button variant="primary" onClick={onAddRule} className="ml-auto"><Plus size={14}/>Thêm Rule</Button>
        </div>

        <RuleDndList
          rules={rules}
          colors={colors}
          onUpdate={onUpdate}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onReorder={(oldIdx, newIdx) => {
            const reordered = arrayMove(rules, oldIdx, newIdx);
            setRules(reordered);
          }}
        />
      </div>

      {/* Right: Resource Manager + Simulation stacked */}
      <aside className="bg-bg-lv2/30 overflow-y-auto scrollbar-thin flex flex-col">
        <div className="p-5 border-b border-line">
          <ResourceManager/>
        </div>
        <div className="p-5">
          <SimulationPanel/>
        </div>
      </aside>
    </div>
  );
}

// ── Sortable rule card ────────────────────────────────────────────────────────
function SortableRuleBlock({
  rule, color, onUpdate, onDuplicate, onRemove,
}: {
  rule: RuleT; color: string;
  onUpdate: (patch: Partial<RuleT>) => void;
  onDuplicate: () => void; onRemove: () => void;
}) {
  const { setNodeRef, transform, transition, isDragging, listeners, attributes } = useSortable({ id: rule.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      <RuleBlock
        rule={rule}
        color={color}
        onChange={onUpdate}
        onDuplicate={onDuplicate}
        onDelete={onRemove}
        dragHandleListeners={listeners as Record<string, unknown>}
        dragHandleAttributes={attributes as unknown as Record<string, unknown>}
      />
    </div>
  );
}

function RuleDndList({
  rules, colors, onUpdate, onDuplicate, onRemove, onReorder,
}: {
  rules: RuleT[]; colors: string[];
  onUpdate: (i: number, patch: Partial<RuleT>) => void;
  onDuplicate: (i: number) => void; onRemove: (i: number) => void;
  onReorder: (oldIdx: number, newIdx: number) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const ids = rules.map((r) => r.id);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = ids.indexOf(active.id as string);
      const newIdx = ids.indexOf(over.id as string);
      if (oldIdx !== -1 && newIdx !== -1) onReorder(oldIdx, newIdx);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {rules.map((r, i) => (
            <SortableRuleBlock
              key={r.id}
              rule={r}
              color={colors[i]}
              onUpdate={(patch) => onUpdate(i, patch)}
              onDuplicate={() => onDuplicate(i)}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}


function AxisBTab() {
  const survey = useScoring((s) => s.survey);
  const addCriterion = useScoring((s) => s.addCriterion);
  const updateCriterion = useScoring((s) => s.updateCriterion);
  const deleteCriterion = useScoring((s) => s.deleteCriterion);
  const toggleCriterion = useScoring((s) => s.toggleCriterion);
  const reorderCriteria = useScoring((s) => s.reorderCriteria);
  const setCriterionWeights = useScoring((s) => s.setCriterionWeights);

  const active = survey.criteria.filter((c) => c.active);
  const sliderValues = active.map((c) => c.weight);
  const sliderLabels = active.map((c) => c.name);
  const sliderColors = active.map((c) => c.color);

  return (
    <div className="p-6 space-y-5 max-w-5xl overflow-y-auto flex-1 scrollbar-thin">
      <Card padding="md">
        <BalanceSlider
          values={sliderValues}
          labels={sliderLabels}
          colors={sliderColors}
          onChange={setCriterionWeights}
        />
      </Card>

      <div className="flex items-center gap-2">
        <h3 className="section-title flex-1">Ngân hàng câu hỏi (Ping Test)</h3>
        <Button variant="primary" onClick={addCriterion}><Plus size={14}/>Thêm tiêu chí</Button>
      </div>

      <PingTestBuilder
        survey={survey}
        isAdmin={true}
        onUpdateCriterion={updateCriterion}
        onDeleteCriterion={deleteCriterion}
        onToggleCriterion={toggleCriterion}
        onReorder={reorderCriteria}
      />
    </div>
  );
}

function RoutingTab() {
  const leads = useScoring((s) => s.leads);
  const routingConfig = useScoring((s) => s.routingConfig);
  const routedLeads = useMemo(() => getRoutedLeads(leads, routingConfig), [leads, routingConfig]);
  const funnelData = useMemo<FunnelData>(() => {
    const pending  = routedLeads.filter((r) => r.routingStatus === "Pending_Audit");
    const ov       = routedLeads.filter((r) => r.routingStatus === "Qualified_For_Audit");

    // Group pending leads by rep
    const repMap = new Map<string, number>();
    for (const r of pending) {
      const name = r.lead.assignedTo;
      if (!name || name === "—") continue;
      repMap.set(name, (repMap.get(name) ?? 0) + 1);
    }
    const reps = [...repMap.entries()].map(([name, count]) => ({ name, count }));

    return {
      total:     leads.length,
      qualified: pending.length + ov.length,
      allocated: pending.length,
      overflow:  ov.length,
      reps,
    };
  }, [leads.length, routedLeads]);

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Merged card: row 1 = Sankey, row 2 = 2-col controls */}
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center gap-2">
            <h3 className="section-title">Phễu lọc lead</h3>
            <Badge intention="neutral" className="bg-success/10 text-success ml-auto text-[10px]">Live</Badge>
          </div>

          {/* Row 1: full-width Sankey diagram */}
          <FunnelChart data={funnelData} />

          <div className="border-t border-line" />

          {/* Row 2: 2-column controls */}
          <div className="grid grid-cols-2 gap-6">
            <AxisAControl />
            <div className="border-l border-line pl-6">
              <QuotaControl />
            </div>
          </div>
        </Card>

        {/* Per-rep lead allocation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="section-title">Phân bổ theo Sales Rep</h3>
            <span className="text-cap-md text-ink-3">· hôm nay</span>
          </div>
          <RepAllocation routedLeads={routedLeads} quota={routingConfig.maxLeadsPerRepPerDay} />
        </div>

        {/* Lead buckets table */}
        <LeadBuckets routedLeads={routedLeads} />

      </div>
    </div>
  );
}

function normalizeWeights(rules: RuleT[]): RuleT[] {
  const total = rules.reduce((a, r) => a + r.weight, 0);
  const scale = total === 0 ? 1 : 100 / total;
  return rules.map((r) => ({ ...r, weight: Math.round(r.weight * scale) }));
}
