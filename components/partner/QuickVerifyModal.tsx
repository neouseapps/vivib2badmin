"use client";

import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { QuickVerifyField } from "@/lib/mock/partnerTier";

export function QuickVerifyModal({
  facilityName,
  fields,
  onClose,
  onSubmit,
}: {
  facilityName: string;
  fields: QuickVerifyField[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = fields.every((f) => checked[f.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-1/40 backdrop-blur-sm">
      <div className="bg-bg-lv1 rounded-2xl shadow-lv2 w-[480px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h3 className="text-lg font-semibold text-ink-1">Xác nhận thông tin hồ sơ</h3>
            <p className="text-cap-md text-ink-3 mt-0.5">{facilityName}</p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <p className="text-body text-ink-2 mb-4">
            Vui lòng xác nhận các thông tin dưới đây vẫn còn chính xác:
          </p>
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
              <label
                key={field.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                  checked[field.id]
                    ? "border-success bg-success-light/40"
                    : "border-line hover:bg-bg-lv2"
                )}
              >
                <input
                  type="checkbox"
                  checked={!!checked[field.id]}
                  onChange={() =>
                    setChecked((prev) => ({ ...prev, [field.id]: !prev[field.id] }))
                  }
                  className="mt-0.5 shrink-0 accent-success"
                />
                <div className="min-w-0">
                  <div className="text-cap-md text-ink-3 mb-0.5">{field.label}</div>
                  <div className="text-body font-medium text-ink-1">{field.value}</div>
                </div>
                {checked[field.id] && (
                  <CheckCircle2 size={16} className="text-success shrink-0 ml-auto mt-0.5" />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Để sau</button>
          <button
            onClick={() => { if (allChecked) onSubmit(); }}
            disabled={!allChecked}
            className={cn("btn-primary", !allChecked && "opacity-40 cursor-not-allowed")}
          >
            Xác nhận — Vẫn chính xác
          </button>
        </div>
      </div>
    </div>
  );
}
