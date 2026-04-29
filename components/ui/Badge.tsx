"use client";

import { forwardRef, type HTMLAttributes, type MouseEvent } from "react";
import { X, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

const badgeStyles = cva(
  "inline-flex items-center font-medium rounded-full whitespace-nowrap",
  {
    variants: {
      intention: {
        neutral: "",
        brand:   "",
        success: "",
        danger:  "",
        warning: "",
        info:    "",
      },
      style: {
        bold:  "",
        light: "",
      },
      size: {
        sm: "text-cap gap-0.5 h-5 px-1.5",
        md: "text-cap-md gap-1 h-6 px-2",
      },
    },
    compoundVariants: [
      { intention: "neutral", style: "light", className: "bg-grey-150 text-ink-2" },
      { intention: "neutral", style: "bold",  className: "bg-grey-700 text-white" },
      { intention: "brand",   style: "light", className: "bg-brand-100 text-brand-800" },
      { intention: "brand",   style: "bold",  className: "bg-brand text-white" },
      { intention: "success", style: "light", className: "bg-success-light text-success" },
      { intention: "success", style: "bold",  className: "bg-success text-white" },
      { intention: "danger",  style: "light", className: "bg-danger-light text-danger-strong" },
      { intention: "danger",  style: "bold",  className: "bg-danger text-white" },
      { intention: "warning", style: "light", className: "bg-warn-light text-warn-text" },
      { intention: "warning", style: "bold",  className: "bg-warn text-white" },
      { intention: "info",    style: "light", className: "bg-info-light text-info" },
      { intention: "info",    style: "bold",  className: "bg-info text-white" },
    ],
    defaultVariants: { intention: "neutral", style: "light", size: "md" },
  }
);

const iconSizes = { sm: 10, md: 12 } as const;

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "style">,
    VariantProps<typeof badgeStyles> {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onAction?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, intention, style, size = "md", leftIcon: LeftIcon, rightIcon: RightIcon, onAction, children, ...rest },
  ref
) {
  const iconSize = iconSizes[size ?? "md"];
  return (
    <span ref={ref} className={cn(badgeStyles({ intention, style, size }), className)} {...rest}>
      {LeftIcon && <LeftIcon size={iconSize} />}
      {children}
      {RightIcon && <RightIcon size={iconSize} />}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="-mr-0.5 ml-0.5 rounded-full p-0.5 hover:bg-black/10"
          aria-label="Remove"
        >
          <X size={iconSize} />
        </button>
      )}
    </span>
  );
});
