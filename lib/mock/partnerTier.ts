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
  current: number;
  threshold: number;
  unit: string;
  passed: boolean;
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
  f("pf-001", "Mặt Trời Resort Đà Nẵng", 2, "Accommodation", "Đà Nẵng", 75, 80),
  f("pf-002", "Mặt Trời Boutique Hội An", 1, "Accommodation", "Hội An, Quảng Nam", 58, 62),
  f("pf-003", "Mặt Trời Beach Club Mỹ Khê", 0, "F&B", "Đà Nẵng", 35, 44),
];

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
      { id: "data-score", label: "Data Score",              current: 75, threshold: 85, unit: "điểm", passed: false },
      { id: "reviews",    label: "Lượt đánh giá 4★ trở lên", current: 15, threshold: 20, unit: "lượt",  passed: false },
      { id: "gallery",    label: "Ảnh chất lượng cao",       current: 6,  threshold: 15, unit: "ảnh",   passed: false },
      { id: "skus",       label: "Gói dịch vụ đã khai báo",  current: 12, threshold: 10, unit: "gói",   passed: true  },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Resort Đà Nẵng" },
      { id: "phone",   label: "Số điện thoại", value: "0236 123 4567" },
      { id: "address", label: "Địa chỉ",       value: "18 Trường Sa, Mỹ Khê, Đà Nẵng" },
      { id: "hours",   label: "Giờ mở cửa",    value: "24/7 — Lễ tân thường trực" },
    ],
  },

  "pf-002": {
    facilityId: "pf-002",
    tier: 1,
    tierName: "Đối tác Cơ bản",
    track: "sync",
    expiresAt: d(15 * 24),  // expires in 15 days
    freshnessDaysStale: 5,
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
      { id: "data-score", label: "Data Score",              current: 58, threshold: 70, unit: "điểm", passed: false },
      { id: "reviews",    label: "Lượt đánh giá 4★ trở lên", current: 8,  threshold: 12, unit: "lượt",  passed: false },
      { id: "gallery",    label: "Ảnh chất lượng cao",       current: 4,  threshold: 10, unit: "ảnh",   passed: false },
      { id: "skus",       label: "Gói dịch vụ đã khai báo",  current: 9,  threshold: 8,  unit: "gói",   passed: true  },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Boutique Hội An" },
      { id: "phone",   label: "Số điện thoại", value: "0235 987 6543" },
      { id: "address", label: "Địa chỉ",       value: "24 Trần Phú, Minh An, Hội An" },
      { id: "hours",   label: "Giờ mở cửa",    value: "08:00 – 22:00 hàng ngày" },
    ],
    syncDisabledReason: "Đang trong thời gian Đồng bộ hạng — còn 15 ngày hiệu lực",
  },

  "pf-003": {
    facilityId: "pf-003",
    tier: 0,
    tierName: "Chưa phân hạng",
    track: null,
    expiresAt: null,
    freshnessDaysStale: 30,
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
      { id: "data-score", label: "Data Score",              current: 35, threshold: 50, unit: "điểm", passed: false },
      { id: "reviews",    label: "Lượt đánh giá 4★ trở lên", current: 2,  threshold: 8,  unit: "lượt",  passed: false },
      { id: "gallery",    label: "Ảnh chất lượng cao",       current: 2,  threshold: 8,  unit: "ảnh",   passed: false },
      { id: "skus",       label: "Gói dịch vụ đã khai báo",  current: 5,  threshold: 5,  unit: "gói",   passed: true  },
    ],
    quickVerifyFields: [
      { id: "name",    label: "Tên cơ sở",     value: "Mặt Trời Beach Club Mỹ Khê" },
      { id: "phone",   label: "Số điện thoại", value: "0236 555 8899" },
      { id: "address", label: "Địa chỉ",       value: "Bãi biển Mỹ Khê, Sơn Trà, Đà Nẵng" },
      { id: "hours",   label: "Giờ mở cửa",    value: "10:00 – 23:00 hàng ngày" },
    ],
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
      id: "ph-004",
      facilityName: "Mặt Trời Beach Club Mỹ Khê",
      kind: "upgrade",
      fromTier: 0, toTier: 1,
      submittedAt: d(-3600),
      status: "expired",
    },
  ],
};

// ─── Combined history (all facilities) ───────────────────────────────────────

export const PARTNER_HISTORY: PartnerHistoryItem[] = Object.values(
  PARTNER_HISTORY_BY_FACILITY
).flat();
