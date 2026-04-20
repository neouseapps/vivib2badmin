import type { Lead } from "@/lib/scoring/types";

// ── Deterministic seeded RNG (LCG) ───────────────────────────
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
const rng = makeRng(0xdeadbeef);
const r = rng;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];
const between = (lo: number, hi: number) => lo + r() * (hi - lo);
const int = (lo: number, hi: number) => Math.floor(between(lo, hi + 1));

// ── Vocabulary ───────────────────────────────────────────────
const ACC_PREFIXES  = ["Khách sạn", "Resort", "Villa", "Homestay", "Hotel", "Boutique Hotel"] as const;
const FAB_PREFIXES  = ["Nhà hàng", "Quán", "Café", "Bistro", "Cửa hàng ăn"] as const;
const TOUR_PREFIXES = ["Tour", "Công ty Lữ hành", "Dịch vụ Du lịch", "Lữ hành"] as const;
const RTAIL_PREFIXES = ["Cửa hàng", "Shop", "Tiệm", "Showroom"] as const;

const NAMES = [
  "Biển Xanh","Mây Trắng","Nắng Vàng","Sóng Biển","Gió Mát","Bình Minh","Hoàng Hôn",
  "Ngọc Trai","Cát Vàng","Sao Biển","Phương Nam","Thăng Long","Đại Dương","Kim Cương",
  "Hoa Đào","Trúc Xanh","Sông Hương","Núi Ngọc","Hoa Mai","Thiên Đường","Lam Sơn",
  "Minh Châu","Phù Sa","Hạnh Phúc","Thịnh Vượng","Bắc Phong","Tây Nguyên","Đông Hải",
  "Bạch Tuyết","Phong Lan","Hải Âu","Cát Biển","Rạng Đông","Thu Vàng","Xuân Xanh",
  "Đá Vàng","Đỉnh Cao","Toàn Cầu","An Bình","Mỹ Nhân","Tân Thịnh","Vĩnh Lợi",
  "Gia Phúc","Quốc Hương","Nam Phong","Bảo Long","Hương Giang","Cửu Long","Bến Thành",
  "Tràng An","Hoà Bình","Phú Hưng","Khánh Hội","Hùng Cường","Đăng Khoa","Vạn Lộc",
] as const;

const ADJECTIVES_ACC = [
  "Sunrise", "Oceanview", "Luxury", "Heritage", "Prime", "Classic", "Grand", "Prestige",
  "Elite", "Premium", "Golden", "Royal", "Crystal", "Sapphire", "Coral",
] as const;

const LOCATIONS = [
  "Đà Nẵng — Mỹ Khê","Đà Nẵng — Sơn Trà","Hội An","Hội An — Cẩm Thanh",
  "Nha Trang — Trần Phú","Nha Trang — Vĩnh Hòa","Phú Quốc — Bãi Trường",
  "Phú Quốc — Dương Đông","Sapa","Sapa — Bản Cát Cát","Vũng Tàu — Bãi Sau",
  "Vũng Tàu — Bãi Trước","Cần Thơ — Ninh Kiều","Hà Nội — Hoàn Kiếm",
  "Hà Nội — Tây Hồ","TP.HCM — Quận 1","TP.HCM — Bình Thạnh",
  "Huế — Phú Xuân","Mũi Né","Đà Lạt — Phường 1","Đà Lạt — Tà Nung",
  "Hạ Long — Bãi Cháy","Ninh Bình — Tràng An","Quy Nhơn","Buôn Ma Thuột",
  "Cát Bà","Cát Bà — Trung Tâm","Lý Sơn","Côn Đảo","Phong Nha — Kẻ Bàng",
] as const;

const REPS = [
  "Nguyễn Minh","Trần Hoa","Lê Dũng","Phạm Hà",
  "Ngô Thảo","Vũ Thanh","Hoàng Lan","Đinh Tuấn",
] as const;

const CRITERIA_IDS = ["crit-resp","crit-ful","crit-acc","crit-dem"] as const;
const OPT_VALUES   = [0, 50, 70, 100] as const;

// ── Score tiers ───────────────────────────────────────────────
// Formula: axisA ≈ 0.5*sg + 0.4*wallet + 0.1*proximity + boost
// We engineer 4 tiers so ~60% of leads score ≥60 at minScoreA=60
type Tier = { rating: [number,number]; reviews: [number,number]; km: [number,number]; pct: number };
const TIERS: Tier[] = [
  { rating:[4.5,5.0], reviews:[1500,6000], km:[0.4,2.0],  pct:0.28 }, // high scorers
  { rating:[4.0,4.6], reviews:[400, 2000], km:[1.0,5.0],  pct:0.38 }, // medium-high
  { rating:[3.5,4.1], reviews:[100, 500],  km:[3.0,10.0], pct:0.22 }, // medium-low
  { rating:[2.5,3.6], reviews:[40,  200],  km:[7.0,18.0], pct:0.12 }, // low
];

function pickTier(): Tier {
  const p = r();
  let acc = 0;
  for (const t of TIERS) { acc += t.pct; if (p < acc) return t; }
  return TIERS[TIERS.length - 1];
}

const SECTORS = ["Accommodation","F&B","Tour","Retail"] as const;
const SECTOR_WEIGHTS = [0.40, 0.30, 0.18, 0.12] as const;
function pickSector(): Lead["sector"] {
  const p = r();
  let acc = 0;
  for (let i = 0; i < SECTORS.length; i++) {
    acc += SECTOR_WEIGHTS[i];
    if (p < acc) return SECTORS[i];
  }
  return "Retail";
}

function buildName(sector: Lead["sector"]): string {
  switch (sector) {
    case "Accommodation": return `${pick(ACC_PREFIXES)} ${pick(r() < 0.5 ? NAMES : ADJECTIVES_ACC)}`;
    case "F&B":           return `${pick(FAB_PREFIXES)} ${pick(NAMES)}`;
    case "Tour":          return `${pick(TOUR_PREFIXES)} ${pick(NAMES)}`;
    case "Retail":        return `${pick(RTAIL_PREFIXES)} ${pick(NAMES)}`;
  }
}

const today = new Date("2026-04-17");
function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function genHistory(hi: number): Lead["history"] {
  const out: Lead["history"] = [];
  for (let i = 6; i >= 0; i--) {
    const t = (6 - i) / 6;
    const base = hi * 0.6 + hi * 0.4 * t;
    const jitter = (r() - 0.5) * 8;
    out.push({ date: daysAgo(i), score: Math.max(0, Math.min(120, Math.round(base + jitter))) });
  }
  return out;
}

function genAxisB(): Lead["axisBAnswers"] {
  if (r() < 0.38) return null; // ~38% not pinged yet
  return Object.fromEntries(CRITERIA_IDS.map(id => [id, pick(OPT_VALUES)]));
}

// ── Generator ─────────────────────────────────────────────────
const N = 500;

export const LEADS: Lead[] = Array.from({ length: N }, (_, i) => {
  const id = `L-${String(i + 1).padStart(3, "0")}`;
  const sector = pickSector();
  const tier = pickTier();

  const rating   = Math.round(between(...tier.rating) * 10) / 10;
  const reviews  = int(...tier.reviews);
  const distKm   = Math.round(between(...tier.km) * 10) / 10;
  const boost    = r() < 0.25 ? int(5, 20) : 0;  // 25% have campaign boost

  // ~8% unassigned
  const assignedTo = r() < 0.08 ? "—" : pick(REPS);

  // ~7% already onboarded
  const onboarded = r() < 0.07;

  const contactStatus = (["COLD","CONTACTED","ACTIVE"] as const)[
    r() < 0.35 ? 0 : r() < 0.6 ? 1 : 2
  ];

  const name = buildName(sector);

  // Estimated Axis A for sparkline center (rough, not exact formula)
  const sg = (rating * 20) * Math.min(1, Math.log10(Math.max(reviews, 1)) / 5);
  const ws = sector === "Accommodation" ? 100 : sector === "Tour" ? 70 : sector === "F&B" ? 50 : 40;
  const ep = distKm < 2 ? 100 : distKm <= 5 ? 50 : 0;
  const estAxisA = Math.min(100, Math.round(0.5 * sg + 0.4 * ws + 0.1 * ep + boost));

  return {
    id,
    name,
    sector,
    location: pick(LOCATIONS),
    contactStatus,
    onboarded,
    assignedTo,
    enrichment: { rating, reviewCount: reviews, sector, distanceKm: distKm },
    campaignBoost: boost,
    axisBAnswers: genAxisB(),
    history: genHistory(estAxisA),
    auditLog: [
      {
        id: `${id}-a1`,
        source: "API" as const,
        axis: "A" as const,
        description: "Enrichment batch",
        delta: estAxisA - boost,
        actor: "system",
        at: daysAgo(int(3, 14)),
      },
      ...(boost > 0 ? [{
        id: `${id}-a2`,
        source: "API" as const,
        axis: "A" as const,
        description: `Campaign Boost`,
        delta: boost,
        actor: "system",
        at: daysAgo(int(1, 5)),
      }] : []),
    ],
  };
});
