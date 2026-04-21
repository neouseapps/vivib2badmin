import type { TierRequest, FacilityRef, TierAuditEntry, ComplianceItem, SystemChecklist } from "@/lib/tier-requests/types";

// Base time: 2026-04-21T10:00:00Z
const BASE = 1776765600000;
const d = (offsetHours: number) => new Date(BASE + offsetHours * 3600000).toISOString();

const COMPLIANCE: ComplianceItem[] = [
  { id: "co-marketing", label: "Đã ký thỏa thuận co-marketing" },
  { id: "field-visit", label: "Đã xác minh thực tế qua Field Visit (nếu yêu cầu)" },
  { id: "legal-clean", label: "Hồ sơ pháp lý không có tranh chấp" },
];

function checklist(
  facScore: number, facThresh: number,
  opsScore: number, opsThresh: number,
  galScore: number, galThresh: number,
  skuScore: number, skuThresh: number,
): SystemChecklist {
  return {
    facilities: { id: "facilities", label: "Cơ sở vật chất & Tiện ích", score: facScore, threshold: facThresh, passed: facScore >= facThresh },
    operations: { id: "operations", label: "Chính sách vận hành", score: opsScore, threshold: opsThresh, passed: opsScore >= opsThresh },
    gallery: { id: "gallery", label: "Hình ảnh (Gallery)", score: galScore, threshold: galThresh, passed: galScore >= galThresh },
    skus: { id: "skus", label: "Danh mục sản phẩm (SKUs)", score: skuScore, threshold: skuThresh, passed: skuScore >= skuThresh },
  };
}

function audit(id: string, atOffset: number, actor: string, action: string, track: TierAuditEntry["track"], reason?: string): TierAuditEntry {
  return { id, at: d(atOffset), actor, action, reason, track };
}

const f = (id: string, name: string, tier: FacilityRef["currentTier"], vertical: FacilityRef["vertical"], partner: string, location: string, dataScore: number, serviceScore: number): FacilityRef => ({
  id, name, currentTier: tier, vertical, partner, location, dataScore, serviceScore,
});

export const MOCK_TIER_REQUESTS: TierRequest[] = [
  // ── UPGRADE REQUESTS ──────────────────────────────────────────────────────

  {
    id: "tr-001",
    facility: f("fac-101", "Vinpearl Resort & Spa Nha Trang", 2, "Accommodation", "Vingroup", "Nha Trang, Khánh Hoà", 81, 76),
    fromTier: 2, toTier: 3, status: "pending",
    submittedAt: d(-120), slaDeadlineAt: d(120),
    submittedBy: "Nguyễn Văn Hùng",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(85, 70, 78, 70, 92, 70, 80, 70),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-001-1", -180, "Hệ thống", "Yêu cầu nâng hạng Tier 2 → 3 được tạo tự động", "organic"),
      audit("a-001-2", -120, "Nguyễn Văn Hùng", "Đã nộp hồ sơ bổ sung", "organic"),
    ],
  },

  {
    id: "tr-002",
    facility: f("fac-102", "Sun World Đà Nẵng Wonders", 1, "Tour", "Sun Group", "Đà Nẵng", 74, 68),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-36), slaDeadlineAt: d(12),
    submittedBy: "Trần Thị Mai",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(72, 70, 65, 70, 88, 70, 71, 70),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-002-1", -48, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 được tạo tự động", "organic"),
      audit("a-002-2", -36, "Trần Thị Mai", "Partner nộp hồ sơ; SLA còn 48h", "organic"),
    ],
  },

  {
    id: "tr-003",
    facility: f("fac-103", "FLC Luxury Hotel Quy Nhơn", 3, "Accommodation", "FLC Group", "Quy Nhơn, Bình Định", 88, 79),
    fromTier: 3, toTier: 4, status: "deferred",
    submittedAt: d(-240), slaDeadlineAt: d(-72),
    submittedBy: "Lê Minh Tuấn",
    deferReason: "Hồ sơ pháp lý đang trong quá trình xác minh tại Sở VHTT. Cần bổ sung giấy phép kinh doanh lưu trú mới nhất và biên bản kiểm tra PCCC. Vui lòng cung cấp trong vòng 7 ngày làm việc.",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(90, 80, 82, 80, 95, 80, 88, 80),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-003-1", -300, "Hệ thống", "Yêu cầu nâng hạng Tier 3 → 4 được tạo tự động", "organic"),
      audit("a-003-2", -240, "Lê Minh Tuấn", "Hồ sơ đã nộp đầy đủ", "organic"),
      audit("a-003-3", -72, "Phạm Quốc Bảo", "Trì hoãn — chờ xác minh pháp lý", "organic", "Hồ sơ pháp lý chưa đầy đủ"),
    ],
  },

  {
    id: "tr-004",
    facility: f("fac-104", "Boutique Hotel Phố Cổ Hội An", 0, "Accommodation", "Độc lập", "Hội An, Quảng Nam", 58, 62),
    fromTier: 0, toTier: 1, status: "pending",
    submittedAt: d(-96), slaDeadlineAt: d(144),
    submittedBy: "Võ Thị Lan",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(60, 60, 55, 60, 70, 60, 58, 60),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-004-1", -120, "Hệ thống", "Yêu cầu nâng hạng Tier 0 → 1 được tạo tự động", "organic"),
      audit("a-004-2", -96, "Võ Thị Lan", "Đối tác nộp đăng ký lần đầu", "organic"),
    ],
  },

  {
    id: "tr-005",
    facility: f("fac-105", "Resort Biển Xanh Phú Quốc", 1, "Accommodation", "Phú Quốc Resort JSC", "Phú Quốc, Kiên Giang", 77, 71),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-50), slaDeadlineAt: d(-2),
    submittedBy: "Đinh Xuân Phú",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(75, 70, 80, 70, 62, 70, 74, 70),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-005-1", -72, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 được tạo tự động", "organic"),
      audit("a-005-2", -50, "Đinh Xuân Phú", "Hồ sơ đã nộp", "organic"),
    ],
  },

  {
    id: "tr-006",
    facility: f("fac-106", "Nhà hàng Sóng Biển Đà Nẵng", 1, "F&B", "Sóng Biển F&B", "Đà Nẵng", 65, 70),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-168), slaDeadlineAt: d(168),
    submittedBy: "Ngô Thị Hương",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(68, 65, 72, 65, 80, 65, 66, 65),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-006-1", -200, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 được tạo tự động", "organic"),
      audit("a-006-2", -168, "Ngô Thị Hương", "Đã nộp đầy đủ hồ sơ thực đơn & bằng chứng vệ sinh ATTP", "organic"),
    ],
  },

  {
    id: "tr-007",
    facility: f("fac-107", "Vietravel Đà Lạt Experience", 1, "Tour", "Vietravel", "Đà Lạt, Lâm Đồng", 70, 73),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-144), slaDeadlineAt: d(144),
    submittedBy: "Hoàng Đức Thịnh",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(73, 65, 70, 65, 85, 65, 68, 65),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-007-1", -160, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 tự động", "organic"),
      audit("a-007-2", -144, "Hoàng Đức Thịnh", "Hồ sơ nộp đủ", "organic"),
    ],
  },

  {
    id: "tr-008",
    facility: f("fac-108", "BRG Golf Resort Đà Lạt", 3, "Accommodation", "BRG Group", "Đà Lạt, Lâm Đồng", 91, 85),
    fromTier: 3, toTier: 4, status: "deferred",
    submittedAt: d(-336), slaDeadlineAt: d(-96),
    submittedBy: "Phan Thị Thu",
    deferReason: "Yêu cầu bổ sung 3 hạng mục: (1) Kết quả đánh giá sao quốc tế mới nhất, (2) Hợp đồng dịch vụ golf quốc tế, (3) Xác nhận đội ngũ nhân sự có chứng chỉ PGA. Thời hạn bổ sung: 14 ngày làm việc kể từ ngày nhận thông báo này.",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(88, 80, 90, 80, 78, 80, 85, 80),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-008-1", -400, "Hệ thống", "Yêu cầu nâng hạng Tier 3 → 4 tự động", "organic"),
      audit("a-008-2", -336, "Phan Thị Thu", "Hồ sơ đã nộp", "organic"),
      audit("a-008-3", -96, "Trần Văn Long", "Trì hoãn — thiếu chứng chỉ quốc tế", "organic", "Cần thêm bằng chứng tiêu chuẩn golf quốc tế"),
      audit("a-008-4", -48, "Phan Thị Thu", "Đã nhận yêu cầu bổ sung, đang xử lý", "organic"),
    ],
  },

  {
    id: "tr-009",
    facility: f("fac-109", "Khách sạn Ngọc Trai Sapa", 0, "Accommodation", "Sapa Tourism JSC", "Sa Pa, Lào Cai", 52, 55),
    fromTier: 0, toTier: 1, status: "deferred",
    submittedAt: d(-288), slaDeadlineAt: d(-120),
    submittedBy: "Cầm Thị Hoa",
    deferReason: "Chưa đáp ứng tiêu chí Gallery (ảnh chụp chuyên nghiệp còn thiếu). Yêu cầu cung cấp ít nhất 20 ảnh chụp ngoại thất và nội thất chất lượng cao theo đúng guideline của VSVN. Deadline: 10 ngày làm việc.",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(58, 60, 62, 60, 40, 60, 55, 60),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-009-1", -300, "Hệ thống", "Yêu cầu nâng hạng Tier 0 → 1 tự động", "organic"),
      audit("a-009-2", -288, "Cầm Thị Hoa", "Đăng ký lần đầu", "organic"),
      audit("a-009-3", -120, "Nguyễn Thị Bình", "Trì hoãn — ảnh gallery chưa đạt", "organic", "Thiếu ảnh chất lượng cao"),
    ],
  },

  {
    id: "tr-010",
    facility: f("fac-110", "Mường Thanh Luxury Hạ Long", 2, "Accommodation", "Mường Thanh Group", "Hạ Long, Quảng Ninh", 84, 80),
    fromTier: 2, toTier: 3, status: "pending",
    submittedAt: d(-36), slaDeadlineAt: d(12),
    submittedBy: "Trịnh Văn Đạt",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(86, 70, 84, 70, 90, 70, 82, 70),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-010-1", -48, "Hệ thống", "Yêu cầu nâng hạng Tier 2 → 3 tự động", "organic"),
      audit("a-010-2", -36, "Trịnh Văn Đạt", "Hồ sơ đã nộp — SLA còn 48h", "organic"),
    ],
  },

  {
    id: "tr-011",
    facility: f("fac-111", "Resort Cát Vàng Mũi Né", 1, "Accommodation", "Cát Vàng Resort JSC", "Mũi Né, Bình Thuận", 71, 65),
    fromTier: 1, toTier: 2, status: "pending",
    submittedAt: d(-96), slaDeadlineAt: d(96),
    submittedBy: "Bùi Thị Thanh",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(74, 70, 68, 70, 77, 70, 72, 70),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-011-1", -120, "Hệ thống", "Yêu cầu nâng hạng Tier 1 → 2 tự động", "organic"),
      audit("a-011-2", -96, "Bùi Thị Thanh", "Đã nộp hồ sơ", "organic"),
    ],
  },

  {
    id: "tr-012",
    facility: f("fac-112", "Tour Thiên Minh Hội An Heritage", 0, "Tour", "Thiên Minh Group", "Hội An, Quảng Nam", 60, 67),
    fromTier: 0, toTier: 1, status: "pending",
    submittedAt: d(-48), slaDeadlineAt: d(48),
    submittedBy: "Lý Văn Minh",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(62, 60, 65, 60, 71, 60, 60, 60),
      complianceItems: COMPLIANCE,
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

  {
    id: "tr-020",
    facility: f("fac-120", "Homestay Bình Minh Hội An", 0, "Accommodation", "Độc lập", "Hội An, Quảng Nam", 50, 58),
    fromTier: 0, toTier: 1, status: "deferred",
    submittedAt: d(-312), slaDeadlineAt: d(-144),
    submittedBy: "Trương Văn Bình",
    deferReason: "SKU danh mục phòng chưa đáp ứng mức tối thiểu (cần tối thiểu 5 loại phòng có mô tả đầy đủ và ảnh chụp). Hiện tại chỉ có 2 loại phòng. Yêu cầu bổ sung danh mục trong 10 ngày làm việc.",
    details: {
      kind: "upgrade",
      systemChecklist: checklist(55, 60, 60, 60, 52, 60, 35, 60),
      complianceItems: COMPLIANCE,
    },
    auditHistory: [
      audit("a-020-1", -336, "Hệ thống", "Yêu cầu nâng hạng Tier 0 → 1 tự động", "organic"),
      audit("a-020-2", -312, "Trương Văn Bình", "Đăng ký lần đầu", "organic"),
      audit("a-020-3", -144, "Nguyễn Thị Bình", "Trì hoãn — SKU phòng chưa đủ", "organic", "Thiếu danh mục phòng"),
    ],
  },
];
