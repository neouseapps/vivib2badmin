"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings, ChevronDown, Check, PanelLeftClose, PanelLeftOpen,
  LayoutGrid, FileText, Diamond, TrendingUp, BarChart2, Users, Newspaper,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { usePortalStore } from "@/lib/store/portal-store";

type NavChild = { href: string; label: string };
type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];
};

const NAV: NavItem[] = [
  {
    label: "Tổng quan",
    icon: LayoutGrid,
    children: [
      { href: "/partner/overview/registration", label: "Đăng ký lead" },
    ],
  },
  {
    label: "Hồ sơ & Dịch vụ",
    icon: FileText,
    children: [
      { href: "/partner/services-v2", label: "Dịch vụ & Xếp hạng" },
    ],
  },
  {
    label: "Nội dung",
    icon: Newspaper,
    children: [
      { href: "/partner/posts", label: "Bài đăng" },
    ],
  },
  {
    label: "Kho hàng & Giá",
    icon: Diamond,
    children: [
      { href: "/partner/inventory/tasks", label: "Task" },
    ],
  },
  {
    label: "Hiệu quả",
    icon: TrendingUp,
    children: [
      { href: "/partner/performance/scenarios", label: "Danh sách kịch bản" },
    ],
  },
  {
    label: "Thị trường",
    icon: BarChart2,
    children: [
      { href: "/partner/market/scenarios", label: "Danh sách kịch bản" },
    ],
  },
  {
    label: "Quản lý phân quyền",
    icon: Users,
    children: [
      { href: "/partner/permissions/staff", label: "Nhân sự" },
      { href: "/partner/permissions/roles", label: "Vai trò" },
    ],
  },
];

function NavSection({
  item,
  path,
  collapsed,
}: {
  item: NavItem;
  path: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  const isActive = item.href
    ? path === item.href || path.startsWith(item.href + "/")
    : item.children?.some((c) => path.startsWith(c.href)) ?? false;

  const [open, setOpen] = useState(isActive);

  if (collapsed) {
    return (
      <div
        title={item.label}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer",
          isActive ? "bg-bg-lv3 text-ink-1" : "text-ink-2 hover:bg-bg-lv3"
        )}
      >
        <Icon size={18} />
      </div>
    );
  }

  // Leaf item (no children)
  if (!hasChildren && item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2 h-12 px-3 rounded-xl text-body whitespace-nowrap transition-all",
          isActive
            ? "bg-bg-lv1 shadow-lv1 text-ink-1 font-medium"
            : "text-ink-2 hover:bg-bg-lv3"
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  }

  // Section with children
  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 h-12 px-3 rounded-xl text-body whitespace-nowrap w-full text-left transition-colors",
          isActive ? "text-ink-1" : "text-ink-2 hover:bg-bg-lv3"
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="flex-1 min-w-0">{item.label}</span>
        <ChevronDown
          size={14}
          className={cn(
            "text-ink-3 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col">
          {item.children?.map((child) => {
            const childActive = path.startsWith(child.href);
            return (
              <div key={child.href} className="flex h-12 items-center">
                {/* Left border line */}
                <div className="w-8 shrink-0 h-full flex items-center justify-center pl-4">
                  <div className="w-px h-full bg-line-strong" />
                </div>
                <Link
                  href={child.href}
                  className={cn(
                    "flex-1 min-w-0 flex items-center h-11 px-3 rounded-xl text-body whitespace-nowrap transition-colors",
                    childActive
                      ? "bg-ink-1/5 text-ink-1 font-semibold"
                      : "text-ink-2 hover:bg-bg-lv3"
                  )}
                >
                  {child.label}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PartnerSidebar() {
  const path = usePathname();
  const router = useRouter();
  const setPortal = usePortalStore((s) => s.setPortal);
  const [collapsed, setCollapsed] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchToAdmin() {
    setPortal("admin");
    setSwitcherOpen(false);
    router.push("/leads");
  }

  return (
    <aside className={cn(
      "shrink-0 border-r border-line bg-bg-lv1 flex flex-col transition-[width] duration-200 overflow-hidden",
      collapsed ? "w-[72px]" : "w-[260px]"
    )}>
      {/* Header / Portal switcher */}
      <div className={cn(
        "h-[60px] flex items-center gap-2 px-4 border-b border-line shrink-0 relative",
        collapsed && "justify-center px-0"
      )}>
        {!collapsed && (
          <div ref={switcherRef} className="flex-1 min-w-0">
            <button
              onClick={() => setSwitcherOpen((v) => !v)}
              className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
                <span className="text-white text-cap-md font-bold">VV</span>
              </div>
              <span className="text-cap-md font-semibold leading-tight whitespace-nowrap flex-1 min-w-0">
                Partner Portal
              </span>
              <ChevronDown
                size={12}
                className={cn("text-ink-3 shrink-0 transition-transform", switcherOpen && "rotate-180")}
              />
            </button>

            {switcherOpen && (
              <div className="absolute left-2 top-[62px] z-50 bg-bg-lv1 border border-line rounded-xl shadow-lv2 py-1 w-[232px]">
                <button
                  onClick={switchToAdmin}
                  className="flex items-center gap-2 px-3 py-2.5 text-body text-ink-2 hover:bg-bg-lv3 rounded-lg w-[calc(100%-8px)] mx-1 text-left"
                >
                  <span className="w-4 shrink-0" />
                  <span>Admin &amp; Operation Portal</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-2.5 text-body text-ink-1 font-semibold bg-bg-lv3 rounded-lg w-[calc(100%-8px)] mx-1">
                  <Check size={14} className="text-brand shrink-0" />
                  <span>Partner Portal</span>
                </div>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn("text-ink-3 hover:text-ink-1 shrink-0", !collapsed && "ml-auto")}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        <div className={cn("px-2 flex flex-col gap-0.5", collapsed && "items-center")}>
          {NAV.map((item) => (
            <NavSection
              key={item.label}
              item={item}
              path={path}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* Account footer */}
      <div className={cn(
        "h-[72px] border-t border-line flex items-center gap-3 px-4 shrink-0",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-9 h-9 rounded-full bg-grade-aBg text-grade-a flex items-center justify-center font-semibold shrink-0">
          P
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0">
              <div className="text-body font-medium truncate">Tập đoàn Mặt Trời</div>
              <div className="text-cap-md text-ink-3">Đối tác</div>
            </div>
            <Settings size={16} className="ml-auto text-ink-3 shrink-0" />
          </>
        )}
      </div>
    </aside>
  );
}
