import type {
  TierLevel,
  TierTrack,
  SystemChecklist,
  FacilityRef,
} from "@/lib/tier-requests/types";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface RoadmapMetric {
  id: string;
  label: string;
  current: number;     // boolean gates: 0 = chưa, 1 = đã kích hoạt
  threshold: number;   // boolean gates: 1
  unit: string;        // boolean gates: ""
  passed: boolean;
  kind?: "numeric" | "boolean" | "streak"; // default "numeric"
}

export interface QuickVerifyField {
  id: string;
  label: string;
  value: string;
}

export interface FacilityTierState {
  facilityId: string;
  tier: TierLevel;
  tierName: string;
  track: TierTrack | null;
  expiresAt: string | null;
  freshnessDaysStale: number;
  completeness: SystemChecklist;
  missingFields: Record<string, string[]>;
  roadmap: RoadmapMetric[];
  quickVerifyFields: QuickVerifyField[];
  syncDisabledReason?: string;
  // 3-track breakdown
  period_tier: TierLevel;
  synchronized_tier: TierLevel | null;
  synchronized_tier_source: string | null;
  synchronized_tier_expiry: string | null;
  complimentary_tier: TierLevel | null;
  complimentary_tier_expiry: string | null;
  // CTA gates
  tier_readiness_status: "not_ready" | "up_rank_ready";
  tier_status: "active" | "grace_period";
  grace_period_expiry: string | null;
}

// ─── Partner Facilities ───────────────────────────────────────────────────────

const f = (
  id: string,
  name: string,
  tier: TierLevel,
  vertical: FacilityRef["vertical"],
  location: string,
  dataScore: number,
  serviceScore: number,
): FacilityRef => ({
  id,
  name,
  currentTier: tier,
  vertical,
  partner: "Tập đoàn Mặt Trời",
  location,
  dataScore,
  serviceScore,
});

export const PARTNER_FACILITIES: FacilityRef[] = [
  f("pf-001", "Mặt Trời Resort Đà Nẵng",      2, "Accommodation", "Đà Nẵng",          75, 80),
  f("pf-002", "Mặt Trời Boutique Hội An",      2, "Accommodation", "Hội An, Quảng Nam", 74, 78),
  f("pf-003", "Mặt Trời Beach Club Mỹ Khê",    0, "F&B",           "Đà Nẵng",          35, 44),
  f("pf-004", "Mặt Trời Heritage Tours",       3, "Tour",          "Hội An, Quảng Nam", 90, 93),
  f("pf-005", "Mặt Trời Dining & Events",      1, "F&B",           "Đà Nẵng",          55, 60),
  f("pf-006", "Mặt Trời Boutique Retail",      3, "Retail",        "Đà Nẵng",          68, 72),
  f("pf-007", "Mặt Trời City Hotel Hà Nội",    1, "Accommodation", "Hà Nội",           74, 78),
  f("pf-008", "Mặt Trời Eco Resort Phú Quốc",  2, "Accommodation", "Phú Quốc",         86, 90),
];

// ─── Freshness Score logic ────────────────────────────────────────────────────
//
// Time-decay scoring from last verification (last_verified_at reset):
//   0–30 days  → 100 pts  (fresh, no warning)
//   31–60 days → 75 pts   (getting old)
//   61–90 days → 50 pts   (needs re-verification soon)
//   91+ days   → 0 pts    (stale — needs immediate verification)
//
// Banner thresholds:
//   Day 20 → blue info banner
//   Day 61 → amber warning banner
//   Day 80 → amber pre-urgent banner (critical alert)
//   Day 91 → red urgent banner (score = 0)

export function getFreshnessScore(daysStale: number): number {
  if (daysStale <= 30) return 100;
  if (daysStale <= 60) return 75;
  if (daysStale <= 90) return 50;
  return 0;
}

// ─── Base date ────────────────────────────────────────────────────────────────

const BASE = 1776765600000; // 2026-04-21T10:00:00Z
const d = (offsetHours: number) => new Date(BASE + offsetHours * 3_600_000).toISOString();

// ─── Per-facility tier states ─────────────────────────────────────────────────

export const FACILITY_TIER_DATA: Record<string, FacilityTierState> = {
  "pf-001": {
    facilityId: "pf-001",
    tier: 2,
    tierName: "Đối tác Tiêu chuẩn",
    track: "organic",
    expiresAt: null,
    freshnessDaysStale: 92,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 72, threshold: 85, passed: false },
      operations: { id: "operations", label: "Chính sách vận hành", score: 78, threshold: 85, passed: false },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",        score: 55, threshold: 85, passed: false },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",  score: 81, threshold: 85, passed: false },
    },
    missingFields: {
      facilities: [
        "Chưa có thông tin hồ bơi — Cập nhật tiện ích",
        "Phòng họp chưa khai báo diện tích",
        "Thiếu thông tin bãi đỗ xe",
      ],
      operations: [
        "Chính sách huỷ phòng chưa đầy đủ",
        "Giờ check-in / check-out chưa khai báo",
      ],
      gallery: [
        "Cần ít nhất 15 ảnh phòng Standard — hiện có 6",
        "Ảnh nhà hàng chưa đạt độ phân giải tối thiểu (1200px)",
        "Thiếu ảnh mặt tiền ban đêm",
        "Video giới thiệu chưa tải lên",
      ],
      skus: [
        "Gói Trăng Mật chưa khai báo giá — cuối tuần",
        "Thiếu mô tả tiếng Anh cho 3 gói dịch vụ",
      ],
    },
    roadmap: [
      { id: "data-score",    label: "Data Score",                                        kind: "numeric",  current: 75, threshold: 80, unit: "điểm", passed: false },
      { id: "service-score", label: "Service Score",                                     kind: "numeric",  current: 80, threshold: 85, unit: "điểm", passed: false },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",            kind: "numeric",  current: 38, threshold: 50, unit: "lượt",  passed: false },
      { id: "data-contrib",  label: "Đóng góp dữ liệu Cấp 2 (API/đồng bộ tự động)",    kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
      { id: "pay-crypto",    label: "Thanh toán Crypto đã kích hoạt",                    kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
      { id: "direct-book",   label: "Đặt chỗ trực tiếp (Direct Booking) đã kích hoạt", kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true  },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Resort Đà Nẵng" },
      { id: "phone",   label: "Số điện thoại", value: "0236 123 4567" },
      { id: "address", label: "Địa chỉ",       value: "18 Trường Sa, Mỹ Khê, Đà Nẵng" },
      { id: "hours",   label: "Giờ mở cửa",    value: "24/7 — Lễ tân thường trực" },
    ],
    period_tier: 2,
    synchronized_tier: null,
    synchronized_tier_source: null,
    synchronized_tier_expiry: null,
    complimentary_tier: null,
    complimentary_tier_expiry: null,
    tier_readiness_status: "not_ready",
    tier_status: "active",
    grace_period_expiry: null,
  },

  "pf-002": {
    facilityId: "pf-002",
    tier: 2,
    tierName: "Đối tác Tiêu chuẩn",
    track: "sync",
    expiresAt: d(15 * 24),  // expires in 15 days
    freshnessDaysStale: 67,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 58, threshold: 70, passed: false },
      operations: { id: "operations", label: "Chính sách vận hành",        score: 65, threshold: 70, passed: false },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",          score: 42, threshold: 70, passed: false },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",    score: 71, threshold: 70, passed: true  },
    },
    missingFields: {
      facilities: [
        "Chưa khai báo số lượng phòng theo loại",
        "Thiếu thông tin tiện ích chung (lobby, wifi)",
      ],
      operations: [
        "Chính sách thú cưng chưa thiết lập",
      ],
      gallery: [
        "Cần thêm 8 ảnh phòng Deluxe (hiện có 2)",
        "Ảnh hành lang chưa đạt độ sáng tiêu chuẩn",
        "Chưa có ảnh view biển từ ban công",
      ],
      skus: [],
    },
    roadmap: [
      { id: "data-score",    label: "Data Score",                                      kind: "numeric",  current: 74, threshold: 70, unit: "điểm", passed: true  },
      { id: "service-score", label: "Service Score",                                   kind: "numeric",  current: 78, threshold: 75, unit: "điểm", passed: true  },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",          kind: "numeric",  current: 28, threshold: 25, unit: "lượt",  passed: true  },
      { id: "data-contrib",  label: "Đóng góp dữ liệu Cấp 1 (CSV thủ công hàng tháng)", kind: "boolean", current: 1,  threshold: 1,  unit: "",      passed: true  },
      { id: "pay-qr",        label: "Thanh toán QR đã kích hoạt",                     kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true  },
      { id: "pay-intcard",   label: "Thanh toán Thẻ quốc tế đã kích hoạt",            kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true  },
      { id: "streak7d",      label: "Duy trì đủ điều kiện liên tục",                  kind: "streak",   current: 7,  threshold: 7,  unit: "ngày",  passed: true  },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Boutique Hội An" },
      { id: "phone",   label: "Số điện thoại", value: "0235 987 6543" },
      { id: "address", label: "Địa chỉ",       value: "24 Trần Phú, Minh An, Hội An" },
      { id: "hours",   label: "Giờ mở cửa",    value: "08:00 – 22:00 hàng ngày" },
    ],
    period_tier: 1,
    // Spec: source period_tier 3 (pf-004 Heritage Tours) → max sync = 3-1 = 2 ✓
    synchronized_tier: 2,
    synchronized_tier_source: "Mặt Trời Heritage Tours",
    synchronized_tier_expiry: d(15 * 24),
    complimentary_tier: null,
    complimentary_tier_expiry: null,
    tier_readiness_status: "not_ready",
    tier_status: "grace_period",
    grace_period_expiry: d(15 * 24),
  },

  "pf-003": {
    facilityId: "pf-003",
    tier: 0,
    tierName: "Chưa phân hạng",
    track: null,
    expiresAt: null,
    freshnessDaysStale: 25,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 22, threshold: 50, passed: false },
      operations: { id: "operations", label: "Chính sách vận hành",        score: 35, threshold: 50, passed: false },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",          score: 15, threshold: 50, passed: false },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",    score: 40, threshold: 50, passed: false },
    },
    missingFields: {
      facilities: [
        "Chưa khai báo diện tích mặt bằng kinh doanh",
        "Thiếu thông tin chỗ đỗ xe khách",
        "Chưa liệt kê dịch vụ & tiện ích ngoài trời",
      ],
      operations: [
        "Giờ mở cửa chưa được cập nhật",
        "Chính sách đặt bàn chưa thiết lập",
        "Menu giá chưa đầy đủ",
      ],
      gallery: [
        "Cần ít nhất 8 ảnh không gian nội thất (hiện có 1)",
        "Ảnh menu / món ăn chưa tải lên",
        "Thiếu ảnh mặt tiền & bảng hiệu",
        "Chưa có ảnh view bãi biển",
      ],
      skus: [
        "Combo tiệc nhóm (>10 người) chưa khai báo",
        "Gói thuê mặt bằng sự kiện chưa có giá",
      ],
    },
    roadmap: [
      { id: "data-score",    label: "Data Score",                                      kind: "numeric",  current: 35, threshold: 50, unit: "điểm", passed: false },
      { id: "service-score", label: "Service Score",                                   kind: "numeric",  current: 44, threshold: 55, unit: "điểm", passed: false },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",          kind: "numeric",  current: 2,  threshold: 5,  unit: "lượt",  passed: false },
      { id: "bank-link",     label: "Liên kết tài khoản ngân hàng thụ hưởng",         kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Beach Club Mỹ Khê" },
      { id: "phone",   label: "Số điện thoại", value: "0236 555 8899" },
      { id: "address", label: "Địa chỉ",       value: "Bãi biển Mỹ Khê, Sơn Trà, Đà Nẵng" },
      { id: "hours",   label: "Giờ mở cửa",    value: "10:00 – 23:00 hàng ngày" },
    ],
    period_tier: 0,
    synchronized_tier: null,
    synchronized_tier_source: null,
    synchronized_tier_expiry: null,
    complimentary_tier: null,
    complimentary_tier_expiry: null,
    tier_readiness_status: "not_ready",
    tier_status: "active",
    grace_period_expiry: null,
  },

  // ── pf-004: Tier 3 organic · up_rank_ready · fresh (8d/100pts) · pending T4 upgrade ──
  "pf-004": {
    facilityId: "pf-004",
    tier: 3,
    tierName: "Đối tác Vàng",
    track: "organic",
    expiresAt: null,
    freshnessDaysStale: 8,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 90, threshold: 90, passed: true  },
      operations: { id: "operations", label: "Chính sách vận hành",        score: 90, threshold: 90, passed: true  },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",          score: 90, threshold: 90, passed: true  },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",    score: 90, threshold: 90, passed: true  },
    },
    missingFields: { facilities: [], operations: [], gallery: [], skus: [] },
    roadmap: [
      { id: "data-score",    label: "Data Score",                                        kind: "numeric",  current: 92, threshold: 90, unit: "điểm", passed: true },
      { id: "service-score", label: "Service Score",                                     kind: "numeric",  current: 93, threshold: 90, unit: "điểm", passed: true },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",            kind: "numeric",  current: 65, threshold: 60, unit: "lượt",  passed: true },
      { id: "data-contrib",  label: "Đóng góp dữ liệu Cấp 3 (API realtime)",           kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true },
      { id: "pay-crypto",    label: "Thanh toán Crypto đã kích hoạt",                   kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true },
      { id: "direct-book",   label: "Đặt chỗ trực tiếp (Direct Booking) đã kích hoạt", kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Heritage Tours" },
      { id: "phone",   label: "Số điện thoại", value: "0235 888 9900" },
      { id: "address", label: "Địa chỉ",       value: "12 Nguyễn Thị Minh Khai, Hội An" },
      { id: "hours",   label: "Giờ mở cửa",    value: "07:00 – 20:00 hàng ngày" },
    ],
    period_tier: 3,
    synchronized_tier: null,
    synchronized_tier_source: null,
    synchronized_tier_expiry: null,
    complimentary_tier: null,
    complimentary_tier_expiry: null,
    tier_readiness_status: "up_rank_ready",
    tier_status: "active",
    grace_period_expiry: null,
  },

  // ── pf-005: Tier 1 organic · not_ready · hint banner (45d/75pts) · deferred request ──
  "pf-005": {
    facilityId: "pf-005",
    tier: 1,
    tierName: "Đối tác Cơ bản",
    track: "organic",
    expiresAt: null,
    freshnessDaysStale: 45,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 40, threshold: 70, passed: false },
      operations: { id: "operations", label: "Chính sách vận hành",        score: 50, threshold: 70, passed: false },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",          score: 35, threshold: 70, passed: false },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",    score: 70, threshold: 70, passed: true  },
    },
    missingFields: {
      facilities: [
        "Chưa khai báo số ghế phục vụ tối đa",
        "Thiếu thông tin diện tích sàn",
      ],
      operations: [
        "Chính sách đặt bàn chưa hoàn thiện",
        "Chưa khai báo chính sách nhóm đông",
      ],
      gallery: [
        "Cần thêm 12 ảnh không gian nội thất",
        "Thiếu ảnh menu và món ăn đặc trưng",
        "Chưa có ảnh không gian tổ chức sự kiện",
      ],
      skus: [],
    },
    roadmap: [
      { id: "data-score",    label: "Data Score",                                       kind: "numeric",  current: 55, threshold: 70, unit: "điểm", passed: false },
      { id: "service-score", label: "Service Score",                                    kind: "numeric",  current: 60, threshold: 75, unit: "điểm", passed: false },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",           kind: "numeric",  current: 8,  threshold: 25, unit: "lượt",  passed: false },
      { id: "data-contrib",  label: "Đóng góp dữ liệu Cấp 1 (CSV thủ công)",          kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
      { id: "direct-book",   label: "Đặt chỗ trực tiếp (Direct Booking) đã kích hoạt",kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Dining & Events" },
      { id: "phone",   label: "Số điện thoại", value: "0236 777 5544" },
      { id: "address", label: "Địa chỉ",       value: "55 Lê Duẩn, Hải Châu, Đà Nẵng" },
      { id: "hours",   label: "Giờ mở cửa",    value: "11:00 – 23:00 hàng ngày" },
    ],
    period_tier: 1,
    synchronized_tier: null,
    synchronized_tier_source: null,
    synchronized_tier_expiry: null,
    complimentary_tier: null,
    complimentary_tier_expiry: null,
    tier_readiness_status: "not_ready",
    tier_status: "active",
    grace_period_expiry: null,
  },

  // ── pf-006: Tier 3 effective (complimentary) · period 1 · pre_urgent (85d/50pts) ──
  "pf-006": {
    facilityId: "pf-006",
    tier: 3,
    tierName: "Đối tác Vàng",
    track: "complimentary",
    expiresAt: d(45 * 24),
    freshnessDaysStale: 85,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 55, threshold: 70, passed: false },
      operations: { id: "operations", label: "Chính sách vận hành",        score: 68, threshold: 70, passed: false },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",          score: 48, threshold: 70, passed: false },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",    score: 72, threshold: 70, passed: true  },
    },
    missingFields: {
      facilities: ["Thiếu khai báo diện tích mặt bằng bán lẻ", "Chưa khai báo số quầy thanh toán"],
      operations: ["Chính sách đổi trả chưa đầy đủ"],
      gallery: ["Cần thêm ảnh sản phẩm (tối thiểu 20 ảnh)", "Thiếu ảnh không gian mua sắm"],
      skus: [],
    },
    roadmap: [
      { id: "data-score",    label: "Data Score",                              kind: "numeric",  current: 68, threshold: 70, unit: "điểm", passed: false },
      { id: "service-score", label: "Service Score",                           kind: "numeric",  current: 72, threshold: 75, unit: "điểm", passed: false },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",  kind: "numeric",  current: 18, threshold: 25, unit: "lượt",  passed: false },
      { id: "data-contrib",  label: "Đóng góp dữ liệu Cấp 1 (CSV thủ công)", kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true  },
      { id: "direct-book",   label: "Tích hợp đặt hàng trực tuyến",          kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Boutique Retail" },
      { id: "phone",   label: "Số điện thoại", value: "0236 999 1122" },
      { id: "address", label: "Địa chỉ",       value: "88 Hùng Vương, Hải Châu, Đà Nẵng" },
      { id: "hours",   label: "Giờ mở cửa",    value: "09:00 – 21:00 hàng ngày" },
    ],
    period_tier: 1,
    synchronized_tier: null,
    synchronized_tier_source: null,
    synchronized_tier_expiry: null,
    complimentary_tier: 3,
    complimentary_tier_expiry: d(45 * 24),
    tier_readiness_status: "not_ready",
    tier_status: "active",
    grace_period_expiry: null,
  },

  // ── pf-007: Tier 1 via active sync (no grace) · period 0 · fresh (10d/100pts) ──
  "pf-007": {
    facilityId: "pf-007",
    tier: 1,
    tierName: "Đối tác Tiêu chuẩn",
    track: "sync",
    expiresAt: d(45 * 24),
    freshnessDaysStale: 10,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 62, threshold: 85, passed: false },
      operations: { id: "operations", label: "Chính sách vận hành",        score: 70, threshold: 85, passed: false },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",          score: 45, threshold: 85, passed: false },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",    score: 55, threshold: 85, passed: false },
    },
    missingFields: {
      facilities: ["Chưa khai báo dịch vụ phòng (room service)", "Thiếu thông tin lounge tầng hành lý"],
      operations: ["Check-in sớm / check-out muộn chưa khai báo", "Chính sách trẻ em chưa hoàn thiện"],
      gallery: ["Cần 20 ảnh phòng (hiện 8)", "Thiếu ảnh nhà hàng tầng 1", "Chưa có ảnh panorama từ tầng thượng"],
      skus: ["Gói Sáng + Phòng chưa khai báo", "Thiếu gói dài ngày (7+ đêm)"],
    },
    roadmap: [
      { id: "data-score",    label: "Data Score",                                        kind: "numeric",  current: 62, threshold: 80, unit: "điểm", passed: false },
      { id: "service-score", label: "Service Score",                                     kind: "numeric",  current: 70, threshold: 85, unit: "điểm", passed: false },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",            kind: "numeric",  current: 12, threshold: 50, unit: "lượt",  passed: false },
      { id: "data-contrib",  label: "Đóng góp dữ liệu Cấp 2 (API/đồng bộ tự động)",   kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
      { id: "pay-crypto",    label: "Thanh toán Crypto đã kích hoạt",                   kind: "boolean",  current: 0,  threshold: 1,  unit: "",      passed: false },
      { id: "direct-book",   label: "Đặt chỗ trực tiếp (Direct Booking) đã kích hoạt", kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true  },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời City Hotel Hà Nội" },
      { id: "phone",   label: "Số điện thoại", value: "024 3888 2200" },
      { id: "address", label: "Địa chỉ",       value: "5 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội" },
      { id: "hours",   label: "Giờ mở cửa",    value: "24/7 — Lễ tân thường trực" },
    ],
    syncDisabledReason: "Đang trong thời gian Đồng bộ hạng — còn 45 ngày hiệu lực",
    period_tier: 0,
    // Spec: source pf-001 period_tier 2 → max sync = 2-1 = 1 ✓
    synchronized_tier: 1,
    synchronized_tier_source: "Mặt Trời Resort Đà Nẵng",
    synchronized_tier_expiry: d(45 * 24),
    complimentary_tier: null,
    complimentary_tier_expiry: null,
    tier_readiness_status: "not_ready",
    tier_status: "active",
    grace_period_expiry: null,
  },

  // ── pf-008: Tier 2 organic · up_rank_ready · warn banner (65d/50pts) ──
  "pf-008": {
    facilityId: "pf-008",
    tier: 2,
    tierName: "Đối tác Tiêu chuẩn",
    track: "organic",
    expiresAt: null,
    freshnessDaysStale: 65,
    completeness: {
      facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: 90, threshold: 90, passed: true  },
      operations: { id: "operations", label: "Chính sách vận hành",        score: 90, threshold: 90, passed: true  },
      gallery:    { id: "gallery",    label: "Hình ảnh (Gallery)",          score: 90, threshold: 90, passed: true  },
      skus:       { id: "skus",       label: "Danh mục sản phẩm (SKUs)",    score: 90, threshold: 90, passed: true  },
    },
    missingFields: { facilities: [], operations: [], gallery: [], skus: [] },
    roadmap: [
      { id: "data-score",    label: "Data Score",                                        kind: "numeric",  current: 88, threshold: 80, unit: "điểm", passed: true },
      { id: "service-score", label: "Service Score",                                     kind: "numeric",  current: 91, threshold: 85, unit: "điểm", passed: true },
      { id: "reviews",       label: "Đánh giá xác thực (12 tháng gần nhất)",            kind: "numeric",  current: 52, threshold: 50, unit: "lượt",  passed: true },
      { id: "data-contrib",  label: "Đóng góp dữ liệu Cấp 2 (API/đồng bộ tự động)",   kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true },
      { id: "pay-crypto",    label: "Thanh toán Crypto đã kích hoạt",                   kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true },
      { id: "direct-book",   label: "Đặt chỗ trực tiếp (Direct Booking) đã kích hoạt", kind: "boolean",  current: 1,  threshold: 1,  unit: "",      passed: true },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Eco Resort Phú Quốc" },
      { id: "phone",   label: "Số điện thoại", value: "0297 456 7890" },
      { id: "address", label: "Địa chỉ",       value: "Bãi Dài, Gành Dầu, Phú Quốc" },
      { id: "hours",   label: "Giờ mở cửa",    value: "24/7 — Lễ tân thường trực" },
    ],
    period_tier: 2,
    synchronized_tier: null,
    synchronized_tier_source: null,
    synchronized_tier_expiry: null,
    complimentary_tier: null,
    complimentary_tier_expiry: null,
    tier_readiness_status: "up_rank_ready",
    tier_status: "active",
    grace_period_expiry: null,
  },
};

// ─── Per-facility request history ─────────────────────────────────────────────

export type PartnerHistoryStatus = "pending" | "approved" | "deferred" | "expired";

export interface PartnerHistoryItem {
  id: string;
  facilityName: string;
  kind: "upgrade" | "sync";
  fromTier: TierLevel;
  toTier: TierLevel;
  submittedAt: string;
  status: PartnerHistoryStatus;
  adminComment?: string;
  adminChecklist?: string[];
  /**
   * For sync requests: other facility names synced in the same batch.
   * Undefined or empty = single-target sync.
   */
  syncTargets?: string[];
}

export const PARTNER_HISTORY_BY_FACILITY: Record<string, PartnerHistoryItem[]> = {
  "pf-001": [
    {
      id: "ph-001",
      facilityName: "Mặt Trời Resort Đà Nẵng",
      kind: "upgrade",
      fromTier: 2, toTier: 3,
      submittedAt: d(-48),
      status: "pending",
    },
    {
      id: "ph-003",
      facilityName: "Mặt Trời Resort Đà Nẵng",
      kind: "upgrade",
      fromTier: 1, toTier: 2,
      submittedAt: d(-2160),
      status: "deferred",
      adminComment:
        "Hồ sơ chưa đủ điều kiện xét duyệt. Vui lòng bổ sung các mục còn thiếu theo danh sách bên dưới và gửi lại.",
      adminChecklist: [
        "Tải lên ít nhất 10 ảnh chất lượng cao (>1200px) của cơ sở",
        "Hoàn thiện Chính sách huỷ phòng trong phần Vận hành",
        "Cung cấp giấy phép kinh doanh còn hiệu lực (bản scan rõ nét)",
      ],
    },
  ],
  "pf-002": [
    {
      id: "ph-002",
      facilityName: "Mặt Trời Boutique Hội An",
      kind: "sync",
      fromTier: 1, toTier: 2,
      submittedAt: d(-720),
      status: "approved",
      syncTargets: ["Mặt Trời Beach Club Mỹ Khê"],
    },
    {
      id: "ph-005",
      facilityName: "Mặt Trời Boutique Hội An",
      kind: "upgrade",
      fromTier: 0, toTier: 1,
      submittedAt: d(-4320),
      status: "approved",
    },
  ],
  "pf-003": [
    {
      id: "ph-006",
      facilityName: "Mặt Trời Beach Club Mỹ Khê",
      kind: "sync",
      fromTier: 0, toTier: 2,
      submittedAt: d(-720),
      status: "approved",
      syncTargets: ["Mặt Trời Boutique Hội An"],
    },
    {
      id: "ph-004",
      facilityName: "Mặt Trời Beach Club Mỹ Khê",
      kind: "upgrade",
      fromTier: 0, toTier: 1,
      submittedAt: d(-3600),
      status: "expired",
    },
  ],

  // pf-004: pending upgrade T3→T4 (up_rank_ready demo)
  "pf-004": [
    {
      id: "ph-007",
      facilityName: "Mặt Trời Heritage Tours",
      kind: "upgrade",
      fromTier: 3, toTier: 4,
      submittedAt: d(-24),
      status: "pending",
    },
    {
      id: "ph-008",
      facilityName: "Mặt Trời Heritage Tours",
      kind: "upgrade",
      fromTier: 2, toTier: 3,
      submittedAt: d(-2880),
      status: "approved",
    },
  ],

  // pf-005: deferred upgrade + old approved
  "pf-005": [
    {
      id: "ph-009",
      facilityName: "Mặt Trời Dining & Events",
      kind: "upgrade",
      fromTier: 1, toTier: 2,
      submittedAt: d(-336),
      status: "deferred",
      adminComment: "Điểm Data Score chưa đạt ngưỡng tối thiểu. Vui lòng cải thiện chất lượng hồ sơ và gửi lại sau 30 ngày.",
      adminChecklist: [
        "Nâng Data Score lên ≥ 70 điểm (hiện 55)",
        "Tải lên tối thiểu 12 ảnh nội thất chất lượng cao",
        "Hoàn thiện chính sách đặt bàn nhóm lớn",
      ],
    },
    {
      id: "ph-010",
      facilityName: "Mặt Trời Dining & Events",
      kind: "upgrade",
      fromTier: 0, toTier: 1,
      submittedAt: d(-5040),
      status: "approved",
    },
  ],

  // pf-006: expired upgrade (complimentary demo)
  "pf-006": [
    {
      id: "ph-011",
      facilityName: "Mặt Trời Boutique Retail",
      kind: "upgrade",
      fromTier: 1, toTier: 2,
      submittedAt: d(-4320),
      status: "expired",
    },
  ],

  // pf-007: no history (brand new sync recipient)
  "pf-007": [],

  // pf-008: all approved, ready for Tier 3 (up_rank_ready + warn banner)
  "pf-008": [
    {
      id: "ph-012",
      facilityName: "Mặt Trời Eco Resort Phú Quốc",
      kind: "upgrade",
      fromTier: 1, toTier: 2,
      submittedAt: d(-2160),
      status: "approved",
    },
    {
      id: "ph-013",
      facilityName: "Mặt Trời Eco Resort Phú Quốc",
      kind: "upgrade",
      fromTier: 0, toTier: 1,
      submittedAt: d(-5760),
      status: "approved",
    },
  ],
};

// ─── Combined history (all facilities) ───────────────────────────────────────

export const PARTNER_HISTORY: PartnerHistoryItem[] = Object.values(
  PARTNER_HISTORY_BY_FACILITY
).flat();
