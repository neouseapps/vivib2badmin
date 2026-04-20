import type { Lead } from "@/lib/scoring/types";

const today = new Date("2026-04-17");
function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function sparkline(start: number, end: number): Lead["history"] {
  const out: Lead["history"] = [];
  for (let i = 6; i >= 0; i--) {
    const t = (6 - i) / 6;
    const v = Math.round(start + (end - start) * t + (Math.random() * 6 - 3));
    out.push({ date: daysAgo(i), score: Math.max(0, Math.min(120, v)) });
  }
  return out;
}

export const LEADS: Lead[] = [
  {
    id: "L-001",
    name: "Công ty Cổ phần ABC",
    sector: "Accommodation",
    location: "Đà Nẵng — Mỹ Khê",
    contactStatus: "CONTACTED",
    onboarded: false,
    assignedTo: "Nguyễn Minh",
    enrichment: { rating: 4.6, reviewCount: 1280, sector: "Accommodation", distanceKm: 1.3 },
    campaignBoost: 10,
    axisBAnswers: { "crit-resp": 100, "crit-ful": 70, "crit-acc": 100, "crit-dem": 50 },
    history: sparkline(62, 82),
    auditLog: [
      { id: "a1", source: "API", axis: "A", description: "Enrichment batch — Social Gravity", delta: +54, actor: "system", at: daysAgo(6) },
      { id: "a2", source: "API", axis: "A", description: "Wallet Share (Accommodation)", delta: +40, actor: "system", at: daysAgo(6) },
      { id: "a3", source: "API", axis: "A", description: "Campaign Boost: Tết 2026", delta: +10, actor: "system", at: daysAgo(3) },
      { id: "a4", source: "CRM", axis: "B", description: "Ping Test bởi Nguyễn Minh", delta: +82, actor: "Nguyễn Minh", at: daysAgo(1) },
    ],
  },
  {
    id: "L-002",
    name: "Nhà hàng Hương Biển",
    sector: "F&B",
    location: "Nha Trang — Trần Phú",
    contactStatus: "ACTIVE",
    onboarded: false,
    assignedTo: "Trần Hoa",
    enrichment: { rating: 4.2, reviewCount: 540, sector: "F&B", distanceKm: 3.4 },
    campaignBoost: 0,
    axisBAnswers: { "crit-resp": 50, "crit-ful": 0, "crit-acc": 50, "crit-dem": 100 },
    history: sparkline(55, 58),
    auditLog: [
      { id: "b1", source: "API", axis: "A", description: "Enrichment", delta: +58, actor: "system", at: daysAgo(6) },
      { id: "b2", source: "CRM", axis: "B", description: "Ping Test", delta: +50, actor: "Trần Hoa", at: daysAgo(2) },
    ],
  },
  {
    id: "L-003",
    name: "Tour Cát Bà Adventure",
    sector: "Tour",
    location: "Hải Phòng — Cát Bà",
    contactStatus: "COLD",
    onboarded: false,
    assignedTo: "—",
    enrichment: { rating: 4.8, reviewCount: 240, sector: "Tour", distanceKm: 6.2 },
    campaignBoost: 0,
    axisBAnswers: null,
    history: sparkline(48, 46),
    auditLog: [
      { id: "c1", source: "API", axis: "A", description: "Enrichment", delta: +46, actor: "system", at: daysAgo(5) },
    ],
  },
  {
    id: "L-004",
    name: "Khách sạn Sunrise Villa",
    sector: "Accommodation",
    location: "Phú Quốc — Bãi Trường",
    contactStatus: "ACTIVE",
    onboarded: true,
    assignedTo: "Lê Dũng",
    enrichment: { rating: 4.9, reviewCount: 3200, sector: "Accommodation", distanceKm: 0.5 },
    campaignBoost: 15,
    axisBAnswers: { "crit-resp": 100, "crit-ful": 100, "crit-acc": 100, "crit-dem": 100 },
    history: sparkline(70, 95),
    auditLog: [
      { id: "d1", source: "API", axis: "A", description: "Onboarding completed — điểm đã chốt", delta: 0, actor: "system", at: daysAgo(1) },
    ],
  },
  {
    id: "L-005",
    name: "Tiệm cà phê Ocean",
    sector: "F&B",
    location: "Vũng Tàu",
    contactStatus: "CONTACTED",
    onboarded: false,
    assignedTo: "Phạm Hà",
    enrichment: { rating: 4.0, reviewCount: 180, sector: "F&B", distanceKm: 4.2 },
    campaignBoost: 0,
    axisBAnswers: { "crit-resp": 50, "crit-ful": 70, "crit-acc": 50, "crit-dem": 50 },
    history: sparkline(40, 44),
    auditLog: [
      { id: "e1", source: "API", axis: "A", description: "Enrichment", delta: +44, actor: "system", at: daysAgo(4) },
      { id: "e2", source: "CRM", axis: "B", description: "Ping Test", delta: +55, actor: "Phạm Hà", at: daysAgo(1) },
    ],
  },
  {
    id: "L-006",
    name: "Cửa hàng Lụa Hội An",
    sector: "Retail",
    location: "Hội An",
    contactStatus: "CONTACTED",
    onboarded: false,
    assignedTo: "Ngô Thảo",
    enrichment: { rating: 4.5, reviewCount: 620, sector: "Retail", distanceKm: 2.1 },
    campaignBoost: 5,
    axisBAnswers: null,
    history: sparkline(35, 52),
    auditLog: [
      { id: "f1", source: "API", axis: "A", description: "Enrichment", delta: +47, actor: "system", at: daysAgo(32) },
      { id: "f2", source: "API", axis: "A", description: "Campaign Boost", delta: +5, actor: "system", at: daysAgo(3) },
    ],
  },
  {
    id: "L-007",
    name: "Resort Mây Xanh",
    sector: "Accommodation",
    location: "Sapa",
    contactStatus: "ACTIVE",
    onboarded: false,
    assignedTo: "Vũ Thanh",
    enrichment: { rating: 4.7, reviewCount: 890, sector: "Accommodation", distanceKm: 1.8 },
    campaignBoost: 0,
    axisBAnswers: { "crit-resp": 100, "crit-ful": 100, "crit-acc": 50, "crit-dem": 100 },
    history: sparkline(65, 78),
    auditLog: [
      { id: "g1", source: "API", axis: "A", description: "Enrichment", delta: +78, actor: "system", at: daysAgo(6) },
      { id: "g2", source: "CRM", axis: "B", description: "Ping Test", delta: +88, actor: "Vũ Thanh", at: daysAgo(2) },
    ],
  },
  {
    id: "L-008",
    name: "Tour Mekong Express",
    sector: "Tour",
    location: "Cần Thơ",
    contactStatus: "COLD",
    onboarded: false,
    assignedTo: "—",
    enrichment: { rating: 3.8, reviewCount: 90, sector: "Tour", distanceKm: 8.0 },
    campaignBoost: 0,
    axisBAnswers: null,
    history: sparkline(28, 32),
    auditLog: [
      { id: "h1", source: "API", axis: "A", description: "Enrichment", delta: +32, actor: "system", at: daysAgo(7) },
    ],
  },
];
