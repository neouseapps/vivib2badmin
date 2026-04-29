"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, ChevronDown, Eye, Pencil,
  Copy, Trash2, Columns3, Download, X, Plus, Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Badge, Card, Select } from "@/components/ui";
import {
  MOCK_POSTS,
  HIGHLIGHT_LABELS,
  type Post,
  type PostStatus,
  type PostCategory,
  type PostHighlight,
} from "@/lib/mock/posts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<PostCategory, string> = {
  ticket: "Vé tham quan",
  tour: "Tour",
  combo: "Combo",
};

const CATEGORY_STYLE: Record<PostCategory, string> = {
  ticket: "bg-info-light text-info",
  tour: "bg-success-light text-success",
  combo: "bg-warn-light text-warn-text",
};

const STATUS_LABEL: Record<PostStatus, string> = {
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
};

const STATUS_STYLE: Record<PostStatus, string> = {
  active: "bg-success-light text-success",
  draft: "bg-bg-lv3 text-ink-2",
  inactive: "bg-warn-light text-warn-text",
};

const HIGHLIGHT_STYLE: Record<NonNullable<PostHighlight>, string> = {
  best_seller: "bg-brand/10 text-brand",
  new: "bg-success-light text-success",
  limited: "bg-danger/10 text-danger",
  featured: "bg-warn-light text-warn-text",
  premium: "bg-grade-aBg text-grade-a",
  trending: "bg-info-light text-info",
};

function formatValidity(from: string | null, to: string | null): { text: string; expired?: boolean } {
  if (!from && !to) return { text: "Không giới hạn" };
  const fmt = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y.slice(2)}`;
  };
  if (to) {
    const expired = new Date(to) < new Date();
    if (expired) return { text: `Hết hạn ${fmt(to)}`, expired: true };
  }
  if (from && to) return { text: `${fmt(from)} → ${fmt(to)}` };
  if (from) return { text: `Từ ${fmt(from)}` };
  return { text: `Đến ${fmt(to!)}` };
}

// ─── All columns config ───────────────────────────────────────────────────────

type ColKey = "code" | "title" | "category" | "service" | "status" | "highlight" | "validity" | "creator" | "dates" | "log" | "actions";

const ALL_COLS: { key: ColKey; label: string; locked?: boolean }[] = [
  { key: "code",     label: "Mã bài đăng",       locked: true },
  { key: "title",    label: "Tiêu đề & SP",       locked: true },
  { key: "category", label: "Danh mục" },
  { key: "service",  label: "Service ID" },
  { key: "status",   label: "Trạng thái" },
  { key: "highlight",label: "Highlight" },
  { key: "validity", label: "Thời gian hiệu lực" },
  { key: "creator",  label: "Người tạo" },
  { key: "dates",    label: "Ngày tạo / Cập nhật" },
  { key: "log",      label: "Log activity" },
  { key: "actions",  label: "Actions",            locked: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function QFDropdown({
  label, options, selected, onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-body font-medium transition-colors",
          selected !== options[0] ? "text-ink-1" : "text-ink-2 hover:bg-bg-lv3"
        )}
      >
        <span>{selected !== options[0] ? selected : label}</span>
        <ChevronDown size={12} className={cn("text-ink-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-bg-lv1 border border-line rounded-xl shadow-lv2 py-1.5 min-w-[180px] z-20">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-body text-left transition-colors hover:bg-bg-lv2",
                opt === selected && "text-brand font-semibold"
              )}
            >
              <span>{opt}</span>
              {opt === selected && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColToggle({
  visibleCols, onToggle,
}: {
  visibleCols: Set<ColKey>;
  onToggle: (key: ColKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-body text-ink-2 hover:bg-bg-lv2 transition-colors"
      >
        <Columns3 size={13} />
        <span>Tuỳ chỉnh cột</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-bg-lv1 border border-line rounded-xl shadow-lv2 py-2 w-[220px] z-20">
          <p className="px-3 py-1 text-cap-md text-ink-3 font-semibold uppercase tracking-wide">Hiển thị / ẩn cột</p>
          {ALL_COLS.map(col => {
            const checked = visibleCols.has(col.key);
            const locked = col.locked;
            return (
              <div
                key={col.key}
                onClick={() => !locked && onToggle(col.key)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 transition-colors",
                  locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-bg-lv2"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors",
                  checked ? "bg-brand border-brand text-white" : "border-line"
                )}>
                  {checked && <Check size={9} />}
                </div>
                <span className="text-body">{col.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeleteModal({ post, onClose, onConfirm }: {
  post: Post;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/40 backdrop-blur-sm">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-[380px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="text-lg font-semibold text-ink-1">Xác nhận xoá</h3>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors p-1">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-body text-ink-2 leading-relaxed">
            Bạn có chắc muốn xoá bài đăng{" "}
            <strong className="text-ink-1">{post.title}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line">
          <Button onClick={onClose} variant="ghost">Huỷ</Button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-danger text-white text-body font-medium hover:bg-danger/90 transition-colors"
          >
            <Trash2 size={13} />
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TIME_OPTIONS = ["30 ngày trước", "7 ngày trước", "Hôm nay", "Tháng này"];
const SVC_OPTIONS = ["Tất cả kho", "SW Bà Nà Hills", "SW Núi Bà Đen", "SW Hạ Long", "SW Fansipan", "SW Đà Nẵng"];

type ActiveFilters = {
  category: string;
  status: string;
  creator: string;
  highlight: string;
};

const EMPTY_FILTERS: ActiveFilters = { category: "", status: "", creator: "", highlight: "" };

export default function PostsPage() {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState(TIME_OPTIONS[0]);
  const [svcFilter, setSvcFilter] = useState(SVC_OPTIONS[0]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(ALL_COLS.map(c => c.key)));
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const filtered = posts.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (svcFilter !== SVC_OPTIONS[0] && p.serviceId !== svcFilter.replace(/^[^\s]+ /, "SW ").replace(/[^\w\s]/g, "")) {
      if (!p.serviceId.includes(svcFilter.replace(/^[^\s]+ /, ""))) return false;
    }
    if (appliedFilters.category && p.category !== appliedFilters.category) return false;
    if (appliedFilters.status && p.status !== appliedFilters.status) return false;
    if (appliedFilters.creator && p.creatorName !== appliedFilters.creator) return false;
    if (appliedFilters.highlight && p.highlight !== appliedFilters.highlight) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleCol(key: ColKey) {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function applyFilters() {
    setAppliedFilters({ ...pendingFilters });
    setFilterOpen(false);
    setCurrentPage(1);
  }

  function resetFilters() {
    setPendingFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  }

  function removeFilter(key: keyof ActiveFilters) {
    setAppliedFilters(prev => ({ ...prev, [key]: "" }));
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(paginated.map(p => p.id)) : new Set());
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const chipEntries = Object.entries(appliedFilters).filter(([, v]) => v) as [keyof ActiveFilters, string][];

  const CATEGORY_OPTIONS = ["ticket", "tour", "combo"];
  const STATUS_OPTIONS = ["active", "draft", "inactive"];
  const CREATOR_OPTIONS = [...new Set(MOCK_POSTS.map(p => p.creatorName))];
  const HIGHLIGHT_OPTIONS = Object.keys(HIGHLIGHT_LABELS);

  return (
    <div className="flex flex-col gap-3.5 px-5 py-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-h4 font-semibold text-ink-1">Quản lý bài đăng</h1>
        <Link href="/partner/posts/new" className="btn-primary flex items-center gap-1.5">
          <Plus size={14} />
          Tạo bài đăng mới
        </Link>
      </div>

      {/* Filter bar */}
      <Card className="flex items-center gap-0 px-2 py-1.5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài đăng..."
            className="w-full pl-8 pr-3 py-2 bg-transparent text-body text-ink-1 placeholder:text-ink-4 outline-none"
          />
        </div>

        <div className="w-px h-6 bg-line flex-shrink-0 mx-1" />

        {/* Filter toggle */}
        <button
          onClick={() => setFilterOpen(v => !v)}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-body font-medium transition-colors",
            filterOpen ? "bg-brand/10 text-brand" : "text-ink-2 hover:bg-bg-lv3"
          )}
        >
          <SlidersHorizontal size={13} />
          <span>Lọc</span>
          {activeFilterCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-line flex-shrink-0 mx-1" />
        <QFDropdown label="Thời gian" options={TIME_OPTIONS} selected={timeFilter} onSelect={setTimeFilter} />
        <div className="w-px h-6 bg-line flex-shrink-0 mx-1" />
        <QFDropdown label="Kho hàng" options={SVC_OPTIONS} selected={svcFilter} onSelect={setSvcFilter} />
      </Card>

      {/* Collapsible filter panel */}
      <div className={cn(
        "card overflow-hidden transition-all duration-200",
        filterOpen ? "max-h-[400px]" : "max-h-0 border-0 shadow-none"
      )}>
        <div className="grid grid-cols-3 gap-3.5 p-4">
          {/* Danh mục */}
          <div className="flex flex-col gap-1">
            <label className="label">Danh mục</label>
            <Select
              size="sm"
              value={pendingFilters.category}
              onChange={(next) => setPendingFilters(prev => ({ ...prev, category: next }))}
              options={[
                { value: "", label: "Tất cả danh mục" },
                ...CATEGORY_OPTIONS.map(c => ({ value: c, label: CATEGORY_LABEL[c as PostCategory] })),
              ]}
            />
          </div>
          {/* Trạng thái */}
          <div className="flex flex-col gap-1">
            <label className="label">Trạng thái</label>
            <Select
              size="sm"
              value={pendingFilters.status}
              onChange={(next) => setPendingFilters(prev => ({ ...prev, status: next }))}
              options={[
                { value: "", label: "Tất cả" },
                ...STATUS_OPTIONS.map(s => ({ value: s, label: STATUS_LABEL[s as PostStatus] })),
              ]}
            />
          </div>
          {/* Người tạo */}
          <div className="flex flex-col gap-1">
            <label className="label">Người tạo</label>
            <Select
              size="sm"
              value={pendingFilters.creator}
              onChange={(next) => setPendingFilters(prev => ({ ...prev, creator: next }))}
              options={[
                { value: "", label: "Tất cả" },
                ...CREATOR_OPTIONS.map(c => ({ value: c, label: c })),
              ]}
            />
          </div>
          {/* Highlight */}
          <div className="flex flex-col gap-1">
            <label className="label">Highlight</label>
            <Select
              size="sm"
              value={pendingFilters.highlight}
              onChange={(next) => setPendingFilters(prev => ({ ...prev, highlight: next }))}
              options={[
                { value: "", label: "Tất cả" },
                ...HIGHLIGHT_OPTIONS.map(h => ({ value: h, label: HIGHLIGHT_LABELS[h as NonNullable<PostHighlight>] })),
              ]}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-line">
          <Button onClick={resetFilters} variant="ghost" className="text-cap-md">↺ Reset</Button>
          <Button onClick={applyFilters} variant="primary" className="text-cap-md">Áp dụng</Button>
        </div>
      </div>

      {/* Active filter chips */}
      {chipEntries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-cap-md text-ink-3 font-medium">Đang lọc:</span>
          {chipEntries.map(([key, val]) => {
            let displayVal = val;
            if (key === "category") displayVal = CATEGORY_LABEL[val as PostCategory];
            if (key === "status") displayVal = STATUS_LABEL[val as PostStatus];
            if (key === "highlight") displayVal = HIGHLIGHT_LABELS[val as NonNullable<PostHighlight>];
            return (
              <Badge key={key} intention="brand" style="light" className="border border-brand/20">
                {displayVal}
                <button onClick={() => removeFilter(key)} className="opacity-50 hover:opacity-100">
                  <X size={10} />
                </button>
              </Badge>
            );
          })}
          <button
            onClick={() => setAppliedFilters(EMPTY_FILTERS)}
            className="text-cap-md text-ink-3 underline hover:text-brand transition-colors"
          >
            Xoá tất cả
          </button>
        </div>
      )}

      {/* Table toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-body text-ink-2">
          Hiển thị <strong className="text-ink-1">{filtered.length}</strong> / {posts.length} bài đăng
        </p>
        <div className="flex items-center gap-2">
          <ColToggle visibleCols={visibleCols} onToggle={toggleCol} />
          <Button variant="ghost" className="text-body py-1.5">
            <Download size={13} />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg-lv2 border-b border-line">
                <th className="w-8 px-3 py-2.5 text-left">
                  <input
                    type="checkbox"
                    className="accent-brand"
                    checked={paginated.length > 0 && paginated.every(p => selectedIds.has(p.id))}
                    onChange={e => toggleSelectAll(e.target.checked)}
                  />
                </th>
                {visibleCols.has("code")     && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Mã bài đăng</th>}
                {visibleCols.has("title")    && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2">Tiêu đề & Sản phẩm</th>}
                {visibleCols.has("category") && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Danh mục</th>}
                {visibleCols.has("service")  && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Service ID</th>}
                {visibleCols.has("status")   && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Trạng thái</th>}
                {visibleCols.has("highlight")&& <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Highlight</th>}
                {visibleCols.has("validity") && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Hiệu lực</th>}
                {visibleCols.has("creator")  && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Người tạo</th>}
                {visibleCols.has("dates")    && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap cursor-pointer hover:text-ink-1">Ngày tạo ↕</th>}
                {visibleCols.has("log")      && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Log activity</th>}
                {visibleCols.has("actions")  && <th className="px-3 py-2.5 text-left text-cap-md font-semibold text-ink-2 whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginated.map(post => {
                const validity = formatValidity(post.validFrom, post.validTo);
                return (
                  <tr key={post.id} className="border-b border-line last:border-0 hover:bg-bg-lv2 transition-colors">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        className="accent-brand"
                        checked={selectedIds.has(post.id)}
                        onChange={e => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(post.id); else next.delete(post.id);
                          setSelectedIds(next);
                        }}
                      />
                    </td>

                    {visibleCols.has("code") && (
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-cap-md font-semibold text-ink-3">{post.id}</span>
                      </td>
                    )}

                    {visibleCols.has("title") && (
                      <td className="px-3 py-2.5">
                        <div className="text-body font-semibold text-ink-1 max-w-[200px] truncate">{post.title}</div>
                        <div className="text-cap-md text-ink-3 mt-0.5">
                          {post.products[0]?.emoji} {post.products[0]?.name}
                          {post.products.length > 1 && <span className="ml-1">+{post.products.length - 1} SP</span>}
                        </div>
                      </td>
                    )}

                    {visibleCols.has("category") && (
                      <td className="px-3 py-2.5">
                        <Badge intention="neutral" className={CATEGORY_STYLE[post.category]}>
                          {CATEGORY_LABEL[post.category]}
                        </Badge>
                      </td>
                    )}

                    {visibleCols.has("service") && (
                      <td className="px-3 py-2.5">
                        <Badge intention="neutral" className="bg-bg-lv3 text-ink-2 whitespace-nowrap">
                          {post.serviceEmoji} {post.serviceId}
                        </Badge>
                      </td>
                    )}

                    {visibleCols.has("status") && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <label className="relative w-8 h-4 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={post.status === "active"}
                              className="sr-only peer"
                              onChange={() => {
                                setPosts(prev => prev.map(p =>
                                  p.id === post.id
                                    ? { ...p, status: p.status === "active" ? "inactive" : "active" }
                                    : p
                                ));
                              }}
                            />
                            <div className="w-full h-full rounded-full bg-line peer-checked:bg-success transition-colors cursor-pointer" />
                            <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                          </label>
                          <Badge intention="neutral" className={STATUS_STYLE[post.status]}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {STATUS_LABEL[post.status]}
                          </Badge>
                        </div>
                      </td>
                    )}

                    {visibleCols.has("highlight") && (
                      <td className="px-3 py-2.5">
                        {post.highlight ? (
                          <Badge intention="neutral" className={HIGHLIGHT_STYLE[post.highlight]}>
                            {HIGHLIGHT_LABELS[post.highlight]}
                          </Badge>
                        ) : (
                          <span className="text-cap-md text-ink-3">—</span>
                        )}
                      </td>
                    )}

                    {visibleCols.has("validity") && (
                      <td className="px-3 py-2.5">
                        <span className={cn("text-cap-md", validity.expired ? "text-danger" : "text-ink-2")}>
                          {validity.text}
                        </span>
                      </td>
                    )}

                    {visibleCols.has("creator") && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-[9px]", post.creatorColor)}>
                            {post.creatorInitials}
                          </div>
                          <span className="text-body text-ink-1 whitespace-nowrap">{post.creatorName}</span>
                        </div>
                      </td>
                    )}

                    {visibleCols.has("dates") && (
                      <td className="px-3 py-2.5">
                        <div className="text-cap-md text-ink-1">{post.createdAt}</div>
                        <div className="text-cap-md text-ink-3 mt-0.5">{post.updatedAgo}</div>
                      </td>
                    )}

                    {visibleCols.has("log") && (
                      <td className="px-3 py-2.5">
                        <div className="relative group">
                          <div className="flex flex-col gap-0.5 max-w-[170px]">
                            {post.log.slice(0, 2).map((entry, i) => (
                              <div key={i} className="text-cap-md text-ink-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                {entry.action}{" "}
                                <span className="text-ink-3">{entry.time}</span>
                              </div>
                            ))}
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-1.5 bg-ink-1 text-white rounded-lg px-3 py-2.5 min-w-[220px] z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lv2">
                            {post.log.map((entry, i) => (
                              <div key={i} className="flex gap-2 items-start mb-1.5 last:mb-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 flex-shrink-0" />
                                <div>
                                  <div className="text-cap-md leading-relaxed">{entry.action}</div>
                                  <div className="text-[10px] text-white/50">{entry.isoTime}</div>
                                </div>
                              </div>
                            ))}
                            <div className="absolute top-full left-4 border-4 border-transparent border-t-ink-1" />
                          </div>
                        </div>
                      </td>
                    )}

                    {visibleCols.has("actions") && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg border border-line bg-bg-lv1 flex items-center justify-center text-ink-2 hover:bg-info-light hover:text-info hover:border-info/30 transition-colors" title="Preview">
                            <Eye size={12} />
                          </button>
                          <Link
                            href="/partner/posts/new"
                            className="w-7 h-7 rounded-lg border border-line bg-bg-lv1 flex items-center justify-center text-ink-2 hover:bg-bg-lv2 transition-colors"
                            title="Sửa"
                          >
                            <Pencil size={12} />
                          </Link>
                          <button className="w-7 h-7 rounded-lg border border-line bg-bg-lv1 flex items-center justify-center text-ink-2 hover:bg-bg-lv2 transition-colors" title="Clone">
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="w-7 h-7 rounded-lg border border-line bg-bg-lv1 flex items-center justify-center text-ink-2 hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors"
                            title="Xoá"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={ALL_COLS.length + 1} className="text-center py-12 text-body text-ink-3">
                    Không tìm thấy bài đăng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-line">
          <p className="text-cap-md text-ink-2">
            Trang {currentPage} / {totalPages} · Tổng {filtered.length} bài đăng
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded border border-line flex items-center justify-center text-body text-ink-2 hover:bg-bg-lv2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-7 h-7 rounded border text-body transition-colors",
                  page === currentPage
                    ? "bg-brand text-white border-brand"
                    : "border-line text-ink-2 hover:bg-bg-lv2"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded border border-line flex items-center justify-center text-body text-ink-2 hover:bg-bg-lv2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
          <Select
            className="w-auto"
            size="sm"
            value="10"
            onChange={() => {}}
            options={[
              { value: "10", label: "10 / trang" },
              { value: "20", label: "20 / trang" },
              { value: "50", label: "50 / trang" },
            ]}
          />
        </div>
      </Card>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          post={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
