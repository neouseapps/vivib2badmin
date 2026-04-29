"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

type SnackbarType = "info" | "success" | "warning" | "error";

const snackStyles = cva(
  "inline-flex items-start gap-3 rounded-lg text-white shadow-lv3",
  {
    variants: {
      type: {
        info:    "bg-info",
        success: "bg-success",
        warning: "bg-warn",
        error:   "bg-danger",
      },
      size: {
        sm: "p-2.5 text-cap-md",
        md: "p-3 text-body",
      },
    },
    defaultVariants: { type: "info", size: "md" },
  }
);

const iconByType: Record<SnackbarType, LucideIcon> = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   AlertCircle,
};

export interface SnackbarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof snackStyles> {
  message: ReactNode;
  action?: ReactNode;
  showIcon?: boolean;
  onDismiss?: () => void;
}

export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(function Snackbar(
  { className, type = "info", size = "md", message, action, showIcon = true, onDismiss, ...rest },
  ref
) {
  const Icon = iconByType[type ?? "info"];
  const iconSize = size === "sm" ? 14 : 16;
  return (
    <div ref={ref} role="status" className={cn(snackStyles({ type, size }), className)} {...rest}>
      {showIcon && <Icon size={iconSize} className="shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">{message}</div>
      {action && <div className="shrink-0">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <X size={iconSize} />
        </button>
      )}
    </div>
  );
});
