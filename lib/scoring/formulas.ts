import type { AxisBAnswers, Grade, GradingMatrix, Lead, SurveyConfig } from "./types";

const SECTOR_WALLET: Record<Lead["sector"], number> = {
  Accommodation: 100,
  "F&B": 50,
  Tour: 70,
  Retail: 40,
};

export function socialGravity(rating: number, reviewCount: number) {
  if (reviewCount <= 0) return 0;
  return (rating * 20) * Math.min(1, Math.log10(reviewCount) / 5);
}

export function walletShare(sector: Lead["sector"]) {
  return SECTOR_WALLET[sector];
}

export function ecosystemProximity(distanceKm: number) {
  if (distanceKm < 2) return 100;
  if (distanceKm <= 5) return 50;
  return 0;
}

export function computeAxisADisplay(lead: Lead): number {
  const sg = socialGravity(lead.enrichment.rating, lead.enrichment.reviewCount);
  const ws = walletShare(lead.sector);
  const ep = ecosystemProximity(lead.enrichment.distanceKm);
  const base = 0.5 * sg + 0.4 * ws + 0.1 * ep;
  return round(base + lead.campaignBoost);
}

export function computeAxisAEffective(lead: Lead): number {
  return Math.min(100, computeAxisADisplay(lead));
}

export function computeAxisB(answers: AxisBAnswers | null, cfg: SurveyConfig): number {
  if (!answers) return 0;
  const active = cfg.criteria.filter((c) => c.active);
  const totalWeight = active.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;
  const raw = active.reduce((sum, c) => sum + (c.weight / totalWeight) * (answers[c.id] ?? 0), 0);
  return round(raw);
}

export function gradeFromMatrix(
  axisA: number,
  axisB: number,
  m: GradingMatrix
): Grade {
  const a = bucket(axisA, m.axisAThresholds);
  const b = bucket(axisB, m.axisBThresholds);
  // Hạng cao = trung bình 2 chiều, ưu tiên A khi cả 2 đều cao
  const score = (a + b) / 2;
  if (score >= 3) return "A";
  if (score >= 2) return "B";
  if (score >= 1) return "C";
  return "D";
}

function bucket(value: number, t: [number, number, number]): 0 | 1 | 2 | 3 {
  if (value >= t[2]) return 3;
  if (value >= t[1]) return 2;
  if (value >= t[0]) return 1;
  return 0;
}

export function computeAxisABase(lead: Lead): number {
  const sg = socialGravity(lead.enrichment.rating, lead.enrichment.reviewCount);
  const ws = walletShare(lead.sector);
  const ep = ecosystemProximity(lead.enrichment.distanceKm);
  return Math.min(100, round(0.5 * sg + 0.4 * ws + 0.1 * ep));
}

export function computeLeadScore(axisABase: number, axisB: number): number {
  return round(0.6 * axisABase + 0.4 * axisB);
}

export function computeFinalScore(axisABase: number, axisB: number, sourceBoost: number): number {
  return Math.min(100, round(computeLeadScore(axisABase, axisB) + sourceBoost));
}

export type TierInfo = { tier: string; label: string; sla: string; index: 1 | 2 | 3 | 4 };

export function tierFromFinalScore(finalScore: number): TierInfo {
  if (finalScore >= 85) return { tier: "Tier 1", label: "Strategic Partner", sla: "< 2 giờ", index: 1 };
  if (finalScore >= 70) return { tier: "Tier 2", label: "High Potential",    sla: "< 8 giờ", index: 2 };
  if (finalScore >= 50) return { tier: "Tier 3", label: "Volume",            sla: "< 24 giờ", index: 3 };
  return                       { tier: "Tier 4", label: "Low Priority",      sla: "< 72 giờ", index: 4 };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
