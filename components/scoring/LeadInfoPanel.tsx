"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { AuditTimeline } from "./AuditTimeline";
import type { Lead } from "@/lib/scoring/types";

const TIER_OPTIONS = [
  "Strategic Partner",
  "High Potential",
  "Volume",
  "Low Priority",
];

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex gap-2 items-center min-h-[40px]">
      <div className="w-[92px] shrink-0 text-body font-medium text-ink-1">{label}</div>
      <div className="flex-1 text-body text-ink-1">{value}</div>
    </div>
  );
}

interface InputRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function InputRow({ label, value, onChange, placeholder }: InputRowProps) {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-[92px] shrink-0 text-body font-medium text-ink-1 pt-[10px]">{label}</div>
      <div className="flex-1">
        <input
          className="input w-full h-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? label}
        />
      </div>
    </div>
  );
}

interface Props {
  lead: Lead;
}

export function LeadInfoPanel({ lead }: Props) {
  const [tab, setTab] = useState<"info" | "update">("info");
  const [contact, setContact] = useState({ name: "", role: "", phone: "", email: "" });
  const [grade, setGrade] = useState("");
  const [reason, setReason] = useState("");

  return (
    <aside className="flex flex-col border-l border-line bg-bg-lv1 w-[320px] min-h-0 overflow-hidden">
      {/* Tab switcher */}
      <div className="px-4 pt-3 shrink-0">
        <div className="flex gap-[2px] bg-bg-lv2 rounded-2xl p-[2px]">
          <button
            onClick={() => setTab("info")}
            className={cn(
              "flex-1 h-9 text-body font-semibold rounded-[14px] transition-all",
              tab === "info"
                ? "bg-white text-ink-1 shadow-sm"
                : "text-ink-2 hover:text-ink-1"
            )}
          >
            Thông tin
          </button>
          <button
            onClick={() => setTab("update")}
            className={cn(
              "flex-1 h-9 text-body font-semibold rounded-[14px] transition-all",
              tab === "update"
                ? "bg-white text-ink-1 shadow-sm"
                : "text-ink-2 hover:text-ink-1"
            )}
          >
            Cập nhật
          </button>
        </div>
      </div>

      {tab === "update" ? (
        /* Cập nhật tab — Audit Timeline */
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          <div className="text-cap-md text-ink-3">
            Hệ thống lưu toàn bộ biến động điểm (immutable audit trail).
          </div>
          <AuditTimeline entries={lead.auditLog} />
        </div>
      ) : (
        /* Thông tin tab */
        <>
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-5 space-y-6 min-h-0">
            {/* Thông tin chung */}
            <section className="space-y-3">
              <div className="text-body font-semibold text-ink-1">Thông tin chung</div>
              <div className="space-y-0 divide-y divide-line/60">
                <InfoRow label="Phiếu yêu cầu" value={lead.id} />
                <InfoRow label="Đăng ký kinh doanh" value="Đã gửi" />
                <InfoRow label="Xác minh sở hữu" value="Chưa gửi" />
              </div>
            </section>

            <div className="h-px bg-line opacity-80" />

            {/* Người liên hệ */}
            <section className="space-y-3">
              <div className="text-body font-semibold text-ink-1">Người liên hệ</div>
              <div className="space-y-3">
                <InputRow label="Họ tên" value={contact.name} onChange={(v) => setContact((p) => ({ ...p, name: v }))} />
                <InputRow label="Chức vụ" value={contact.role} onChange={(v) => setContact((p) => ({ ...p, role: v }))} />
                <InputRow label="SĐT" value={contact.phone} onChange={(v) => setContact((p) => ({ ...p, phone: v }))} />
                <InputRow label="Email" value={contact.email} onChange={(v) => setContact((p) => ({ ...p, email: v }))} />
              </div>
            </section>
          </div>

          {/* Footer — Xếp hạng lead */}
          <div className="shrink-0 border-t border-line px-4 pt-3 pb-4 space-y-3 bg-bg-lv1">
            <div className="text-body font-medium text-ink-1">Xếp hạng lead</div>
            <div className="space-y-2">
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="input w-full h-10 text-body"
              >
                <option value="">Chọn mức xếp hạng</option>
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Lý do xếp hạng"
                rows={2}
                className="input w-full resize-none text-body"
              />
            </div>
            <button
              disabled={!grade}
              className={cn(
                "btn-primary w-full h-12 text-[16px] font-semibold rounded-[14px]",
                !grade && "opacity-30 cursor-not-allowed"
              )}
            >
              Xác nhận kết quả
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
