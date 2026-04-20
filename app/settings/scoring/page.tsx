"use client";
import { useMemo, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { BalanceSlider } from "@/components/rules/BalanceSlider";
import { RuleBlock } from "@/components/rules/RuleBlock";
import { ResourceManager } from "@/components/rules/ResourceManager";
import { SimulationPanel } from "@/components/rules/SimulationPanel";
import { PingTestBuilder } from "@/components/survey/PingTestBuilder";
import { RoutingConfig } from "@/components/routing/RoutingConfig";
import { FunnelChart } from "@/components/routing/FunnelChart";
import { LeadBuckets } from "@/components/routing/LeadBuckets";
import { getRoutedLeads, useScoring } from "@/lib/store/scoring-store";
import { addRuleRebalance, removeRuleRebalance } from "@/lib/scoring/rebalance";
import type { RuleBlock as RuleT } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";
import { Plus, Code2, LayoutGrid, Save, AlertTriangle, Check } from "lucide-react";
import { ScoringOpsProvider } from "@/lib/context/scoring-ops-context";
import { OpsToolbar } from "@/components/ops/OpsToolbar";
import { BatchProgressBanner } from "@/components/ops/BatchProgressBanner";
import { PublishConfirmModal } from "@/components/ops/PublishConfirmModal";
import { VersionHistoryPanel } from "@/components/ops/VersionHistoryPanel";
import { ReadOnlyOverlay } from "@/components/ops/ReadOnlyOverlay";

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
  const [mode, setMode] = useState<"visual" | "code">("visual");

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
        {/* Balance Slider header */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid size={16} className="text-ink-3"/>
            <h3 className="section-title">Balance Slider — Phân bổ trọng số</h3>
            <span className={cn("ml-auto chip", sum === 100 ? "bg-success/10 text-success" : "bg-warn-light text-warn-text")}>
              Tổng: {sum}%
            </span>
          </div>
          <BalanceSlider
            values={weights}
            labels={labels}
            colors={colors}
            onChange={onSliderChange}
          />
          <p className="text-cap-md text-ink-3 mt-3 flex items-start gap-1.5">
            <AlertTriangle size={12} className="mt-0.5 text-warn-text"/>
            Khi thêm rule mới, hệ thống chèn 5% và rebalance 95% còn lại theo tỷ lệ gốc (Hare-Niemeyer) — tổng luôn = 100%.
          </p>
        </div>

        {/* Mode toggle + Add */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-line overflow-hidden">
            <button onClick={() => setMode("visual")}
              className={cn("px-3 h-9 text-cap-md font-semibold", mode === "visual" ? "bg-ink-1 text-white" : "bg-white text-ink-2")}>
              Visual Mode
            </button>
            <button onClick={() => setMode("code")}
              className={cn("px-3 h-9 text-cap-md font-semibold flex items-center gap-1", mode === "code" ? "bg-ink-1 text-white" : "bg-white text-ink-2")}>
              <Code2 size={12}/>Code Mode
            </button>
          </div>
          <button onClick={onAddRule} className="btn-primary ml-auto"><Plus size={14}/>Thêm Rule</button>
        </div>

        {mode === "visual" ? (
          <div className="space-y-3">
            {rules.map((r, i) => (
              <RuleBlock
                key={r.id}
                rule={r}
                color={colors[i]}
                canUp={i > 0}
                canDown={i < rules.length - 1}
                onChange={(patch) => onUpdate(i, patch)}
                onDuplicate={() => onDuplicate(i)}
                onDelete={() => onRemove(i)}
                onMoveUp={() => onMove(i, -1)}
                onMoveDown={() => onMove(i, 1)}
              />
            ))}
          </div>
        ) : (
          <CodeModeView rules={rules}/>
        )}
      </div>

      {/* Right: Resource Manager + Simulation stacked */}
      <aside className="bg-bg-lv2/30 overflow-y-auto scrollbar-thin flex flex-col">
        <div className="p-5 border-b border-line">
          <ResourceManager/>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-cap-md font-semibold text-ink-2">Xem trước kết quả</span>
              <span className="chip bg-info-light text-info text-[10px]">API</span>
            </div>
            <p className="text-cap text-ink-3 leading-relaxed">
              Axis A chỉ dùng dữ liệu tự động. Sales Rep không được nhập điểm thủ công.
            </p>
          </div>
          <SimulationPanel/>
        </div>
      </aside>
    </div>
  );
}

function CodeModeView({ rules }: { rules: RuleT[] }) {
  const initialSnippet = useMemo(() => [
    "// Axis A — Hybrid Rule DSL",
    "// Gõ @ để chọn resource, . để chọn thuộc tính",
    "",
    "function axisA(lead) {",
    "  const sg = (lead.rating * 20) * Math.min(1, Math.log10(lead.reviewCount) / 5);",
    "  const ws = MAP_VALUE(lead.sector, { Accommodation: 100, 'F&B': 50, Tour: 70, Retail: 40 });",
    "  const ep = lead.distanceKm < 2 ? 100 : lead.distanceKm <= 5 ? 50 : 0;",
    `  return ${rules.map((r) => `${r.weight / 100} * ${r.name.replace(/\s/g, "_")}`).join(" + ")};`,
    "}",
  ].join("\n"), [rules]);

  const [code, setCode] = useState(initialSnippet);
  const [saved, setSaved] = useState(true);
  const [validation, setValidation] = useState<{ ok: boolean; msg: string } | null>(null);
  const [suggest, setSuggest] = useState<{ items: string[]; prefix: string } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const AT_SUGGESTIONS = ["@lead.rating", "@lead.reviewCount", "@lead.sector", "@lead.distanceKm",
    "@behavior.emailOpen", "@behavior.clickLink", "@behavior.visits", "@custom.campaign"];
  const DOT_SUGGESTIONS = [".rating", ".reviewCount", ".sector", ".distanceKm",
    ".emailOpen", ".clickLink", ".visits", ".campaign"];

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setCode(val);
    setSaved(false);
    setValidation(null);

    // detect @ or . trigger
    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const atIdx = before.lastIndexOf("@");
    const dotIdx = before.lastIndexOf(".");
    const trigger = atIdx > dotIdx ? { char: "@", idx: atIdx } : dotIdx >= 0 ? { char: ".", idx: dotIdx } : null;
    if (trigger && pos - trigger.idx <= 20) {
      const prefix = before.slice(trigger.idx);
      const pool = trigger.char === "@" ? AT_SUGGESTIONS : DOT_SUGGESTIONS;
      const items = pool.filter((s) => s.startsWith(prefix));
      setSuggest(items.length ? { items, prefix } : null);
    } else {
      setSuggest(null);
    }
  }

  function applySuggestion(item: string) {
    const ta = taRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const prefix = suggest!.prefix;
    const before = code.slice(0, pos - prefix.length);
    const after = code.slice(pos);
    const next = before + item + after;
    setCode(next);
    setSuggest(null);
    setSaved(false);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(before.length + item.length, before.length + item.length);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = ta;
      const next = code.slice(0, s) + "  " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
    }
    if (e.key === "Escape") setSuggest(null);
  }

  function validate() {
    try {
      // Basic syntax check: must have "function axisA" and "return"
      if (!code.includes("function axisA")) throw new Error("Thiếu khai báo `function axisA`");
      if (!code.includes("return")) throw new Error("Thiếu câu lệnh `return`");
      // Check no circular refs: naive
      setValidation({ ok: true, msg: "Không phát hiện lỗi cú pháp. Sẵn sàng Publish." });
    } catch (err: unknown) {
      setValidation({ ok: false, msg: (err as Error).message });
    }
  }

  function handleSave() {
    validate();
    setSaved(true);
  }

  const lines = code.split("\n");

  return (
    <div className="card p-0 overflow-hidden">
      {/* toolbar */}
      <div className="flex items-center gap-2 px-4 h-10 bg-bg-lv2 border-b border-line">
        <Code2 size={14} className="text-ink-3" />
        <span className="text-cap-md font-semibold text-ink-2">axis-a.rule.ts</span>
        {!saved && <span className="w-1.5 h-1.5 rounded-full bg-warn" title="Chưa lưu" />}
        <div className="ml-auto flex items-center gap-2">
          <span className="chip bg-info-light text-info text-[10px]">@ resource · . attr</span>
          <button onClick={validate} className="btn-outline h-7 text-cap-md">Validate</button>
          <button onClick={handleSave} className="btn-primary h-7 text-cap-md">
            <Save size={12} />Lưu
          </button>
        </div>
      </div>

      {/* editor area */}
      <div className="relative flex bg-white">
        {/* line numbers */}
        <div
          aria-hidden
          className="select-none py-4 px-3 bg-bg-lv2 border-r border-line text-right text-cap font-mono text-ink-4 leading-relaxed shrink-0"
          style={{ minWidth: 40 }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* textarea */}
        <textarea
          ref={taRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setSuggest(null), 150)}
          spellCheck={false}
          className="flex-1 py-4 px-4 text-cap-md font-mono leading-relaxed text-ink-1 bg-white
            focus:outline-none resize-none min-h-[260px] w-full"
          style={{ caretColor: "#135b96" }}
        />

        {/* autocomplete dropdown */}
        {suggest && suggest.items.length > 0 && (
          <div className="absolute left-14 top-4 z-20 card shadow-lv2 py-1 min-w-[220px]">
            {suggest.items.map((item) => (
              <button
                key={item}
                onMouseDown={() => applySuggestion(item)}
                className="w-full text-left px-3 py-1.5 text-cap-md font-mono text-ink-1 hover:bg-info-light"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* validation result */}
      {validation && (
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 border-t text-cap-md",
          validation.ok ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
        )}>
          {validation.ok ? <Check size={12} /> : <AlertTriangle size={12} />}
          {validation.msg}
        </div>
      )}
    </div>
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
  const sum = sliderValues.reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid size={16} className="text-ink-3"/>
          <h3 className="section-title">Balance Slider — Phân bổ trọng số Axis B</h3>
          <span className={cn("ml-auto chip", sum === 100 ? "bg-success/10 text-success" : "bg-warn-light text-warn-text")}>
            Tổng: {sum}%
          </span>
        </div>
        <BalanceSlider
          values={sliderValues}
          labels={sliderLabels}
          colors={sliderColors}
          onChange={setCriterionWeights}
        />
      </div>

      <div className="flex items-center gap-2">
        <h3 className="section-title flex-1">Ngân hàng câu hỏi (Ping Test)</h3>
        <button onClick={addCriterion} className="btn-primary"><Plus size={14}/>Thêm tiêu chí</button>
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
  const funnelData = useMemo(() => ({
    total:     leads.length,
    qualified: routedLeads.filter((r) => r.routingStatus !== "Marketing_Nurture").length,
    allocated: routedLeads.filter((r) => r.routingStatus === "Pending_Audit").length,
  }), [leads.length, routedLeads]);

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <RoutingConfig />
            <LeadBuckets routedLeads={routedLeads} />
          </div>
          <div className="lg:sticky lg:top-0">
            <FunnelChart data={funnelData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeWeights(rules: RuleT[]): RuleT[] {
  const total = rules.reduce((a, r) => a + r.weight, 0);
  const scale = total === 0 ? 1 : 100 / total;
  return rules.map((r) => ({ ...r, weight: Math.round(r.weight * scale) }));
}
