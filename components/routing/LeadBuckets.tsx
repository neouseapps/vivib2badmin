"use client";
import { useState } from "react";
import type { RoutedLead } from "@/lib/scoring/types";
import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Props {
  routedLeads: RoutedLead[];
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Pending_Audit:       { label: "Chờ kiểm duyệt", cls: "bg-success-light text-success" },
  Marketing_Nurture:   { label: "Nuôi dưỡng",      cls: "bg-warn-light text-warn-text" },
  Qualified_For_Audit: { label: "Chờ hạn mức",     cls: "bg-info-light text-info" },
};

export function LeadBuckets({ routedLeads }: Props) {
  const [tab, setTab] = useState<"pending" | "nurture">("pending");

  const pending   = routedLeads.filter((r) => r.routingStatus === "Pending_Audit");
  const overflow  = routedLeads.filter((r) => r.routingStatus === "Qualified_For_Audit");
  const nurture   = routedLeads.filter((r) => r.routingStatus === "Marketing_Nurture");

  const rows = tab === "pending" ? [...pending, ...overflow] : nurture;

  return (
    <Card className="overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-line px-4 bg-bg-lv1">
        <TabBtn
          active={tab === "pending"}
          onClick={() => setTab("pending")}
          count={pending.length + overflow.length}
        >
          Pending Audit
        </TabBtn>
        <TabBtn
          active={tab === "nurture"}
          onClick={() => setTab("nurture")}
          count={nurture.length}
        >
          Marketing Nurture
        </TabBtn>
        {overflow.length > 0 && (
          <Badge intention="warning" style="light" className="ml-auto">
            {overflow.length} chờ hạn mức
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-body">
          <thead className="bg-bg-lv2 border-b border-line">
            <tr>
              <th className="text-left px-4 py-2 text-cap-md font-medium text-ink-3 whitespace-nowrap">
                Lead
              </th>
              <th className="text-right px-4 py-2 text-cap-md font-medium text-ink-3 whitespace-nowrap">
                Axis A
              </th>
              <th className="text-left px-4 py-2 text-cap-md font-medium text-ink-3 whitespace-nowrap">
                Phụ trách
              </th>
              <th className="text-center px-4 py-2 text-cap-md font-medium text-ink-3 whitespace-nowrap">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-3 text-cap-md">
                  Không có lead trong nhóm này
                </td>
              </tr>
            )}
            {rows.map(({ lead, axisAEff, routingStatus }) => {
              const s = STATUS_MAP[routingStatus] ?? { label: routingStatus, cls: "bg-bg-lv3 text-ink-3" };
              return (
                <tr key={lead.id} className="border-t border-line hover:bg-bg-lv2/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-ink-1 leading-tight">{lead.name}</div>
                    <div className="text-cap-md text-ink-3">
                      {lead.sector} · {lead.location}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="font-mono font-semibold text-ink-1">
                      {axisAEff.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-cap-md text-ink-2 whitespace-nowrap">
                    {lead.assignedTo}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge intention="neutral" className={s.cls}>{s.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TabBtn({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 h-10 px-1 mr-4 text-body font-semibold border-b-2 -mb-px",
        active
          ? "text-ink-1 border-ink-1"
          : "text-ink-3 border-transparent hover:text-ink-2"
      )}
    >
      {children}
      <Badge intention="neutral" size="sm" className={active ? "bg-ink-1 text-white" : "bg-bg-lv3 text-ink-3"}>
        {count}
      </Badge>
    </button>
  );
}
