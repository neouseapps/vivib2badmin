"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS: { href: string; label: string; match: "exact" | "prefix" }[] = [
  { href: "/partner/my-tier",              label: "Tổng quan",       match: "exact"  },
  { href: "/partner/my-tier/sync-request", label: "Đồng bộ hạng",    match: "prefix" },
  { href: "/partner/my-tier/history",      label: "Lịch sử yêu cầu", match: "prefix" },
];

export default function MyTierLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg-lv2">
      {/* Sticky header w/ title + tabs */}
      <div className="border-b border-line bg-bg-lv1 shrink-0">
        <div className="max-w-4xl mx-auto w-full px-6 pt-6">
          <h1 className="text-h3 font-bold text-ink-1">Xếp hạng dịch vụ</h1>
          <p className="text-body text-ink-3 mt-1">
            Theo dõi phân hạng, lộ trình nâng cấp và đồng bộ hạng giữa các cơ sở
          </p>
          <nav className="flex gap-1 mt-4 -mb-px">
            {TABS.map((tab) => {
              const active =
                tab.match === "exact"
                  ? path === tab.href
                  : path.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "px-4 py-2.5 text-body font-medium border-b-2 transition-colors",
                    active
                      ? "border-brand text-ink-1"
                      : "border-transparent text-ink-3 hover:text-ink-2"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
