"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, MoreHorizontal, Pencil, Trash2, MessageSquare,
  AlertTriangle, X, Search, ChevronDown, Check,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useScoring } from "@/lib/store/scoring-store";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CallGuideSet } from "@/lib/scoring/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTORS = ["Accommodation", "F&B", "Tour", "Retail"] as const;

const SECTOR_LABELS: Record<string, string> = {
  Accommodation: "Lưu trú",
  "F&B": "F&B",
  Tour: "Lữ hành",
  Retail: "Bán lẻ",
};

const SECTOR_COLORS: Record<string, string> = {
  Accommodation: "bg-blue-50 text-blue-700 border border-blue-100",
  "F&B":         "bg-orange-50 text-orange-700 border border-orange-100",
  Tour:          "bg-green-50 text-green-700 border border-green-100",
  Retail:        "bg-purple-50 text-purple-700 border border-purple-100",
};

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-emerald-500" : "bg-zinc-200"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
        checked ? "translate-x-[18px]" : "translate-x-0.5"
      )} />
    </button>
  );
}

// ─── Dropdown base ────────────────────────────────────────────────────────────

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return { open, setOpen, ref };
}

// ─── Ngành multi-select dropdown ─────────────────────────────────────────────

function SectorDropdown({
  selected,
  onChange,
}: {
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const { open, setOpen, ref } = useDropdown();
  const count = selected.size;

  function toggle(sector: string) {
    const next = new Set(selected);
    if (next.has(sector)) next.delete(sector);
    else next.add(sector);
    onChange(next);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-9 pl-3 pr-2.5 flex items-center gap-1.5 rounded-lg border text-body transition-colors",
          open ? "border-ink-2 bg-white" : "border-line bg-white hover:border-ink-2"
        )}
      >
        <span className={count > 0 ? "text-ink-1 font-medium" : "text-ink-3"}>
          {count > 0 ? `Ngành (${count})` : "Ngành"}
        </span>
        <ChevronDown size={14} className={cn("text-ink-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-20 w-44 bg-white rounded-xl shadow-lg border border-line py-1.5 overflow-hidden">
          {count > 0 && (
            <button
              onClick={() => onChange(new Set())}
              className="w-full flex items-center justify-between px-3.5 py-2 text-cap-md text-ink-3 hover:bg-bg-lv2 transition-colors"
            >
              <span>Bỏ chọn tất cả</span>
              <X size={12} />
            </button>
          )}
          {count > 0 && <div className="border-t border-line my-1" />}
          {SECTORS.map((s) => {
            const checked = selected.has(s);
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-body hover:bg-bg-lv2 transition-colors"
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                  checked ? "bg-ink-1 border-ink-1" : "border-line"
                )}>
                  {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className={checked ? "text-ink-1 font-medium" : "text-ink-2"}>
                  {SECTOR_LABELS[s]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Trạng thái dropdown ──────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",      label: "Tất cả"   },
  { value: "active",   label: "Active"   },
  { value: "inactive", label: "Inactive" },
];

function StatusDropdown({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) {
  const { open, setOpen, ref } = useDropdown();
  const label = STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "Trạng thái";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-9 pl-3 pr-2.5 flex items-center gap-1.5 rounded-lg border text-body transition-colors",
          open ? "border-ink-2 bg-white" : "border-line bg-white hover:border-ink-2"
        )}
      >
        <span className={value !== "all" ? "text-ink-1 font-medium" : "text-ink-3"}>
          {value !== "all" ? label : "Trạng thái"}
        </span>
        <ChevronDown size={14} className={cn("text-ink-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-20 w-36 bg-white rounded-xl shadow-lg border border-line py-1.5 overflow-hidden">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-body hover:bg-bg-lv2 transition-colors"
            >
              <span className={value === opt.value ? "text-ink-1 font-medium" : "text-ink-2"}>
                {opt.label}
              </span>
              {value === opt.value && <Check size={13} className="text-ink-1" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-5 py-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body font-semibold text-ink-1">Xoá bộ câu hỏi?</div>
            <div className="text-cap-md text-ink-3 mt-1 leading-snug">
              Bộ câu hỏi <span className="font-medium text-ink-2">"{name}"</span> sẽ bị xoá vĩnh viễn và không thể khôi phục.
            </div>
          </div>
          <button onClick={onCancel} className="text-ink-3 hover:text-ink-1 p-0.5 shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 pb-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="h-8 text-cap-md">Huỷ</Button>
          <button
            onClick={onConfirm}
            className="h-8 px-4 rounded-lg text-cap-md font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CallGuidePage() {
  const router = useRouter();
  const sets = useScoring((s) => s.callGuideSets);
  const deleteSet = useScoring((s) => s.deleteCallGuideSet);
  const activateSet = useScoring((s) => s.activateCallGuideSet);
  const updateSet = useScoring((s) => s.updateCallGuideSet);

  const [search, setSearch] = useState("");
  const [sectors, setSectors] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CallGuideSet | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = sets.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (sectors.size > 0 && !sectors.has(s.sector)) return false;
    if (statusFilter === "active" && !s.active) return false;
    if (statusFilter === "inactive" && s.active) return false;
    return true;
  });

  function handleToggleActive(set: CallGuideSet) {
    if (set.active) updateSet(set.id, { active: false });
    else activateSet(set.id);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) { deleteSet(deleteTarget.id); setDeleteTarget(null); }
  }

  const hasFilter = search || sectors.size > 0 || statusFilter !== "all";

  return (
    <>
      <Header
        title="Câu hỏi gợi ý"
        actions={
          <Link href="/call-guide/new" className="btn-primary h-9">
            <Plus size={16} /> Tạo bộ mới
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
        {/* Search + filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên bộ câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-line bg-white text-body text-ink-1 placeholder:text-ink-3 outline-none focus:border-ink-2 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Ngành multi-select */}
          <SectorDropdown selected={sectors} onChange={setSectors} />

          {/* Trạng thái */}
          <StatusDropdown value={statusFilter} onChange={setStatusFilter} />

          {/* Clear all */}
          {hasFilter && (
            <button
              onClick={() => { setSearch(""); setSectors(new Set()); setStatusFilter("all"); }}
              className="h-9 px-3 flex items-center gap-1.5 text-body text-ink-3 hover:text-ink-1 transition-colors"
            >
              <X size={13} /> Xoá bộ lọc
            </button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-3">
            <MessageSquare size={36} className="opacity-30" />
            <p className="text-body">
              {hasFilter ? "Không tìm thấy bộ câu hỏi phù hợp." : "Chưa có bộ câu hỏi nào."}
            </p>
            {!hasFilter && (
              <Link href="/call-guide/new" className="btn-outline h-8 text-cap-md">
                <Plus size={12} /> Tạo bộ đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-body">
              <thead>
                <tr className="bg-bg-lv2/60 border-b border-line">
                  <th className="text-left px-5 py-3 text-cap font-semibold text-ink-3 w-[30%]">Tên bộ câu hỏi</th>
                  <th className="text-left px-4 py-3 text-cap font-semibold text-ink-3 w-[12%]">Ngành</th>
                  <th className="text-left px-4 py-3 text-cap font-semibold text-ink-3 w-[18%]">Người tạo</th>
                  <th className="text-left px-4 py-3 text-cap font-semibold text-ink-3 w-[12%]">Ngày tạo</th>
                  <th className="text-left px-4 py-3 text-cap font-semibold text-ink-3 w-[12%]">Ngày cập nhật</th>
                  <th className="text-left px-4 py-3 text-cap font-semibold text-ink-3 w-[10%]">Trạng thái</th>
                  <th className="px-4 py-3 w-[6%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((set) => {
                  const creator = set.createdBy ?? "Admin";
                  const ac = avatarColor(creator);
                  return (
                    <tr
                      key={set.id}
                      onClick={() => router.push(`/call-guide/${set.id}/edit`)}
                      className="cursor-pointer hover:bg-bg-lv2/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-ink-1">{set.name}</div>
                        <div className="text-cap-md text-ink-3 mt-0.5">{set.questions.length} câu hỏi</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center h-6 px-2 rounded-md text-[11px] font-medium", SECTOR_COLORS[set.sector])}>
                          {SECTOR_LABELS[set.sector] ?? set.sector}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0", ac)}>
                            {creator.charAt(0)}
                          </div>
                          <span className="text-ink-2 truncate">{creator}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-ink-2 tabular-nums">{formatDate(set.createdAt)}</td>
                      <td className="px-4 py-3.5 text-ink-2 tabular-nums">{formatDate(set.updatedAt)}</td>
                      <td className="px-4 py-3.5">
                        <Toggle checked={set.active} onChange={() => handleToggleActive(set)} />
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative" ref={openMenu === set.id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenu(openMenu === set.id ? null : set.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-3 hover:bg-bg-lv3 transition-colors"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenu === set.id && (
                            <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-xl shadow-lg border border-line py-1 overflow-hidden">
                              <Link
                                href={`/call-guide/${set.id}/edit`}
                                className="flex items-center gap-2.5 px-3.5 py-2.5 text-body text-ink-1 hover:bg-bg-lv2 transition-colors"
                                onClick={() => setOpenMenu(null)}
                              >
                                <Pencil size={13} className="text-ink-3" />
                                Chỉnh sửa
                              </Link>
                              <button
                                onClick={() => { setDeleteTarget(set); setOpenMenu(null); }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-body text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} />
                                Xoá bộ câu hỏi
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
