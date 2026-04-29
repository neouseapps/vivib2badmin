"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MapPin, DollarSign, Image, FileText, Package, HelpCircle,
  Globe, Clock, Tag, History, X, Search, Trash2, Pencil,
  ChevronRight, Plus, Check, GripVertical, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Badge, Card, Select } from "@/components/ui";
import { MOCK_PRODUCTS, HIGHLIGHT_LABELS, type PostProductRef, type PostHighlight } from "@/lib/mock/posts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = { id: string; title: string; content: string };
type FaqRow = { id: string; q: string; a: string };
type Locale = "vi" | "en" | "zh";

const PRODUCT_TYPE_LABEL: Record<PostProductRef["type"], string> = {
  ticket: "Vé tham quan",
  cable: "Vé cáp treo",
  combo: "Combo",
  tour: "Tour",
};

const PRODUCT_TYPE_STYLE: Record<PostProductRef["type"], string> = {
  ticket: "bg-info-light text-info",
  cable: "bg-warn-light text-warn-text",
  combo: "bg-success-light text-success",
  tour: "bg-success-light text-success",
};

const HIGHLIGHTS: { key: NonNullable<PostHighlight>; emoji: string }[] = [
  { key: "best_seller", emoji: "🔥" },
  { key: "new",         emoji: "✨" },
  { key: "limited",     emoji: "⚡" },
  { key: "featured",    emoji: "🎯" },
  { key: "premium",     emoji: "💎" },
  { key: "trending",    emoji: "🌟" },
];

const AUDIT_TRAIL = [
  { initials: "TH", color: "bg-brand",   name: "Trần Hiệp",   action: "Tạo bài đăng · Draft", time: "Hôm nay, 09:42" },
  { initials: "AN", color: "bg-success", name: "Admin Ngọc",  action: "Cập nhật markup",       time: "Hôm qua, 14:15" },
];

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function CardSection({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="overflow-visible">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-brand" />
          <span className="text-body font-semibold text-ink-1">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </Card>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function FormGroup({
  label, required, hint, children, charCount, maxChars,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  charCount?: number;
  maxChars?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="label">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
          {hint && <span className="text-cap-md text-ink-3 font-normal ml-2">{hint}</span>}
        </label>
        {maxChars !== undefined && charCount !== undefined && (
          <span className="text-cap-md text-ink-3">{charCount} / {maxChars}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Product Select Modal ─────────────────────────────────────────────────────

function ProductSelectModal({
  selectedIds,
  onClose,
  onConfirm,
}: {
  selectedIds: Set<string>;
  onClose: () => void;
  onConfirm: (ids: Set<string>) => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [localSelected, setLocalSelected] = useState(new Set(selectedIds));

  const filtered = MOCK_PRODUCTS.filter(p => {
    if (typeFilter && p.type !== typeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/40 backdrop-blur-sm">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-[620px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
          <h3 className="text-lg font-semibold text-ink-1">Chọn sản phẩm</h3>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 p-1 transition-colors"><X size={16} /></button>
        </div>
        <div className="px-5 py-3 border-b border-line flex-shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã sản phẩm..."
              className="input w-full pl-8"
            />
          </div>
          <Select
            className="w-auto"
            size="sm"
            value={typeFilter}
            onChange={(next) => setTypeFilter(next)}
            options={[
              { value: "", label: "Tất cả loại" },
              ...Object.entries(PRODUCT_TYPE_LABEL).map(([k, v]) => ({ value: k, label: v })),
            ]}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2 scrollbar-thin">
          {filtered.map(p => {
            const sel = localSelected.has(p.id);
            return (
              <div
                key={p.id}
                onClick={() => {
                  const next = new Set(localSelected);
                  if (sel) next.delete(p.id); else next.add(p.id);
                  setLocalSelected(next);
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                  sel ? "border-brand bg-brand/5" : "border-line hover:border-brand/30 hover:bg-bg-lv2"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors text-white",
                  sel ? "bg-brand border-brand" : "border-line"
                )}>
                  {sel && <Check size={11} />}
                </div>
                <div className="w-10 h-10 rounded-lg bg-bg-lv2 flex items-center justify-center text-lg flex-shrink-0">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-body font-semibold text-ink-1 truncate">{p.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-cap-md text-ink-3">{p.id}</span>
                    <span className="text-ink-4">·</span>
                    <Badge intention="neutral" className={PRODUCT_TYPE_STYLE[p.type]}>{PRODUCT_TYPE_LABEL[p.type]}</Badge>
                    <span className="text-ink-4">·</span>
                    <span className="text-cap-md text-ink-3">{p.serviceEmoji} {p.serviceId}</span>
                  </div>
                </div>
                <div className="text-body font-semibold text-brand flex-shrink-0">
                  {p.price.toLocaleString("vi-VN")} ₫
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-line flex-shrink-0">
          <span className="text-body text-ink-2">Đã chọn: <strong>{localSelected.size} sản phẩm</strong></span>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost">Huỷ</Button>
            <Button onClick={() => onConfirm(localSelected)} variant="primary">Xác nhận</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Product Modal ───────────────────────────────────────────────────────

function EditProductModal({
  product,
  onClose,
  onSave,
}: {
  product: PostProductRef;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [epSections, setEpSections] = useState<Section[]>([
    { id: "1", title: "Mô tả sản phẩm", content: `Trải nghiệm ${product.name} tuyệt vời nhất...` },
  ]);

  function addSection() {
    setEpSections(prev => [...prev, { id: String(Date.now()), title: `Section ${prev.length + 1}`, content: "" }]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/40 backdrop-blur-sm">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-[680px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-ink-1">Chỉnh sửa content sản phẩm</h3>
            <p className="text-cap-md text-ink-3 mt-0.5">Không ảnh hưởng thông tin gốc</p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 p-1 transition-colors"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 scrollbar-thin">
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Mã sản phẩm">
              <input className="input bg-bg-lv2 text-ink-3 cursor-not-allowed" value={product.id} readOnly />
            </FormGroup>
            <FormGroup label="Service ID">
              <input className="input bg-bg-lv2 text-ink-3 cursor-not-allowed" value={`${product.serviceEmoji} ${product.serviceId}`} readOnly />
            </FormGroup>
          </div>
          <FormGroup label="Tên sản phẩm (trong bài đăng này)" required>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </FormGroup>
          <FormGroup label="Media & Tags">
            <div className="border-2 border-dashed border-line rounded-lg p-3 text-center text-body text-ink-3 hover:border-brand hover:bg-brand/5 transition-colors cursor-pointer">
              + Upload ảnh sản phẩm cho bài đăng này
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge intention="info" style="light">outdoor <button className="opacity-50 hover:opacity-100"><X size={8} /></button></Badge>
              <Badge intention="success" style="light">{product.serviceId} <button className="opacity-50 hover:opacity-100"><X size={8} /></button></Badge>
              <button className="chip border border-dashed border-line text-ink-3 text-cap-md hover:border-brand hover:text-brand transition-colors">+ Tag</button>
            </div>
          </FormGroup>
          <FormGroup label="Nội dung chi tiết">
            <div className="flex flex-col gap-2">
              {epSections.map(sec => (
                <div key={sec.id} className="border border-line rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-bg-lv2 border-b border-line">
                    <GripVertical size={13} className="text-ink-3 cursor-grab" />
                    <input
                      value={sec.title}
                      onChange={e => setEpSections(prev => prev.map(s => s.id === sec.id ? { ...s, title: e.target.value } : s))}
                      className="flex-1 bg-transparent text-body font-semibold text-ink-1 outline-none"
                    />
                    <button
                      onClick={() => setEpSections(prev => prev.filter(s => s.id !== sec.id))}
                      className="w-6 h-6 rounded border border-line flex items-center justify-center text-ink-3 hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <textarea
                    value={sec.content}
                    onChange={e => setEpSections(prev => prev.map(s => s.id === sec.id ? { ...s, content: e.target.value } : s))}
                    rows={3}
                    className="w-full px-3 py-2 text-body text-ink-1 bg-transparent outline-none resize-none"
                  />
                </div>
              ))}
              <button
                onClick={addSection}
                className="w-full py-2 border border-dashed border-line rounded-lg text-body text-ink-3 hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors"
              >
                + Thêm section
              </button>
            </div>
          </FormGroup>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line flex-shrink-0">
          <Button onClick={onClose} variant="ghost">Huỷ</Button>
          <Button onClick={onSave} variant="primary">Lưu</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewPostPage() {
  const [locale, setLocale] = useState<Locale>("vi");
  const [category, setCategory] = useState("ticket");
  const [postTitle, setPostTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [markup, setMarkup] = useState(15);
  const [metaTitle, setMetaTitle] = useState("Vé tham quan Bà Nà Hills & Golden Bridge - Visit Vietnam");
  const [metaDesc, setMetaDesc] = useState("Đặt vé tham quan Bà Nà Hills và Golden Bridge ngay hôm nay. Giá tốt nhất trên Visit Vietnam App.");
  const [slug, setSlug] = useState("ve-ba-na-hills-golden-bridge");
  const [validFrom, setValidFrom] = useState("2025-06-01");
  const [validTo, setValidTo] = useState("2025-08-31");
  const [selectedBadge, setSelectedBadge] = useState<NonNullable<PostHighlight> | null>("best_seller");
  const [status, setStatus] = useState(false);

  const [sections, setSections] = useState<Section[]>([
    { id: "1", title: "Tổng quan", content: "Khám phá vẻ đẹp hoang sơ của vùng biển miền Trung..." },
  ]);
  const [faqRows, setFaqRows] = useState<FaqRow[]>([
    { id: "1", q: "Vé có thể hoàn huỷ không?", a: "Không thể hoàn huỷ trong vòng 24 giờ trước ngày tham quan." },
  ]);
  const [products, setProducts] = useState<PostProductRef[]>([
    MOCK_PRODUCTS[0], MOCK_PRODUCTS[1],
  ]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PostProductRef | null>(null);

  const [aiTags] = useState(["family-friendly", "beach"]);
  const [filterTags, setFilterTags] = useState(["Đà Nẵng", "Vé tham quan"]);

  const BASE_PRICE = 850000;
  const marketingPrice = Math.round(BASE_PRICE * (1 + markup / 100));

  function addSection() {
    setSections(prev => [...prev, { id: String(Date.now()), title: `Section ${prev.length + 1}`, content: "" }]);
  }

  function addFaqRow() {
    setFaqRows(prev => [...prev, { id: String(Date.now()), q: "", a: "" }]);
  }

  function handleProductConfirm(ids: Set<string>) {
    const selected = MOCK_PRODUCTS.filter(p => ids.has(p.id));
    setProducts(selected);
    setShowProductModal(false);
  }

  const LOCALE_TABS: { key: Locale; flag: string; label: string }[] = [
    { key: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
    { key: "en", flag: "🇬🇧", label: "English" },
    { key: "zh", flag: "🇨🇳", label: "中文" },
  ];

  return (
    <>
      {/* Page with bottom padding for fixed bar */}
      <div className="flex flex-col gap-4 px-5 py-4 pb-20">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-body text-ink-3">
          <Link href="/partner/posts" className="hover:text-brand transition-colors">Quản lý bài đăng</Link>
          <ChevronRight size={13} />
          <span className="text-ink-1 font-medium">Tạo bài đăng mới</span>
        </div>

        {/* Locale tabs */}
        <div className="flex items-center gap-2">
          {LOCALE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setLocale(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-body font-medium transition-colors",
                locale === tab.key
                  ? "bg-brand text-white border-brand"
                  : "border-line text-ink-2 hover:bg-bg-lv2"
              )}
            >
              <span>{tab.flag}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-line text-body text-ink-3 hover:border-brand hover:text-brand transition-colors">
            <Plus size={13} />
            Thêm ngôn ngữ
          </button>
        </div>

        {/* 2-column layout */}
        <div className="flex gap-4 items-start">

          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* 1. Định danh */}
            <CardSection icon={MapPin} title="Thông tin định danh">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FormGroup label="Danh mục" required>
                    <Select
                      size="sm"
                      value={category}
                      onChange={(next) => setCategory(next)}
                      options={[
                        { value: "ticket", label: "Vé tham quan" },
                        { value: "tour", label: "Tour" },
                        { value: "combo", label: "Combo" },
                      ]}
                    />
                  </FormGroup>
                </div>
                <FormGroup label="Mã bài đăng" hint="Auto">
                  <input className="input bg-bg-lv2 text-ink-3 cursor-not-allowed" value="VVP-2025-0043" readOnly />
                </FormGroup>
              </div>
              <FormGroup label="Tiêu đề" required charCount={postTitle.length} maxChars={120}>
                <input
                  className="input"
                  placeholder="Nhập tiêu đề bài đăng..."
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value.slice(0, 120))}
                />
              </FormGroup>
              <FormGroup label="Mô tả ngắn" required charCount={shortDesc.length} maxChars={300}>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Mô tả ngắn gọn..."
                  value={shortDesc}
                  onChange={e => setShortDesc(e.target.value.slice(0, 300))}
                />
              </FormGroup>
            </CardSection>

            {/* 2. Giá */}
            <CardSection icon={DollarSign} title="Cấu hình giá hiển thị">
              <div className="flex items-start gap-2 rounded-xl bg-warn-light border border-warn/30 px-3 py-2.5">
                <AlertTriangle size={14} className="text-warn-text shrink-0 mt-0.5" />
                <p className="text-body text-warn-text">Giá nhập đồng bộ từ eCommerce — chỉ điều chỉnh markup hiển thị trên App.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormGroup label="Giá nhập (eCom)">
                  <input className="input bg-bg-lv2 text-ink-3 cursor-not-allowed" value="850,000 VND" readOnly />
                </FormGroup>
                <FormGroup label="Markup (%)" required>
                  <input
                    type="number"
                    className="input"
                    value={markup}
                    onChange={e => setMarkup(Number(e.target.value))}
                  />
                </FormGroup>
                <FormGroup label="Giá Marketing">
                  <input className="input bg-bg-lv2 text-ink-3 cursor-not-allowed" value={`${marketingPrice.toLocaleString("vi-VN")} VND`} readOnly />
                </FormGroup>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand/10 border border-dashed border-brand/30 px-4 py-3">
                <span className="text-body text-brand font-medium">Giá hiển thị trên App</span>
                <span className="text-h4 font-bold text-brand">{marketingPrice.toLocaleString("vi-VN")} VND</span>
              </div>
            </CardSection>

            {/* 3. Media & Tags */}
            <CardSection icon={Image} title="Media & Tags">
              <FormGroup label="Thumbnail" required>
                <div className="border-2 border-dashed border-line rounded-lg p-5 text-center hover:border-brand hover:bg-brand/5 transition-colors cursor-pointer">
                  <div className="text-2xl mb-1.5">🖼</div>
                  <p className="text-body text-ink-2">Kéo thả hoặc click để upload</p>
                  <p className="text-cap-md text-ink-3 mt-0.5">PNG, JPG · Min 800×600px · Max 5MB</p>
                </div>
              </FormGroup>
              <FormGroup label="Gallery">
                <div className="grid grid-cols-5 gap-2 mt-1">
                  <div className="aspect-square rounded-lg overflow-hidden relative border border-line">
                    <div className="w-full h-full bg-gradient-to-br from-[#E8D5C4] to-[#C8A882] flex items-center justify-center text-2xl">🏖</div>
                    <span className="absolute top-1 left-1 bg-brand text-white text-[9px] font-bold px-1 py-0.5 rounded">Main</span>
                    <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ink-1/50 text-white flex items-center justify-center text-[9px]">×</button>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden relative border border-line">
                    <div className="w-full h-full bg-gradient-to-br from-[#C4D8E8] to-[#82A8C8] flex items-center justify-center text-2xl">🌊</div>
                    <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ink-1/50 text-white flex items-center justify-center text-[9px]">×</button>
                  </div>
                  <div className="aspect-square rounded-lg border-2 border-dashed border-line flex items-center justify-center flex-col gap-1 cursor-pointer hover:border-brand transition-colors">
                    <Plus size={16} className="text-ink-3" />
                    <span className="text-[9px] text-ink-3">Thêm</span>
                  </div>
                </div>
              </FormGroup>
              <FormGroup label="AI Tags" hint="Auto · có thể chỉnh">
                <div className="flex flex-wrap gap-1.5">
                  {aiTags.map(tag => (
                    <Badge key={tag} intention="info" style="light">
                      🤖 {tag}
                      <button className="opacity-50 hover:opacity-100"><X size={8} /></button>
                    </Badge>
                  ))}
                  <button className="chip border border-dashed border-line text-ink-3 text-cap-md hover:border-brand hover:text-brand transition-colors">+ Thêm</button>
                </div>
              </FormGroup>
              <FormGroup label="Filter Tags">
                <div className="flex flex-wrap gap-1.5">
                  {filterTags.map(tag => (
                    <Badge key={tag} intention="success" style="light">
                      {tag}
                      <button onClick={() => setFilterTags(prev => prev.filter(t => t !== tag))} className="opacity-50 hover:opacity-100"><X size={8} /></button>
                    </Badge>
                  ))}
                  <button className="chip border border-dashed border-line text-ink-3 text-cap-md hover:border-brand hover:text-brand transition-colors">+ Thêm</button>
                </div>
              </FormGroup>
            </CardSection>

            {/* 4. Nội dung */}
            <CardSection icon={FileText} title="Nội dung bài đăng">
              {sections.map(sec => (
                <div key={sec.id} className="border border-line rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-bg-lv2 border-b border-line">
                    <GripVertical size={13} className="text-ink-3 cursor-grab" />
                    <input
                      value={sec.title}
                      onChange={e => setSections(prev => prev.map(s => s.id === sec.id ? { ...s, title: e.target.value } : s))}
                      className="flex-1 bg-transparent text-body font-semibold text-ink-1 outline-none"
                    />
                    <button
                      onClick={() => setSections(prev => prev.filter(s => s.id !== sec.id))}
                      className="w-6 h-6 rounded border border-line flex items-center justify-center text-ink-3 hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <textarea
                    value={sec.content}
                    onChange={e => setSections(prev => prev.map(s => s.id === sec.id ? { ...s, content: e.target.value } : s))}
                    rows={3}
                    className="w-full px-3 py-2.5 text-body text-ink-1 bg-transparent outline-none resize-none"
                    placeholder="Nhập nội dung..."
                  />
                </div>
              ))}
              <button
                onClick={addSection}
                className="w-full py-2 border border-dashed border-line rounded-lg text-body text-ink-3 hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors"
              >
                + Thêm section
              </button>
            </CardSection>

            {/* 5. Sản phẩm */}
            <CardSection
              icon={Package}
              title="Danh sách sản phẩm"
              action={<span className="text-cap-md text-ink-3">Kéo thả để sắp xếp</span>}
            >
              <div className="flex items-start gap-2 rounded-xl bg-warn-light border border-warn/30 px-3 py-2.5">
                <AlertTriangle size={14} className="text-warn-text shrink-0 mt-0.5" />
                <p className="text-body text-warn-text">Chỉnh sửa content tại đây không ảnh hưởng đến thông tin gốc.</p>
              </div>
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-3 border border-line rounded-xl px-3 py-2.5">
                  <div className="w-11 h-11 rounded-lg bg-bg-lv2 flex items-center justify-center text-xl flex-shrink-0">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body font-semibold text-ink-1 truncate">{p.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-cap-md text-ink-3">{p.id}</span>
                      <span className="text-ink-4">·</span>
                      <Badge intention="neutral" className={PRODUCT_TYPE_STYLE[p.type]}>{PRODUCT_TYPE_LABEL[p.type]}</Badge>
                      <span className="text-ink-4">·</span>
                      <span className="text-cap-md text-ink-3">{p.serviceEmoji} {p.serviceId}</span>
                      <span className="text-ink-4">·</span>
                      <span className="text-cap-md text-brand font-semibold">{p.price.toLocaleString("vi-VN")} VND</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="w-7 h-7 rounded border border-line flex items-center justify-center text-ink-2 hover:bg-bg-lv2 transition-colors"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => setProducts(prev => prev.filter(x => x.id !== p.id))}
                      className="w-7 h-7 rounded border border-line flex items-center justify-center text-ink-2 hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowProductModal(true)}
                className="w-full py-2 border border-dashed border-line rounded-lg text-body text-ink-3 hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors"
              >
                + Thêm sản phẩm từ danh mục
              </button>
            </CardSection>

            {/* 6. FAQ */}
            <CardSection icon={HelpCircle} title="FAQ">
              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-lv2 border-b border-line">
                      <th className="px-3 py-2 text-left text-cap-md font-semibold text-ink-2 w-[42%]">Câu hỏi</th>
                      <th className="px-3 py-2 text-left text-cap-md font-semibold text-ink-2">Câu trả lời</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {faqRows.map(row => (
                      <tr key={row.id}>
                        <td className="p-1 border-r border-line">
                          <textarea
                            value={row.q}
                            onChange={e => setFaqRows(prev => prev.map(r => r.id === row.id ? { ...r, q: e.target.value } : r))}
                            className="w-full text-body text-ink-1 bg-transparent outline-none px-2 py-1.5 resize-none min-h-[48px]"
                            placeholder="Nhập câu hỏi..."
                          />
                        </td>
                        <td className="p-1 border-r border-line">
                          <textarea
                            value={row.a}
                            onChange={e => setFaqRows(prev => prev.map(r => r.id === row.id ? { ...r, a: e.target.value } : r))}
                            className="w-full text-body text-ink-1 bg-transparent outline-none px-2 py-1.5 resize-none min-h-[48px]"
                            placeholder="Nhập câu trả lời..."
                          />
                        </td>
                        <td className="px-2 text-center">
                          <button
                            onClick={() => setFaqRows(prev => prev.filter(r => r.id !== row.id))}
                            className="w-7 h-7 rounded border border-line flex items-center justify-center mx-auto text-ink-3 hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={addFaqRow}
                className="w-full py-2 border border-dashed border-line rounded-lg text-body text-ink-3 hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors"
              >
                + Thêm câu hỏi
              </button>
            </CardSection>

            {/* 7. SEO */}
            <CardSection icon={Globe} title="SEO & Xuất bản">
              <FormGroup label="Meta title" charCount={metaTitle.length} maxChars={60}>
                <input className="input" value={metaTitle} onChange={e => setMetaTitle(e.target.value.slice(0, 60))} />
              </FormGroup>
              <FormGroup label="Meta description" charCount={metaDesc.length} maxChars={160}>
                <textarea className="input resize-none" rows={2} value={metaDesc} onChange={e => setMetaDesc(e.target.value.slice(0, 160))} />
              </FormGroup>
              <FormGroup label="Slug URL">
                <div className="flex items-center border border-line rounded-lg overflow-hidden">
                  <span className="px-3 py-2 bg-bg-lv2 text-ink-3 text-body border-r border-line whitespace-nowrap">visitvietnam.vn/p/</span>
                  <input className="flex-1 px-3 py-2 text-body text-ink-1 bg-transparent outline-none" value={slug} onChange={e => setSlug(e.target.value)} />
                </div>
              </FormGroup>
              {/* SEO preview */}
              <div className="rounded-xl border border-line bg-bg-lv2 px-4 py-3">
                <div className="text-body text-info font-medium mb-0.5 truncate">{metaTitle}</div>
                <div className="text-cap-md text-success mb-1 truncate">visitvietnam.vn/p/{slug}</div>
                <div className="text-body text-ink-2 leading-relaxed line-clamp-2">{metaDesc}</div>
              </div>
            </CardSection>
          </div>

          {/* ── Side column ── */}
          <div className="w-[268px] flex-shrink-0 flex flex-col gap-4">

            {/* Thời gian hiệu lực */}
            <CardSection icon={Clock} title="Thời gian hiệu lực">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-cap-md text-ink-3 mb-1">Từ ngày</p>
                  <input type="date" className="input w-full" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
                </div>
                <div>
                  <p className="text-cap-md text-ink-3 mb-1">Đến ngày</p>
                  <input type="date" className="input w-full" value={validTo} onChange={e => setValidTo(e.target.value)} />
                </div>
              </div>
              <p className="text-cap-md text-ink-3">Để trống = không giới hạn</p>
            </CardSection>

            {/* Highlight / Badge */}
            <CardSection icon={Tag} title="Highlight / Badge">
              <div className="grid grid-cols-2 gap-2">
                {HIGHLIGHTS.map(h => (
                  <button
                    key={h.key}
                    onClick={() => setSelectedBadge(prev => prev === h.key ? null : h.key)}
                    className={cn(
                      "py-2 px-2 rounded-lg border text-body font-medium text-center transition-colors",
                      selectedBadge === h.key
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-line text-ink-2 hover:border-brand/30 hover:text-ink-1"
                    )}
                  >
                    {h.emoji} {HIGHLIGHT_LABELS[h.key]}
                  </button>
                ))}
              </div>
            </CardSection>

            {/* Lịch sử */}
            <CardSection icon={History} title="Lịch sử">
              {AUDIT_TRAIL.map((entry, i) => (
                <div key={i}>
                  {i > 0 && <div className="h-px bg-line my-2" />}
                  <div className="flex items-start gap-2.5">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-cap-md flex-shrink-0", entry.color)}>
                      {entry.initials}
                    </div>
                    <div>
                      <div className="text-body font-semibold text-ink-1">{entry.name}</div>
                      <div className="text-cap-md text-ink-3">{entry.action}</div>
                      <div className="text-cap-md text-ink-3 mt-0.5">{entry.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardSection>
          </div>
        </div>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-[260px] right-0 h-14 bg-bg-lv1 border-t border-line flex items-center justify-between px-5 z-30">
        <div className="flex items-center gap-2.5">
          <label className="relative w-8 h-4 flex-shrink-0">
            <input type="checkbox" checked={status} onChange={e => setStatus(e.target.checked)} className="sr-only peer" />
            <div className="w-full h-full rounded-full bg-line peer-checked:bg-success transition-colors cursor-pointer" />
            <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </label>
          <span className="text-body text-ink-2 font-medium">Trạng thái:</span>
          <span className={cn("text-body font-semibold", status ? "text-success" : "text-ink-3")}>
            {status ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/partner/posts" className="btn-ghost flex items-center gap-1.5">
            ← Quay lại
          </Link>
          <Button variant="ghost">
            <Eye size={13} />
            Preview
          </Button>
          <Button variant="ghost">
            <Save size={13} />
            Lưu nháp
          </Button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-white text-body font-medium hover:bg-success/90 transition-colors">
            <Check size={13} />
            Xuất bản
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductSelectModal
          selectedIds={new Set(products.map(p => p.id))}
          onClose={() => setShowProductModal(false)}
          onConfirm={handleProductConfirm}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}

function Eye({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function Save({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
