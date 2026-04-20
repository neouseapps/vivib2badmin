export type ContactStatus = "COLD" | "CONTACTED" | "ACTIVE";
export type Grade = "A" | "B" | "C" | "D";

export interface LeadEnrichment {
  rating: number;
  reviewCount: number;
  sector: "Accommodation" | "F&B" | "Tour" | "Retail";
  distanceKm: number;
}

export type AxisBAnswers = Record<string, number>;

export interface AuditEntry {
  id: string;
  source: "API" | "CRM";
  axis: "A" | "B";
  description: string;
  delta: number;
  actor: string;
  at: string;
}

export interface Lead {
  id: string;
  name: string;
  sector: LeadEnrichment["sector"];
  location: string;
  contactStatus: ContactStatus;
  onboarded: boolean;
  assignedTo: string;
  enrichment: LeadEnrichment;
  campaignBoost: number;
  axisBAnswers: AxisBAnswers | null;
  history: { date: string; score: number }[];
  auditLog: AuditEntry[];
}

// ─── Rule Engine ───────────────────────────────────────────────────────────────

export type LogicalConnector = "AND" | "OR" | "XOR";

export type ConditionOperator =
  | "exists" | "not_exists"
  | "equals" | "not_equals"
  | "contains" | "not_contains"
  | "is_in_list" | "not_in_list"
  | "gt" | "lt" | "gte" | "lte";

export interface ConditionRow {
  id: string;
  connector?: LogicalConnector; // connector to previous sibling (undefined for first item)
  negate: boolean;
  field: string;
  operator: ConditionOperator;
  value: string;
}

export interface ConditionSubGroup {
  id: string;
  connector?: LogicalConnector; // connector to previous sibling
  rows: ConditionRow[];
}

export type ConditionItem = ConditionRow | ConditionSubGroup;

export function isSubGroup(item: ConditionItem): item is ConditionSubGroup {
  return "rows" in item;
}

export interface RuleBlock {
  id: string;
  name: string;
  // Legacy fields (used by formula engine)
  field: string;
  operator: "=" | "!=" | ">" | ">=" | "<" | "<=" | "contains";
  value: string;
  weight: number;
  active: boolean;
  source: "API";
  // Part A — Condition
  conditions: ConditionItem[];
  conditionConnector: LogicalConnector;
  conditionMode: "visual" | "code";
  conditionCode: string;
  // Part B — Formula
  formula: string;
  // Part C — Constraint
  minScore: number;
  maxScore: number;
}

// ─── Resource Manager ─────────────────────────────────────────────────────────

export type VarType = "array" | "dictionary";

export interface ResourceNode {
  key: string;
  label: string;
  type: "number" | "string" | "boolean" | "enum" | "dictionary" | "array";
  children?: ResourceNode[];
  readonly?: boolean;
}

export interface CustomVariable {
  id: string;
  name: string;
  varType: VarType;
  // For demo: array = string[], dictionary = key-value pairs
  arrayData: string[];
  dictData: { key: string; value: string }[];
}

export interface SurveyOption {
  id: string;
  label: string;
  achievement: number;
}

export interface SurveyCriterion {
  id: string;
  name: string;
  help: string;
  options: SurveyOption[];
  weight: number;
  active: boolean;
  color: string;
  order: number;
}

export interface SurveyConfig {
  criteria: SurveyCriterion[];
}

export interface GradingMatrix {
  axisAThresholds: [number, number, number];
  axisBThresholds: [number, number, number];
}

// ─── Routing ──────────────────────────────────────────────────────────────────

export type RoutingStatus =
  | "Qualified_For_Audit"  // axisAEff >= threshold, vượt quota hôm nay
  | "Pending_Audit"        // axisAEff >= threshold, trong hạn mức hôm nay
  | "Marketing_Nurture";   // axisAEff < threshold — bypass Sales

export interface RoutingConfig {
  minScoreA: number;             // default 60
  maxLeadsPerRepPerDay: number;  // default 30
}

export interface RoutedLead {
  lead: Lead;
  axisAEff: number;
  routingStatus: RoutingStatus;
}

// ─── Version Control ──────────────────────────────────────────────────────────

export type VersionStatus = "active" | "old";

export interface ConfigSnapshot {
  rules: RuleBlock[];
  survey: SurveyConfig;
  matrix: GradingMatrix;
  routingConfig: RoutingConfig;
  customVariables: CustomVariable[];
}

export interface VersionRecord {
  id: string;
  major: number;
  minor: number;
  publishedAt: string;
  publishedBy: string;
  changeNote: string;
  status: VersionStatus;
  snapshot: ConfigSnapshot;
  affectedLeadsCount: number;
}

// ─── Call Guide ───────────────────────────────────────────────────────────────

export interface CallGuideQuestion {
  id: string;
  text: string;
  hint?: string;
  axisBCriterionId?: string;
  order: number;
}

export interface CallGuideSet {
  id: string;
  name: string;
  sector: "Accommodation" | "F&B" | "Tour" | "Retail";
  questions: CallGuideQuestion[];
  active: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  partner: string;
  email: string;
  phone: string;
  permission: "Admin" | "Viewer" | "Editor";
  source: "Hợp đồng" | "Tự đăng ký" | "Mời";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type BatchJobStatus = "idle" | "running" | "done";

export interface BatchJobState {
  status: BatchJobStatus;
  progress: number;
  versionId: string | null;
  startedAt: string | null;
  estimatedMs: number;
}
