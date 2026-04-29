"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, cn, type VariantProps } from "./lib/cva";

const trackStyles = cva("relative w-full overflow-hidden rounded-full bg-bg-lv3", {
  variants: {
    size: {
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2",
    },
  },
  defaultVariants: { size: "md" },
});

const fillStyles = cva("h-full rounded-full transition-[width] duration-500", {
  variants: {
    intention: {
      brand:   "bg-brand",
      info:    "bg-info",
      success: "bg-success",
      warning: "bg-warn",
      danger:  "bg-danger",
    },
  },
  defaultVariants: { intention: "brand" },
});

export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof trackStyles>,
    VariantProps<typeof fillStyles> {
  value: number;
  max?: number;
  indeterminate?: boolean;
  showValue?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { className, size, intention, value, max = 100, indeterminate, showValue, ...rest },
  ref
) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...rest}>
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={trackStyles({ size })}
      >
        <div
          className={cn(fillStyles({ intention }), indeterminate && "animate-pulse w-1/3")}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
      {showValue && !indeterminate && (
        <span className="text-cap-md text-ink-2 tabular-nums shrink-0">{Math.round(pct)}%</span>
      )}
    </div>
  );
});
