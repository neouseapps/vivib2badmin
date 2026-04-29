"use client";

import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";
import { cva, cn, type VariantProps } from "./lib/cva";

const labelStyles = cva("inline-flex items-center gap-1 font-medium text-ink-2", {
  variants: {
    size: {
      sm: "text-cap",
      md: "text-cap-md",
      lg: "text-body",
    },
    weight: {
      regular: "font-normal",
      medium:  "font-medium",
      semibold:"font-semibold",
    },
  },
  defaultVariants: { size: "md", weight: "medium" },
});

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelStyles> {
  required?: boolean;
  caption?: ReactNode;
  badge?: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, size, weight, required, caption, badge, children, ...rest },
  ref
) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <label ref={ref} className={cn(labelStyles({ size, weight }))} {...rest}>
        {children}
        {required && <span className="text-danger" aria-hidden>*</span>}
      </label>
      {badge}
      {caption && <span className="text-cap text-ink-3">{caption}</span>}
    </span>
  );
});
