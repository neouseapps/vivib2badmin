import type { GradingMatrix, ResourceNode, RuleBlock, SurveyConfig } from "@/lib/scoring/types";

export const DEFAULT_RULES: RuleBlock[] = [
  {
    id: "r1",
    name: "Social Gravity",
    field: "lead.enrichment.rating",
    operator: ">=",
    value: "4.0",
    weight: 50,
    active: true,
    source: "API",
    conditions: [
      { id: "c1-1", negate: false, field: "lead.enrichment.rating", operator: "gte", value: "4.0" },
      { id: "c1-2", negate: false, field: "lead.enrichment.reviewCount", operator: "gte", value: "50" },
    ],
    conditionConnector: "AND",
    conditionMode: "visual",
    conditionCode: "lead.enrichment.rating >= 4.0 AND lead.enrichment.reviewCount >= 50",
    formula: "socialGravity(@lead.enrichment.rating, @lead.enrichment.reviewCount)",
    minScore: 0,
    maxScore: 100,
  },
  {
    id: "r2",
    name: "Wallet Share (Sector)",
    field: "lead.profile.sector",
    operator: "=",
    value: "Accommodation",
    weight: 40,
    active: true,
    source: "API",
    conditions: [
      { id: "c2-1", negate: false, field: "lead.profile.sector", operator: "is_in_list", value: "Accommodation,F&B,Tour" },
    ],
    conditionConnector: "AND",
    conditionMode: "visual",
    conditionCode: 'lead.profile.sector IN ["Accommodation", "F&B", "Tour"]',
    formula: 'MAP_VALUE(@lead.profile.sector, {"Accommodation": 100, "F&B": 50, "Tour": 70, "Retail": 40})',
    minScore: 0,
    maxScore: 100,
  },
  {
    id: "r3",
    name: "Ecosystem Proximity",
    field: "lead.enrichment.distanceKm",
    operator: "<",
    value: "5",
    weight: 10,
    active: true,
    source: "API",
    conditions: [
      { id: "c3-1", negate: false, field: "lead.enrichment.distanceKm", operator: "lt", value: "10" },
    ],
    conditionConnector: "AND",
    conditionMode: "visual",
    conditionCode: "lead.enrichment.distanceKm < 10",
    formula: "IF(@lead.enrichment.distanceKm < 2, 100, IF(@lead.enrichment.distanceKm <= 5, 50, 0))",
    minScore: 0,
    maxScore: 100,
  },
];

export const DEFAULT_SURVEY: SurveyConfig = {
  criteria: [
    {
      id: "crit-resp",
      name: "Responsiveness",
      help: "Ghi nhận tốc độ phản hồi của đối tác khi được liên hệ.",
      options: [
        { id: "o-r1", label: "Phản hồi ngay", achievement: 100 },
        { id: "o-r2", label: "Trong ngày", achievement: 50 },
        { id: "o-r3", label: "Không phản hồi", achievement: 0 },
      ],
      weight: 30,
      active: true,
      color: "#135b96",
      order: 0,
    },
    {
      id: "crit-ful",
      name: "Fulfillment Operations",
      help: "Quan sát công cụ quản lý họ đang dùng (PMS, excel, sổ sách).",
      options: [
        { id: "o-f1", label: "Có PMS / phần mềm", achievement: 100 },
        { id: "o-f2", label: "Chủ tự quản lý", achievement: 67 },
        { id: "o-f3", label: "Thủ công", achievement: 0 },
      ],
      weight: 30,
      active: true,
      color: "#19674f",
      order: 1,
    },
    {
      id: "crit-acc",
      name: "Access",
      help: "Xác định vai trò quyết định của người bạn đang trao đổi.",
      options: [
        { id: "o-a1", label: "Owner / Director", achievement: 100 },
        { id: "o-a2", label: "Manager", achievement: 50 },
        { id: "o-a3", label: "Nhân viên", achievement: 0 },
      ],
      weight: 20,
      active: true,
      color: "#7d3c98",
      order: 2,
    },
    {
      id: "crit-dem",
      name: "Demand Velocity",
      help: "Dựa trên quan sát tại cơ sở hoặc đánh giá của chủ đối tác.",
      options: [
        { id: "o-d1", label: "Rất đông khách", achievement: 100 },
        { id: "o-d2", label: "Ổn định", achievement: 50 },
        { id: "o-d3", label: "Vắng khách", achievement: 0 },
      ],
      weight: 20,
      active: true,
      color: "#d65800",
      order: 3,
    },
  ],
};

export const DEFAULT_MATRIX: GradingMatrix = {
  axisAThresholds: [40, 60, 80],
  axisBThresholds: [40, 60, 80],
};

export const RESOURCES = [
  {
    group: "Lead Data",
    items: [
      { key: "lead.enrichment.rating", label: "Rating", type: "number" },
      { key: "lead.enrichment.reviewCount", label: "Review Count", type: "number" },
      { key: "lead.profile.sector", label: "Sector", type: "enum" },
      { key: "lead.enrichment.distanceKm", label: "Distance (km)", type: "number" },
      { key: "lead.profile.name", label: "Name", type: "string" },
      { key: "lead.location", label: "Location", type: "string" },
      { key: "lead.contactStatus", label: "Contact Status", type: "enum" },
    ],
  },
  {
    group: "Behavior",
    items: [
      { key: "behavior.emailOpen", label: "Email Opened", type: "boolean" },
      { key: "behavior.clickLink", label: "Clicked Link", type: "boolean" },
      { key: "behavior.visits", label: "Site Visits", type: "number" },
    ],
  },
  {
    group: "Signals",
    items: [
      { key: "lead.signals.google.primary_type", label: "Google Primary Type", type: "string" },
      { key: "lead.signals.google.price_level", label: "Google Price Level", type: "number" },
    ],
  },
  {
    group: "Custom",
    items: [
      { key: "custom.campaign", label: "Campaign Tag", type: "string" },
    ],
  },
];

export const LEAD_TREE: ResourceNode[] = [
  {
    key: "lead",
    label: "lead",
    type: "dictionary",
    readonly: true,
    children: [
      {
        key: "lead.profile",
        label: "profile",
        type: "dictionary",
        children: [
          { key: "lead.profile.name", label: "name", type: "string" },
          { key: "lead.profile.sector", label: "sector", type: "enum" },
        ],
      },
      {
        key: "lead.enrichment",
        label: "enrichment",
        type: "dictionary",
        children: [
          { key: "lead.enrichment.rating", label: "rating", type: "number" },
          { key: "lead.enrichment.reviewCount", label: "reviewCount", type: "number" },
          { key: "lead.enrichment.distanceKm", label: "distanceKm", type: "number" },
        ],
      },
      {
        key: "lead.signals",
        label: "signals",
        type: "dictionary",
        children: [
          {
            key: "lead.signals.google",
            label: "google",
            type: "dictionary",
            children: [
              { key: "lead.signals.google.primary_type", label: "primary_type", type: "string" },
              { key: "lead.signals.google.price_level", label: "price_level", type: "number" },
              { key: "lead.signals.google.user_ratings_total", label: "user_ratings_total", type: "number" },
            ],
          },
        ],
      },
      { key: "lead.location", label: "location", type: "string" },
      { key: "lead.contactStatus", label: "contactStatus", type: "enum" },
      { key: "lead.onboarded", label: "onboarded", type: "boolean" },
      { key: "lead.campaignBoost", label: "campaignBoost", type: "number" },
    ],
  },
  {
    key: "behavior",
    label: "behavior",
    type: "dictionary",
    readonly: true,
    children: [
      { key: "behavior.emailOpen", label: "emailOpen", type: "boolean" },
      { key: "behavior.clickLink", label: "clickLink", type: "boolean" },
      { key: "behavior.visits", label: "visits", type: "number" },
    ],
  },
];

// ── Shared group-color palette (used by ResourceManager + FormulaInput) ───────
export const GROUP_COLORS = ["#135b96", "#19674f", "#d65800", "#7d3c98", "#c8a53a", "#0986ec", "#c0392b"];

function buildGroupsFlat(nodes: ResourceNode[]): { keys: string[] }[] {
  const groups: { keys: string[] }[] = [];
  function collectLeafKeys(node: ResourceNode, keys: string[]) {
    if (node.type !== "dictionary" && node.type !== "array") keys.push(node.key);
    node.children?.forEach((c) => collectLeafKeys(c, keys));
  }
  for (const top of nodes) {
    const hasDictChild = top.children?.some((c) => c.type === "dictionary" || c.type === "array");
    if (hasDictChild) {
      const plainKeys: string[] = [];
      for (const child of top.children ?? []) {
        if (child.type === "dictionary" || child.type === "array") {
          const keys: string[] = [];
          child.children?.forEach((l) => collectLeafKeys(l, keys));
          if (keys.length) groups.push({ keys });
        } else {
          plainKeys.push(child.key);
        }
      }
      if (plainKeys.length) groups.push({ keys: plainKeys });
    } else {
      const keys: string[] = [];
      top.children?.forEach((l) => collectLeafKeys(l, keys));
      if (keys.length) groups.push({ keys });
    }
  }
  return groups;
}

/** Maps every leaf field key → its group color (same as ResourceManager dots) */
export const VAR_COLOR_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  buildGroupsFlat(LEAD_TREE).forEach((g, gi) => {
    const color = GROUP_COLORS[gi % GROUP_COLORS.length];
    g.keys.forEach((k) => { map[k] = color; });
  });
  return map;
})();
