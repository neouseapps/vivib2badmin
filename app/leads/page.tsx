"use client";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { GradeBadge } from "@/components/scoring/GradeBadge";
import { Sparkline } from "@/components/scoring/Sparkline";
import { useScoring, getLeadDerived } from "@/lib/store/scoring-store";
import { cn } from "@/lib/cn";
import { Lock, Search, Filter, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_LABEL: Record<string, string> = { COLD: "Lạnh", CONTACTED: "Đã liên hệ", ACTIVE: "Đang tương tác" };
const STATUS_STYLE: Record<string, string> = {
  COLD: "bg-bg-lv3 text-ink-3",
  CONTACTED: "bg-info-light text-info",
  ACTIVE: "bg-success/10 text-success",
};

export default function LeadsPage() {
  const leads = useScoring((s) => s.leads);
  const survey = useScoring((s) => s.survey);
  const matrix = useScoring((s) => s.matrix);
  const [q, setQ] = useState("");

  const rows = useMemo(() => leads.map((l) => ({
    lead: l,
    ...getLeadDerived(l, survey, matrix),
  })).filter((r) => r.lead.name.toLowerCase().includes(q.toLowerCase())), [leads, survey, matrix, q]);

  return (
    <>
      <Header title="Quản lý lead"/>
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"/>
            <input value={q} onChange={(e)=>setQ(e.target.value)}
              className="input pl-9" placeholder="Tìm theo tên lead…"/>
          </div>
          <button className="btn-outline"><Filter size={16}/>Lọc</button>
          <button className="btn-outline"><ArrowUpDown size={16}/>Sắp xếp</button>
          <Link href="/settings/scoring" className="btn-primary ml-auto">Cấu hình chấm điểm</Link>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-body">
            <thead className="bg-bg-lv2 border-b border-line text-cap-md text-ink-3">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Lead</th>
                <th className="text-left px-3 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-3 py-3 font-medium">Axis A</th>
                <th className="text-right px-3 py-3 font-medium">Axis B</th>
                <th className="text-center px-3 py-3 font-medium">Hạng</th>
                <th className="text-left px-3 py-3 font-medium">Xu hướng 7 ngày</th>
                <th className="text-left px-3 py-3 font-medium">Phụ trách</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ lead, axisADisplay, axisAEff, axisB, grade }) => (
                <tr key={lead.id} className="border-t border-line hover:bg-bg-lv2/50">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-1">{lead.name}</span>
                        {lead.onboarded && <Lock size={12} className="text-ink-3"/>}
                      </div>
                      <div className="text-cap text-ink-3">{lead.sector} · {lead.location}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("chip", STATUS_STYLE[lead.contactStatus])}>
                      {STATUS_LABEL[lead.contactStatus]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    <span className="font-semibold">{axisAEff.toFixed(0)}</span>
                    {axisADisplay > axisAEff && (
                      <span className="ml-1 text-cap text-warn" title={`Display ${axisADisplay} (capped)`}>
                        ⚡{axisADisplay.toFixed(0)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {lead.axisBAnswers ? axisB.toFixed(0) : <span className="text-ink-4">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center"><GradeBadge grade={grade} size="sm"/></div>
                  </td>
                  <td className="px-3 py-3">
                    <Sparkline data={lead.history} stroke="auto" width={100} height={28}/>
                  </td>
                  <td className="px-3 py-3 text-cap-md text-ink-2">{lead.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
