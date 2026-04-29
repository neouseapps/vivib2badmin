"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

const messageStyles = cva("flex items-start gap-2 rounded-md border", {
  variants: {
    type: {
      info:    "bg-info-light/40 border-info/20 text-info",
      success: "bg-success-light border-success/20 text-success",
      warning: "bg-warn-light border-warn/20 text-warn-text",
      error:   "bg-danger-light border-danger/20 text-danger-strong",
    },
    size: {
      sm: "text-cap-md p-2",
      md: "text-body p-3",
    },
  },
  defaultVariants: { type: "info", size: "md" },
});

const iconByType: Record<NonNullable<VariantProps<typeof messageStyles>["type"]>, LucideIcon> = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   AlertCircle,
};

export interface InlineMessageProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageStyles> {
  showIcon?: boolean;
  action?: ReactNode;
}

export const InlineMessage = forwardRef<HTMLDivElement, InlineMessageProps>(function InlineMessage(
  { className, type = "info", size = "md", showIcon = true, action, children, ...rest },
  ref
) {
  const Icon = iconByType[type ?? "info"];
  const iconSize = size === "sm" ? 14 : 16;
  return (
    <div ref={ref} role="alert" className={cn(messageStyles({ type, size }), className)} {...rest}>
      {showIcon && <Icon size={iconSize} className="mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
});
