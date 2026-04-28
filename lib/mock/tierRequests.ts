import type { TierRequest, FacilityRef, TierAuditEntry, ComplianceItem, SystemChecklist } from "@/lib/tier-requests/types";

// Base time: 2026-04-21T10:00:00Z
const BASE = 1776765600000;
const d = (offsetHours: number) => new Date(BASE + offsetHours * 3600000).toISOString();

// ─── Checklist helpers ────────────────────────────────────────────────────────

/** Tier 0 → 1: baseline onboarding criteria */
function cl0to1(dataScore: number, serviceScore: number, reviews: number): SystemChecklist {
  return {
    dataScore:        { id: "dataScore",        label: "Data Score",                           score: dataScore,    threshold: 50, passed: dataScore >= 50 },
    serviceScore:     { id: "serviceScore",      label: "Service Score",                        score: serviceScore, threshold: 55, passed: serviceScore >= 55 },
    verifiedReviews:  { id: "verifiedReviews",   label: "Đánh giá xác thực (12 tháng gần nhất)", score: reviews,     threshold: 5,  passed: reviews >= 5 },
  };
}

/** Tier 1 → 2: chất lượng ổn định — toàn bộ tự động, không có manual check */
function cl1to2(
  dataScore: number, serviceScore: number, reviews: number,
  opts: { dataContrib?: boolean; payQR?: boolean; payIntCard?: boolean; streakDays?: number } = {}
): SystemChecklist {
  const { dataContrib = false, payQR = false, payIntCard = false, streakDays = 0 } = opts;
  return {
    dataScore:       { id: "dataScore",       label: "Data Score",                             score: dataScore,             threshold: 70,  passed: dataScore >= 70 },
    serviceScore:    { id: "serviceScore",     label: "Service Score",                          score: serviceScore,          threshold: 75,  passed: serviceScore >= 75 },
    verifiedReviews: { id: "verifiedReviews",  label: "Đánh giá xác thực (12 tháng gần nhất)", score: reviews,               threshold: 25,  passed: reviews >= 25 },
    dataContrib:     { id: "dataContrib",      label: "Đóng góp dữ liệu Cấp 1 (CSV thủ công)", score: dataContrib ? 100 : 0,  threshold: 100, passed: dataContrib },
    payQR:           { id: "payQR",            label: "Thanh toán QR đã kích hoạt",             score: payQR ? 100 : 0,       threshold: 100, passed: payQR },
    payIntCard:      { id: "payIntCard",       label: "Thanh toán Thẻ quốc tế đã kích hoạt",   score: payIntCard ? 100 : 0,  threshold: 100, passed: payIntCard },
    streak7d:        { id: "streak7d",         label: "Duy trì điều kiện liên tục (ngày)",      score: streakDays,            threshold: 7,   passed: streakDays >= 7 },
  };
}

/** Tier 2 → 3: đối tác xuất sắc — tech gates tự động, marketing checks do Admin */
function cl2to3(
  dataScore: number, serviceScore: number, reviews: number,
  opts: { dataContrib?: boolean; payCrypto?: boolean; directBook?: boolean } = {}
): SystemChecklist {
  const { dataContrib = false, payCrypto = false, directBook = false } = opts;
  return {
    dataScore:       { id: "dataScore",       label: "Data Score",                                        score: dataScore,             threshold: 80,  passed: dataScore >= 80 },
    serviceScore:    { id: "serviceScore",     label: "Service Score",                                     score: serviceScore,          threshold: 85,  passed: serviceScore >= 85 },
    verifiedReviews: { id: "verifiedReviews",  label: "Đánh giá xác thực (12 tháng gần nhất)",            score: reviews,               threshold: 50,  passed: reviews >= 50 },
    dataContrib:     { id: "dataContrib",      label: "Đóng góp dữ liệu Cấp 2 (API/đồng bộ tự động)",    score: dataContrib ? 100 : 0,  threshold: 100, passed: dataContrib },
    payCrypto:       { id: "payCrypto",        label: "Thanh toán Crypto đã kích hoạt",                   score: payCrypto ? 100 : 0,   threshold: 100, passed: payCrypto },
    directBook:      { id: "directBook",       label: "Đặt chỗ trực tiếp (Direct Booking) đã kích hoạt", score: directBook ? 100 : 0,  threshold: 100, passed: directBook },
  };
}

/** Tier 3 → 4: duy trì Tier 3 + điều kiện chiến lược */
function cl3to4(dataScore: number, serviceScore: number, reviews: number): SystemChecklist {
  return {
    dataScore:        { id: "dataScore",        label: "Data Score (duy trì Tier 3)",          score: dataScore,    threshold: 80, passed: dataScore >= 80 },
    serviceScore:     { id: "serviceScore",      label: "Service Score (duy trì Tier 3)",       score: serviceScore, threshold: 85, passed: serviceScore >= 85 },
    verifiedReviews:  { id: "verifiedReviews",   label: "Đánh giá xác thực (duy trì Tier 3)",   score: reviews,     threshold: 50, passed: reviews >= 50 },
  };
}

// ─── Compliance items per tier transition ─────────────────────────────────────

const COMPLIANCE_0TO1: ComplianceItem[] = [
  { id: "kyc-docs",     label: "Cung cấp Giấy phép kinh doanh và CCCD/Hộ chiếu của chủ sở hữu hợp pháp" },
  { id: "kyc-activate", label: "Phê duyệt kích hoạt (Activated) cơ sở sau khi hoàn tất kiểm tra KYC" },
];

// Tier 1→2: toàn bộ điều kiện là tự động — không có Admin manual check
const COMPLIANCE_1TO2: ComplianceItem[] = [];

const COMPLIANCE_2TO3: ComplianceItem[] = [
  { id: "co-mkt",   label: "Ký kết thành công Thỏa thuận Co-marketing với Visit Vietnam" },
  { id: "mkt-plan", label: "Nộp bản cam kết Kế hoạch Marketing chung hàng năm (Joint Marketing Plan)" },
];

const COMPLIANCE_3TO4: ComplianceItem[] = [
  { id: "industry-lead",  label: "Doanh nghiệp dẫn đầu thị trường trong ngành dọc tương ứng (Top-tier player)" },
  { id: "strategic-deal", label: "Có thỏa thuận tài trợ hoặc đầu tư chiến lược đặc thù được ký kết" },
  { id: "invitation",     label: "Tiếp nhận và xác nhận Thư mời đích danh từ Ban quản trị Visit Vietnam" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function audit(id: string, atOffset: number, actor: string, action: string, track: TierAuditEntry["track"], reason?: string): TierAuditEntry {
  return { id, at: d(atOffset), actor, action, reason, track };
}

const f = (id: string, name: string, tier: FacilityRef["currentTier"], vertical: FacilityRef["vertical"], partner: string, location: string, dataScore: number, serviceScore: number): FacilityRef => ({
  id, name, currentTier: tier, vertical, partner, location, dataScore, serviceScore,
});

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_TIER_REQUESTS: TierRequest[] = [
  // ── UPGRADE REQUESTS ──────────────────────────────────────────────────────

  // Tier 2 → 3 — dataScore đạt, serviceScore chưa đạt (76 < 85), reviews đạt
  {
    id: "tr-001",
    facility: f("fac-101", "Vinpearl Resort & Spa Nha Trang", 2, "Accommodation", "Vingroup", "Nha Trang, Khánh Hoà", 81, 76),
    fromTier: 2, toTier: 3, status: "pending",
    submittedAt: d(-120), slaDeadlineAt: d(120),
    submittedBy: "Nguyễn Văn Hùng",
    details: {
      kind: "upgrade",
      systemChecklist: cl2to3(81, 76, 62, { dataContrib: true, payCrypto: false, directBook: true }),
      complianceItems: COMPLIANCE_2TO3,
    },
    auditHistory: [
      audit("a-001-1", -180, "Hệ thống", "Yêu cầu nâng hạng Tier 2 → 3 được tạo tự động", "organic"),
      audit("a-001-2", -120, "Nguyễn Văn Hùng", "Đã nộp hồ sơ bổ sung", "organic"),
    ],
  },

  // Tier 1 → 2 — dataScore đạt, serviceScore chưa đạt (68 < 75), reviews đạt
  {
    id: "tr-002",
    facility: f("fac-102", "Sun World Đà Nẵng Wonders", 1, "Tour", "Sun Group", "Đà Nẵng", 74, 68),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-36), slaDeadlineAt: d(12),
    submittedBy: "Trần Thị Mai",
    details: {
      kind: "upgrade",
      systemChecklist: cl1to2(74, 68, 28, { dataContrib: true, payQR: true, payIntCard: false, streakDays: 5 }),
      complianceItems: COMPLIANCE_1TO2,
    },
    auditHistory: [
      audit("a-002-1", -48, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 được tạo tự động", "organic"),
      audit("a-002-2", -36, "Trần Thị Mai", "Partner nộp hồ sơ; SLA còn 48h", "organic"),
    ],
  },

  // Tier 3 → 4 — deferred, by invitation only
  {
    id: "tr-003",
    facility: f("fac-103", "FLC Luxury Hotel Quy Nhơn", 3, "Accommodation", "FLC Group", "Quy Nhơn, Bình Định", 88, 79),
    fromTier: 3, toTier: 4, status: "deferred",
    submittedAt: d(-240), slaDeadlineAt: d(-72),
    submittedBy: "Lê Minh Tuấn",
    deferReason: "Hồ sơ pháp lý đang trong quá trình xác minh tại Sở VHTT. Cần bổ sung giấy phép kinh doanh lưu trú mới nhất và biên bản kiểm tra PCCC. Vui lòng cung cấp trong vòng 7 ngày làm việc.",
    details: {
      kind: "upgrade",
      systemChecklist: cl3to4(88, 79, 73),
      complianceItems: COMPLIANCE_3TO4,
    },
    auditHistory: [
      audit("a-003-1", -300, "Hệ thống", "Yêu cầu nâng hạng Tier 3 → 4 được tạo tự động", "organic"),
      audit("a-003-2", -240, "Lê Minh Tuấn", "Hồ sơ đã nộp đầy đủ", "organic"),
      audit("a-003-3", -72, "Phạm Quốc Bảo", "Trì hoãn — chờ xác minh pháp lý", "organic", "Hồ sơ pháp lý chưa đầy đủ"),
    ],
  },

  // Tier 0 → 1 — tất cả chỉ số đạt
  {
    id: "tr-004",
    facility: f("fac-104", "Boutique Hotel Phố Cổ Hội An", 0, "Accommodation", "Độc lập", "Hội An, Quảng Nam", 58, 62),
    fromTier: 0, toTier: 1, status: "pending",
    submittedAt: d(-96), slaDeadlineAt: d(144),
    submittedBy: "Võ Thị Lan",
    details: {
      kind: "upgrade",
      systemChecklist: cl0to1(58, 62, 8),
      complianceItems: COMPLIANCE_0TO1,
    },
    auditHistory: [
      audit("a-004-1", -120, "Hệ thống", "Yêu cầu nâng hạng Tier 0 → 1 được tạo tự động", "organic"),
      audit("a-004-2", -96, "Võ Thị Lan", "Đối tác nộp đăng ký lần đầu", "organic"),
    ],
  },

  // Tier 1 → 2 — serviceScore chưa đạt (71 < 75)
  {
    id: "tr-005",
    facility: f("fac-105", "Resort Biển Xanh Phú Quốc", 1, "Accommodation", "Phú Quốc Resort JSC", "Phú Quốc, Kiên Giang", 77, 71),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-50), slaDeadlineAt: d(-2),
    submittedBy: "Đinh Xuân Phú",
    details: {
      kind: "upgrade",
      systemChecklist: cl1to2(77, 71, 31, { dataContrib: true, payQR: true, payIntCard: true, streakDays: 3 }),
      complianceItems: COMPLIANCE_1TO2,
    },
    auditHistory: [
      audit("a-005-1", -72, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 được tạo tự động", "organic"),
      audit("a-005-2", -50, "Đinh Xuân Phú", "Hồ sơ đã nộp", "organic"),
    ],
  },

  // Tier 1 → 2 — dataScore chưa đạt (65 < 70), serviceScore chưa đạt (70 < 75)
  {
    id: "tr-006",
    facility: f("fac-106", "Nhà hàng Sóng Biển Đà Nẵng", 1, "F&B", "Sóng Biển F&B", "Đà Nẵng", 65, 70),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-168), slaDeadlineAt: d(168),
    submittedBy: "Ngô Thị Hương",
    details: {
      kind: "upgrade",
      systemChecklist: cl1to2(65, 70, 30, { dataContrib: false, payQR: true, payIntCard: false, streakDays: 0 }),
      complianceItems: COMPLIANCE_1TO2,
    },
    auditHistory: [
      audit("a-006-1", -200, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 được tạo tự động", "organic"),
      audit("a-006-2", -168, "Ngô Thị Hương", "Đã nộp đầy đủ hồ sơ thực đơn & bằng chứng vệ sinh ATTP", "organic"),
    ],
  },

  // Tier 1 → 2 — serviceScore chưa đạt (73 < 75)
  {
    id: "tr-007",
    facility: f("fac-107", "Vietravel Đà Lạt Experience", 1, "Tour", "Vietravel", "Đà Lạt, Lâm Đồng", 70, 73),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-144), slaDeadlineAt: d(144),
    submittedBy: "Hoàng Đức Thịnh",
    details: {
      kind: "upgrade",
      systemChecklist: cl1to2(70, 73, 29, { dataContrib: true, payQR: true, payIntCard: true, streakDays: 4 }),
      complianceItems: COMPLIANCE_1TO2,
    },
    auditHistory: [
      audit("a-007-1", -160, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 tự động", "organic"),
      audit("a-007-2", -144, "Hoàng Đức Thịnh", "Hồ sơ nộp đủ", "organic"),
    ],
  },

  // Tier 3 → 4 — deferred, serviceScore chưa đạt (85 biên), reviews đạt
  {
    id: "tr-008",
    facility: f("fac-108", "BRG Golf Resort Đà Lạt", 3, "Accommodation", "BRG Group", "Đà Lạt, Lâm Đồng", 91, 85),
    fromTier: 3, toTier: 4, status: "deferred",
    submittedAt: d(-336), slaDeadlineAt: d(-96),
    submittedBy: "Phan Thị Thu",
    deferReason: "Yêu cầu bổ sung 3 hạng mục: (1) Kết quả đánh giá sao quốc tế mới nhất, (2) Hợp đồng dịch vụ golf quốc tế, (3) Xác nhận đội ngũ nhân sự có chứng chỉ PGA. Thời hạn bổ sung: 14 ngày làm việc kể từ ngày nhận thông báo này.",
    details: {
      kind: "upgrade",
      systemChecklist: cl3to4(91, 85, 88),
      complianceItems: COMPLIANCE_3TO4,
    },
    auditHistory: [
      audit("a-008-1", -400, "Hệ thống", "Yêu cầu nâng hạng Tier 3 → 4 tự động", "organic"),
      audit("a-008-2", -336, "Phan Thị Thu", "Hồ sơ đã nộp", "organic"),
      audit("a-008-3", -96, "Trần Văn Long", "Trì hoãn — thiếu chứng chỉ quốc tế", "organic", "Cần thêm bằng chứng tiêu chuẩn golf quốc tế"),
      audit("a-008-4", -48, "Phan Thị Thu", "Đã nhận yêu cầu bổ sung, đang xử lý", "organic"),
    ],
  },

  // Tier 0 → 1 — deferred, reviews chưa đạt (3 < 5)
  {
    id: "tr-009",
    facility: f("fac-109", "Khách sạn Ngọc Trai Sapa", 0, "Accommodation", "Sapa Tourism JSC", "Sa Pa, Lào Cai", 52, 55),
    fromTier: 0, toTier: 1, status: "deferred",
    submittedAt: d(-288), slaDeadlineAt: d(-120),
    submittedBy: "Cầm Thị Hoa",
    deferReason: "Chưa đáp ứng tiêu chí Gallery (ảnh chụp chuyên nghiệp còn thiếu). Yêu cầu cung cấp ít nhất 20 ảnh chụp ngoại thất và nội thất chất lượng cao theo đúng guideline của VSVN. Deadline: 10 ngày làm việc.",
    details: {
      kind: "upgrade",
      systemChecklist: cl0to1(52, 55, 3),
      complianceItems: COMPLIANCE_0TO1,
    },
    auditHistory: [
      audit("a-009-1", -300, "Hệ thống", "Yêu cầu nâng hạng Tier 0 → 1 tự động", "organic"),
      audit("a-009-2", -288, "Cầm Thị Hoa", "Đăng ký lần đầu", "organic"),
      audit("a-009-3", -120, "Nguyễn Thị Bình", "Trì hoãn — ảnh gallery chưa đạt", "organic", "Thiếu ảnh chất lượng cao"),
    ],
  },

  // Tier 2 → 3 — serviceScore chưa đạt (80 < 85)
  {
    id: "tr-010",
    facility: f("fac-110", "Mường Thanh Luxury Hạ Long", 2, "Accommodation", "Mường Thanh Group", "Hạ Long, Quảng Ninh", 84, 80),
    fromTier: 2, toTier: 3, status: "pending",
    submittedAt: d(-36), slaDeadlineAt: d(12),
    submittedBy: "Trịnh Văn Đạt",
    details: {
      kind: "upgrade",
      systemChecklist: cl2to3(84, 80, 57, { dataContrib: true, payCrypto: true, directBook: false }),
      complianceItems: COMPLIANCE_2TO3,
    },
    auditHistory: [
      audit("a-010-1", -48, "Hệ thống", "Yêu cầu nâng hạng Tier 2 → 3 tự động", "organic"),
      audit("a-010-2", -36, "Trịnh Văn Đạt", "Hồ sơ đã nộp — SLA còn 48h", "organic"),
    ],
  },

  // Tier 1 → 2 — serviceScore chưa đạt (65 < 75), reviews chưa đạt (22 < 25)
  {
    id: "tr-011",
    facility: f("fac-111", "Resort Cát Vàng Mũi Né", 1, "Accommodation", "Cát Vàng Resort JSC", "Mũi Né, Bình Thuận", 71, 65),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-96), slaDeadlineAt: d(96),
    submittedBy: "Bùi Thị Thanh",
    details: {
      kind: "upgrade",
      systemChecklist: cl1to2(71, 65, 22, { dataContrib: false, payQR: false, payIntCard: false, streakDays: 0 }),
      complianceItems: COMPLIANCE_1TO2,
    },
    auditHistory: [
      audit("a-011-1", -120, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 tự động", "organic"),
      audit("a-011-2", -96, "Bùi Thị Thanh", "Đã nộp hồ sơ", "organic"),
    ],
  },

  // Tier 0 → 1 — tất cả đạt
  {
    id: "tr-012",
    facility: f("fac-112", "Tour Thiên Minh Hội An Heritage", 0, "Tour", "Thiên Minh Group", "Hội An, Quảng Nam", 60, 67),
    fromTier: 0, toTier: 1, status: "pending",
    submittedAt: d(-48), slaDeadlineAt: d(48),
    submittedBy: "Lý Văn Minh",
    details: {
      kind: "upgrade",
      systemChecklist: cl0to1(60, 67, 6),
      complianceItems: COMPLIANCE_0TO1,
    },
    auditHistory: [
      audit("a-012-1", -60, "Hệ thống", "Yêu cầu nâng hạng Tier 0 → 1 tự động", "organic"),
      audit("a-012-2", -48, "Lý Văn Minh", "Đăng ký lần đầu", "organic"),
    ],
  },

  // ── SYNC REQUESTS ─────────────────────────────────────────────────────────

  {
    id: "tr-013",
    facility: f("fac-113", "Mường Thanh Grand Hà Nội", 3, "Accommodation", "Mường Thanh Group", "Hà Nội", 86, 82),
    fromTier: 0, toTier: 3, status: "pending",
    submittedAt: d(-72), slaDeadlineAt: d(72),
    submittedBy: "Đặng Thị Ngọc",
    details: {
      kind: "sync",
      sourceFacility: f("fac-113", "Mường Thanh Grand Hà Nội", 3, "Accommodation", "Mường Thanh Group", "Hà Nội", 86, 82),
      targetFacilities: [
        f("fac-113a", "Mường Thanh Holiday Hà Nội", 0, "Accommodation", "Mường Thanh Group", "Hà Nội", 0, 0),
        f("fac-113b", "Mường Thanh Westlake Hà Nội", 0, "Accommodation", "Mường Thanh Group", "Hà Nội", 0, 0),
        f("fac-113c", "Mường Thanh Cửa Lò", 0, "Accommodation", "Mường Thanh Group", "Cửa Lò, Nghệ An", 0, 0),
      ],
      justification: "Các cơ sở Mường Thanh tại Hà Nội và Cửa Lò đều thuộc cùng tập đoàn, đạt tiêu chuẩn vận hành nội bộ tương đương Mường Thanh Grand. Đề nghị đồng bộ hạng để thống nhất trải nghiệm đối tác và hỗ trợ triển khai chiến dịch co-marketing toàn hệ thống.",
      durationDays: 90,
    },
    auditHistory: [
      audit("a-013-1", -100, "Mường Thanh Group", "Yêu cầu đồng bộ hạng gửi từ Partner Portal", "sync"),
      audit("a-013-2", -72, "Đặng Thị Ngọc", "Đã tiếp nhận và xác minh nguồn", "sync"),
    ],
  },

  {
    id: "tr-014",
    facility: f("fac-114", "Saigontourist Beach Vũng Tàu", 2, "Accommodation", "Saigontourist", "Vũng Tàu, Bà Rịa-VT", 79, 74),
    fromTier: 0, toTier: 2, status: "pending",
    submittedAt: d(-96), slaDeadlineAt: d(96),
    submittedBy: "Nguyễn Thị Kim Anh",
    details: {
      kind: "sync",
      sourceFacility: f("fac-114", "Saigontourist Beach Vũng Tàu", 2, "Accommodation", "Saigontourist", "Vũng Tàu, Bà Rịa-VT", 79, 74),
      targetFacilities: [
        f("fac-114a", "Saigontourist Garden Resort VT", 0, "Accommodation", "Saigontourist", "Vũng Tàu, Bà Rịa-VT", 0, 0),
        f("fac-114b", "Saigontourist Seaside Bungalow", 0, "Accommodation", "Saigontourist", "Long Hải, Bà Rịa-VT", 0, 0),
      ],
      justification: "Hai cơ sở mục tiêu mới khai trương tháng 3/2026, vận hành theo quy trình chuẩn của Saigontourist. Đề nghị kéo hạng để kích hoạt booking channel và hiển thị trên nền tảng VSVN ngay từ đầu mùa du lịch hè.",
      durationDays: 60,
    },
    auditHistory: [
      audit("a-014-1", -120, "Saigontourist", "Yêu cầu đồng bộ hạng từ Partner Portal", "sync"),
      audit("a-014-2", -96, "Nguyễn Thị Kim Anh", "Đã tiếp nhận hồ sơ", "sync"),
    ],
  },

  {
    id: "tr-015",
    facility: f("fac-115", "Sun World Bà Nà Hills", 4, "Tour", "Sun Group", "Đà Nẵng", 95, 91),
    fromTier: 0, toTier: 4, status: "pending",
    submittedAt: d(-192), slaDeadlineAt: d(192),
    submittedBy: "Phan Văn Khải",
    details: {
      kind: "sync",
      sourceFacility: f("fac-115", "Sun World Bà Nà Hills", 4, "Tour", "Sun Group", "Đà Nẵng", 95, 91),
      targetFacilities: [
        f("fac-115a", "Sun World Hon Thom Nature Park", 0, "Tour", "Sun Group", "Phú Quốc, Kiên Giang", 0, 0),
        f("fac-115b", "Sun World Fansipan Legend", 0, "Tour", "Sun Group", "Sa Pa, Lào Cai", 0, 0),
      ],
      justification: "Sun World Hon Thom và Fansipan đều đã đạt vận hành chuẩn Sun Group, được kiểm tra nội bộ Q1/2026. Đề nghị đồng bộ để đưa vào chương trình ưu đãi mùa hè 2026.",
      durationDays: 90,
    },
    auditHistory: [
      audit("a-015-1", -210, "Sun Group", "Yêu cầu đồng bộ hạng từ Partner Portal", "sync"),
      audit("a-015-2", -192, "Phan Văn Khải", "Đã tiếp nhận hồ sơ và xác minh source", "sync"),
      audit("a-015-3", -48, "Hệ thống", "Nhắc nhở SLA — còn 8 ngày", "sync"),
    ],
  },

  {
    id: "tr-016",
    facility: f("fac-116", "Lữ hành BRG Hà Nội", 1, "Tour", "BRG Group", "Hà Nội", 66, 60),
    fromTier: 0, toTier: 1, status: "deferred",
    submittedAt: d(-264), slaDeadlineAt: d(-48),
    submittedBy: "Trần Xuân Bình",
    deferReason: "Cơ sở mục tiêu BRG Tour Hà Đông chưa có GPKD lữ hành quốc tế. Yêu cầu cung cấp giấy phép hợp lệ trước khi xét duyệt đồng bộ hạng. Vui lòng phản hồi trong vòng 5 ngày làm việc.",
    details: {
      kind: "sync",
      sourceFacility: f("fac-116", "Lữ hành BRG Hà Nội", 1, "Tour", "BRG Group", "Hà Nội", 66, 60),
      targetFacilities: [
        f("fac-116a", "BRG Tour Hà Đông", 0, "Tour", "BRG Group", "Hà Đông, Hà Nội", 0, 0),
      ],
      justification: "Chi nhánh Hà Đông đã vận hành 6 tháng theo chuẩn BRG, muốn đồng bộ để bắt đầu nhận booking từ VSVN.",
      durationDays: 30,
    },
    auditHistory: [
      audit("a-016-1", -290, "BRG Group", "Yêu cầu đồng bộ hạng", "sync"),
      audit("a-016-2", -264, "Trần Xuân Bình", "Đã tiếp nhận", "sync"),
      audit("a-016-3", -48, "Lê Thị Hà", "Trì hoãn — thiếu GPKD lữ hành quốc tế", "sync", "Cơ sở mục tiêu chưa có giấy phép"),
    ],
  },

  {
    id: "tr-017",
    facility: f("fac-117", "Vinpearl Condotel Nha Trang", 3, "Accommodation", "Vingroup", "Nha Trang, Khánh Hoà", 87, 83),
    fromTier: 0, toTier: 3, status: "pending",
    submittedAt: d(-120), slaDeadlineAt: d(120),
    submittedBy: "Đỗ Thị Phương",
    details: {
      kind: "sync",
      sourceFacility: f("fac-117", "Vinpearl Condotel Nha Trang", 3, "Accommodation", "Vingroup", "Nha Trang, Khánh Hoà", 87, 83),
      targetFacilities: [
        f("fac-117a", "Vinpearl Condotel Bãi Trường", 0, "Accommodation", "Vingroup", "Phú Quốc, Kiên Giang", 0, 0),
        f("fac-117b", "Vinpearl Resort & Golf Nam Hội An", 0, "Accommodation", "Vingroup", "Hội An, Quảng Nam", 0, 0),
        f("fac-117c", "Vinpearl Empire Condotel Nha Trang", 0, "Accommodation", "Vingroup", "Nha Trang, Khánh Hoà", 0, 0),
      ],
      justification: "Các condotel mục tiêu thuộc hệ sinh thái Vinpearl, vận hành đồng nhất theo tiêu chuẩn Vingroup. Đề nghị đồng bộ để đưa vào campaign hè 2026.",
      durationDays: 90,
    },
    auditHistory: [
      audit("a-017-1", -144, "Vingroup", "Yêu cầu đồng bộ hạng từ Partner Portal", "sync"),
      audit("a-017-2", -120, "Đỗ Thị Phương", "Đã tiếp nhận và xác minh hồ sơ nguồn", "sync"),
    ],
  },

  {
    id: "tr-018",
    facility: f("fac-118", "Exotissimo Travel Hà Nội", 2, "Tour", "Thiên Minh Group", "Hà Nội", 80, 77),
    fromTier: 0, toTier: 2, status: "pending",
    submittedAt: d(-48), slaDeadlineAt: d(48),
    submittedBy: "Nguyễn Đức Hoà",
    details: {
      kind: "sync",
      sourceFacility: f("fac-118", "Exotissimo Travel Hà Nội", 2, "Tour", "Thiên Minh Group", "Hà Nội", 80, 77),
      targetFacilities: [
        f("fac-118a", "Exotissimo Travel Đà Nẵng", 0, "Tour", "Thiên Minh Group", "Đà Nẵng", 0, 0),
        f("fac-118b", "Exotissimo Travel TP.HCM", 0, "Tour", "Thiên Minh Group", "TP. Hồ Chí Minh", 0, 0),
      ],
      justification: "Hai chi nhánh mới của Exotissimo tại Đà Nẵng và TP.HCM đã hoàn thiện cơ sở hạ tầng và nhân sự theo chuẩn tập đoàn. Đề nghị đồng bộ hạng để bắt đầu phân phối sản phẩm tour trên nền tảng VSVN.",
      durationDays: 60,
    },
    auditHistory: [
      audit("a-018-1", -60, "Thiên Minh Group", "Yêu cầu đồng bộ hạng từ Partner Portal", "sync"),
      audit("a-018-2", -48, "Nguyễn Đức Hoà", "Đã tiếp nhận hồ sơ", "sync"),
    ],
  },

  {
    id: "tr-019",
    facility: f("fac-119", "FLC Beach & Golf Resort Đà Nẵng", 2, "Accommodation", "FLC Group", "Đà Nẵng", 83, 78),
    fromTier: 0, toTier: 2, status: "deferred",
    submittedAt: d(-216), slaDeadlineAt: d(-72),
    submittedBy: "Hoàng Thị Yến",
    deferReason: "Cơ sở FLC Villas Đà Nẵng đang trong quá trình nâng cấp nội thất, dự kiến hoàn thành tháng 5/2026. Yêu cầu Partner xác nhận ngày hoàn thành và gửi biên bản nghiệm thu trước khi xét duyệt lại.",
    details: {
      kind: "sync",
      sourceFacility: f("fac-119", "FLC Beach & Golf Resort Đà Nẵng", 2, "Accommodation", "FLC Group", "Đà Nẵng", 83, 78),
      targetFacilities: [
        f("fac-119a", "FLC Villas Đà Nẵng", 0, "Accommodation", "FLC Group", "Đà Nẵng", 0, 0),
        f("fac-119b", "FLC Residences Sầm Sơn", 0, "Accommodation", "FLC Group", "Sầm Sơn, Thanh Hoá", 0, 0),
      ],
      justification: "Các căn hộ và villas FLC đang được chuẩn hóa theo tiêu chuẩn FLC Group, mong muốn đồng bộ để kịp mùa hè.",
      durationDays: 60,
    },
    auditHistory: [
      audit("a-019-1", -240, "FLC Group", "Yêu cầu đồng bộ hạng", "sync"),
      audit("a-019-2", -216, "Hoàng Thị Yến", "Đã tiếp nhận hồ sơ", "sync"),
      audit("a-019-3", -72, "Trần Văn Long", "Trì hoãn — cơ sở mục tiêu đang nâng cấp", "sync", "FLC Villas chưa hoàn thiện"),
    ],
  },

  // Tier 0 → 1 — deferred, reviews chưa đạt (4 < 5)
  {
    id: "tr-020",
    facility: f("fac-120", "Homestay Bình Minh Hội An", 0, "Accommodation", "Độc lập", "Hội An, Quảng Nam", 50, 58),
    fromTier: 0, toTier: 1, status: "deferred",
    submittedAt: d(-312), slaDeadlineAt: d(-144),
    submittedBy: "Trương Văn Bình",
    deferReason: "SKU danh mục phòng chưa đáp ứng mức tối thiểu (cần tối thiểu 5 loại phòng có mô tả đầy đủ và ảnh chụp). Hiện tại chỉ có 2 loại phòng. Yêu cầu bổ sung danh mục trong 10 ngày làm việc.",
    details: {
      kind: "upgrade",
      systemChecklist: cl0to1(50, 58, 4),
      complianceItems: COMPLIANCE_0TO1,
    },
    auditHistory: [
      audit("a-020-1", -336, "Hệ thống", "Yêu cầu nâng hạng Tier 0 → 1 tự động", "organic"),
      audit("a-020-2", -312, "Trương Văn Bình", "Đăng ký lần đầu", "organic"),
      audit("a-020-3", -144, "Nguyễn Thị Bình", "Trì hoãn — SKU phòng chưa đủ", "organic", "Thiếu danh mục phòng"),
    ],
  },
];
