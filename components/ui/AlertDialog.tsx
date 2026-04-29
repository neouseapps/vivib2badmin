"use client";

import { useEffect, type ReactNode } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, type LucideIcon } from "lucide-react";
import { cn } from "./lib/cva";
import { Button } from "./Button";

type AlertType = "info" | "warning" | "danger" | "success";

const iconByType: Record<AlertType, LucideIcon> = {
  info:    Info,
  warning: AlertTriangle,
  danger:  AlertCircle,
  success: CheckCircle2,
};

const colorByType: Record<AlertType, string> = {
  info:    "text-info",
  warning: "text-warn",
  danger:  "text-danger",
  success: "text-success",
};

export interface AlertDialogProps {
  open: boolean;
  type?: AlertType;
  title: ReactNode;
  description?: ReactNode;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  destructive?: boolean;
  className?: string;
}

export function AlertDialog({
  open,
  type = "info",
  title,
  description,
  primaryLabel,
  secondaryLabel = "Hủy",
  onPrimary,
  onSecondary,
  destructive,
  className,
}: AlertDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSecondary?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onSecondary]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const Icon = iconByType[type];

  return (
    <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onSecondary} aria-hidden />
      <div className={cn("relative w-full max-w-sm bg-white rounded-lg shadow-lv4 p-5 flex flex-col gap-3", className)}>
        <div className="flex items-start gap-3">
          <Icon size={24} className={cn("shrink-0 mt-0.5", colorByType[type])} />
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <h2 className="text-h4 font-semibold text-ink-1">{title}</h2>
            {description && <p className="text-body text-ink-2">{description}</p>}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          {onSecondary && (
            <Button variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          <Button variant={destructive ? "danger" : "primary"} onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
