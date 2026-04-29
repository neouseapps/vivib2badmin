export type PostStatus = "active" | "draft" | "inactive";
export type PostCategory = "ticket" | "tour" | "combo";
export type PostHighlight =
  | "best_seller"
  | "new"
  | "limited"
  | "featured"
  | "premium"
  | "trending"
  | null;

export type PostProductRef = {
  id: string;
  name: string;
  emoji: string;
  type: "ticket" | "cable" | "combo" | "tour";
  serviceId: string;
  serviceEmoji: string;
  price: number;
};

export type PostLogEntry = {
  actor: string;
  initials: string;
  action: string;
  time: string;
  isoTime: string;
};

export type Post = {
  id: string;
  title: string;
  category: PostCategory;
  serviceId: string;
  serviceEmoji: string;
  status: PostStatus;
  highlight: PostHighlight;
  validFrom: string | null;
  validTo: string | null;
  creatorName: string;
  creatorInitials: string;
  creatorColor: string;
  createdAt: string;
  updatedAt: string;
  updatedAgo: string;
  products: PostProductRef[];
  log: PostLogEntry[];
};

export const HIGHLIGHT_LABELS: Record<NonNullable<PostHighlight>, string> = {
  best_seller: "Best Seller",
  new: "New",
  limited: "Limited",
  featured: "Featured",
  premium: "Premium",
  trending: "Trending",
};

export const MOCK_PRODUCTS: PostProductRef[] = [
  {
    id: "SP-001",
    name: "Vé tham quan khu vui chơi Bà Nà Hills",
    emoji: "🎡",
    type: "ticket",
    serviceId: "SW Bà Nà Hills",
    serviceEmoji: "🌋",
    price: 850000,
  },
  {
    id: "SP-002",
    name: "Vé cáp treo Golden Bridge",
    emoji: "🚡",
    type: "cable",
    serviceId: "SW Bà Nà Hills",
    serviceEmoji: "🌋",
    price: 650000,
  },
  {
    id: "SP-003",
    name: "Show diễn Fantasy Park",
    emoji: "🎭",
    type: "ticket",
    serviceId: "SW Bà Nà Hills",
    serviceEmoji: "🌋",
    price: 300000,
  },
  {
    id: "SP-004",
    name: "Combo Bà Nà Hills Full Day",
    emoji: "🎪",
    type: "combo",
    serviceId: "SW Bà Nà Hills",
    serviceEmoji: "🌋",
    price: 1200000,
  },
  {
    id: "SP-005",
    name: "Tour Ngũ Hành Sơn & Hội An",
    emoji: "🏄",
    type: "tour",
    serviceId: "SW Đà Nẵng",
    serviceEmoji: "🌊",
    price: 750000,
  },
  {
    id: "SP-006",
    name: "Vé du thuyền Hạ Long",
    emoji: "🚢",
    type: "ticket",
    serviceId: "SW Hạ Long",
    serviceEmoji: "🏖",
    price: 1500000,
  },
  {
    id: "SP-007",
    name: "Vé cáp treo Fansipan",
    emoji: "🚡",
    type: "cable",
    serviceId: "SW Fansipan",
    serviceEmoji: "🏔",
    price: 900000,
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "VVP-2025-0042",
    title: "Khám phá Bà Nà Hills trọn ngày",
    category: "ticket",
    serviceId: "SW Bà Nà Hills",
    serviceEmoji: "🌋",
    status: "active",
    highlight: "best_seller",
    validFrom: "2025-06-01",
    validTo: "2025-08-31",
    creatorName: "Trần Hiệp",
    creatorInitials: "TH",
    creatorColor: "bg-brand",
    createdAt: "28/04/2025",
    updatedAt: "28/04/2025",
    updatedAgo: "2h trước",
    products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]],
    log: [
      {
        actor: "Trần Hiệp",
        initials: "TH",
        action: "TH cập nhật markup",
        time: "2h trước",
        isoTime: "28/04/2025 09:42",
      },
      {
        actor: "Admin Ngọc",
        initials: "AN",
        action: "AN duyệt catalog",
        time: "hôm qua",
        isoTime: "27/04/2025 14:15",
      },
      {
        actor: "Trần Hiệp",
        initials: "TH",
        action: "TH tạo bài đăng",
        time: "2 ngày trước",
        isoTime: "26/04/2025 10:00",
      },
    ],
  },
  {
    id: "VVP-2025-0041",
    title: "Tour Hạ Long 2N1Đ",
    category: "tour",
    serviceId: "SW Hạ Long",
    serviceEmoji: "🏖",
    status: "draft",
    highlight: null,
    validFrom: null,
    validTo: null,
    creatorName: "Admin Ngọc",
    creatorInitials: "AN",
    creatorColor: "bg-success",
    createdAt: "25/04/2025",
    updatedAt: "25/04/2025",
    updatedAgo: "3 ngày trước",
    products: [MOCK_PRODUCTS[5]],
    log: [
      {
        actor: "Admin Ngọc",
        initials: "AN",
        action: "AN tạo bài đăng · Draft",
        time: "3 ngày trước",
        isoTime: "25/04/2025 11:20",
      },
    ],
  },
  {
    id: "VVP-2025-0038",
    title: "Combo Fansipan Summit",
    category: "combo",
    serviceId: "SW Fansipan",
    serviceEmoji: "🏔",
    status: "active",
    highlight: "new",
    validFrom: "2025-05-01",
    validTo: "2025-09-30",
    creatorName: "Lê Minh",
    creatorInitials: "LM",
    creatorColor: "bg-info",
    createdAt: "20/04/2025",
    updatedAt: "20/04/2025",
    updatedAgo: "1 tuần trước",
    products: [MOCK_PRODUCTS[6], MOCK_PRODUCTS[2]],
    log: [
      {
        actor: "Lê Minh",
        initials: "LM",
        action: "LM xuất bản",
        time: "1 tuần trước",
        isoTime: "20/04/2025 16:30",
      },
      {
        actor: "Lê Minh",
        initials: "LM",
        action: "LM cập nhật nội dung",
        time: "1 tuần trước",
        isoTime: "20/04/2025 15:10",
      },
      {
        actor: "Lê Minh",
        initials: "LM",
        action: "LM tạo bài đăng · Draft",
        time: "1 tuần trước",
        isoTime: "19/04/2025 09:00",
      },
    ],
  },
  {
    id: "VVP-2025-0035",
    title: "Vé tham quan Núi Bà Đen",
    category: "ticket",
    serviceId: "SW Núi Bà Đen",
    serviceEmoji: "⛰",
    status: "inactive",
    highlight: "featured",
    validFrom: null,
    validTo: "2025-04-15",
    creatorName: "Trần Hiệp",
    creatorInitials: "TH",
    creatorColor: "bg-brand",
    createdAt: "10/03/2025",
    updatedAt: "15/04/2025",
    updatedAgo: "2 tuần trước",
    products: [MOCK_PRODUCTS[0]],
    log: [
      {
        actor: "Hệ thống",
        initials: "HT",
        action: "Auto Inactive · hết hạn",
        time: "2 tuần trước",
        isoTime: "15/04/2025 00:00",
      },
      {
        actor: "Trần Hiệp",
        initials: "TH",
        action: "TH xuất bản",
        time: "1 tháng trước",
        isoTime: "10/03/2025 08:30",
      },
    ],
  },
  {
    id: "VVP-2025-0031",
    title: "Trải nghiệm Đà Nẵng Weekend",
    category: "combo",
    serviceId: "SW Đà Nẵng",
    serviceEmoji: "🌊",
    status: "active",
    highlight: "trending",
    validFrom: "2025-04-15",
    validTo: "2025-10-15",
    creatorName: "Admin Ngọc",
    creatorInitials: "AN",
    creatorColor: "bg-success",
    createdAt: "01/04/2025",
    updatedAt: "27/04/2025",
    updatedAgo: "hôm qua",
    products: [MOCK_PRODUCTS[4], MOCK_PRODUCTS[2], MOCK_PRODUCTS[3]],
    log: [
      {
        actor: "Admin Ngọc",
        initials: "AN",
        action: "AN thêm badge Trending",
        time: "hôm qua",
        isoTime: "27/04/2025 10:05",
      },
      {
        actor: "Admin Ngọc",
        initials: "AN",
        action: "AN xuất bản bài đăng",
        time: "15/04",
        isoTime: "15/04/2025 09:00",
      },
      {
        actor: "Admin Ngọc",
        initials: "AN",
        action: "AN tạo bài đăng · Draft",
        time: "1 tháng trước",
        isoTime: "01/04/2025 11:30",
      },
    ],
  },
];
