"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users2, Layers3, Settings, Award, ChevronDown, ClipboardList,
  Shield, BookOpen, PlayCircle, PanelLeftClose, PanelLeftOpen, Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { usePortalStore } from "@/lib/store/portal-store";

const NAV = [
  {
    label: "Quản lý lead",
    icon: Users2,
    children: [
      { href: "/leads", label: "Danh sách lead" },
      { href: "/call-guide", label: "Câu hỏi gợi ý" },
      { href: "/settings/scoring", label: "Chấm điểm & xếp hạng", icon: Award },
    ],
  },
  { label: "Quản lý yêu cầu", icon: ClipboardList, children: [] },
  { label: "Quản lý task", icon: Layers3, children: [] },
  { label: "Quản lý kịch bản", icon: PlayCircle, children: [] },
  {
    label: "Quản lý đối tác",
    icon: BookOpen,
    children: [
      { href: "/agents", label: "Danh sách agent" },
      { href: "/tier-requests", label: "Yêu cầu nâng hạng" },
    ],
  },
  { label: "Quản lý phân quyền", icon: Shield, children: [] },
];

export function Sidebar() {
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

  function switchToPartner() {
    setPortal("partner");
    setSwitcherOpen(false);
    router.push("/partner/business-profile");
  }

  return (
    <aside className={cn(
      "shrink-0 border-r border-line bg-bg-lv1 flex flex-col transition-[width] duration-200 overflow-hidden",
      collapsed ? "w-[72px]" : "w-[260px]"
    )}>
      {/* Header with portal switcher */}
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
              <div className="text-cap-md font-semibold leading-tight whitespace-nowrap flex-1 min-w-0">
                Admin &amp;<br />Operation Portal
              </div>
              <ChevronDown size={12} className={cn("text-ink-3 shrink-0 transition-transform", switcherOpen && "rotate-180")} />
            </button>

            {switcherOpen && (
              <div className="absolute left-2 top-[62px] z-50 bg-bg-lv1 border border-line rounded-xl shadow-lg py-1 w-[230px]">
                <div
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-body text-ink-1 font-semibold bg-bg-lv3 rounded-lg mx-1 cursor-default"
                  style={{ width: "calc(100% - 8px)" }}
                >
                  <Check size={14} className="text-brand shrink-0" />
                  <span>Admin &amp; Operation Portal</span>
                </div>
                <button
                  onClick={switchToPartner}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-body text-ink-2 hover:bg-bg-lv3 rounded-lg mx-1 text-left"
                  style={{ width: "calc(100% - 8px)" }}
                >
                  <span className="w-4 shrink-0" />
                  <span>Partner Portal</span>
                </button>
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
        {!collapsed && <div className="px-2">
          {NAV.map((section, idx) => {
            const Icon = section.icon;
            const hasChildren = section.children.length > 0;
            const active = section.children.some((c) => path.startsWith(c.href));
            return (
              <div key={idx} className="mb-1">
                <div className={cn(
                  "flex items-center gap-2 h-10 px-3 rounded-lg cursor-pointer",
                  active ? "bg-bg-lv3 text-ink-1" : "text-ink-2 hover:bg-bg-lv3"
                )}>
                  <Icon size={18} />
                  <span className="text-body font-medium whitespace-nowrap">{section.label}</span>
                  {hasChildren && <ChevronDown size={14} className="ml-auto text-ink-3" />}
                </div>
                {hasChildren && (
                  <div className="pl-7 mt-0.5 space-y-0.5 border-l border-line ml-5">
                    {section.children.map((c) => {
                      const isActive = path === c.href || (c.href !== "/leads" && path.startsWith(c.href));
                      return (
                        <Link key={c.href} href={c.href}
                          className={cn(
                            "flex items-center gap-2 h-9 px-3 rounded-lg text-body whitespace-nowrap",
                            isActive ? "bg-ink-1/5 text-ink-1 font-semibold" : "text-ink-2 hover:bg-bg-lv3"
                          )}>
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>}

        {collapsed && <div className="flex flex-col items-center gap-1 px-2">
          {NAV.map((section, idx) => {
            const Icon = section.icon;
            const active = section.children.some((c) => path.startsWith(c.href));
            return (
              <div
                key={idx}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer",
                  active ? "bg-bg-lv3 text-ink-1" : "text-ink-2 hover:bg-bg-lv3"
                )}
                title={section.label}
              >
                <Icon size={18} />
              </div>
            );
          })}
        </div>}
      </nav>

      {/* Account */}
      <div className={cn(
        "h-[72px] border-t border-line flex items-center gap-3 px-4 shrink-0",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-9 h-9 rounded-full bg-grade-aBg text-grade-a flex items-center justify-center font-semibold shrink-0">
          A
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0">
              <div className="text-body font-medium truncate">Account name</div>
              <div className="text-cap-md text-ink-3">Sales Manager</div>
            </div>
            <Settings size={16} className="ml-auto text-ink-3" />
          </>
        )}
      </div>
    </aside>
  );
}
