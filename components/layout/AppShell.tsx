"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePortalStore } from "@/lib/store/portal-store";
import { Sidebar } from "@/components/layout/Sidebar";
import { PartnerSidebar } from "@/components/layout/PartnerSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { portal, setPortal } = usePortalStore();

  // Sync portal store with URL — URL is source of truth
  useEffect(() => {
    if (path.startsWith("/partner") && portal !== "partner") {
      setPortal("partner");
    } else if (!path.startsWith("/partner") && portal !== "admin") {
      setPortal("admin");
    }
  }, [path, portal, setPortal]);

  const activePortal = path.startsWith("/partner") ? "partner" : "admin";

  return (
    <>
      {activePortal === "admin" ? <Sidebar /> : <PartnerSidebar />}
      <main className="flex-1 min-w-0 flex flex-col bg-bg-lv2/40">{children}</main>
    </>
  );
}
