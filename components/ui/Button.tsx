"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

const buttonStyles = cva(
  "inline-flex items-center justify-center font-semibold rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:   "bg-ink-1 border-ink-1 text-white hover:bg-ink-2 hover:border-ink-2",
        secondary: "bg-bg-lv2 border-bg-lv2 text-ink-1 hover:bg-bg-lv3 hover:border-bg-lv3",
        outline:   "bg-white border-line text-ink-1 hover:bg-bg-lv3",
        ghost:     "bg-transparent border-transparent text-ink-1 hover:bg-bg-lv3",
        brand:     "bg-brand border-brand text-white hover:bg-brand-hover hover:border-brand-hover",
        danger:    "bg-danger border-danger text-white hover:bg-danger-strong hover:border-danger-strong",
        ai:        "bg-gradient-to-r from-purple-600 to-brand-600 border-transparent text-white hover:opacity-90",
      },
      size: {
        xs: "h-7 gap-1 px-2 text-cap-md",
        sm: "h-8 gap-1.5 px-2.5 text-cap-md",
        md: "h-9 gap-1.5 px-3 text-body",
        lg: "h-11 gap-2 px-4 text-lg",
      },
      iconOnly: {
        true: "px-0",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "xs", className: "w-7" },
      { iconOnly: true, size: "sm", className: "w-8" },
      { iconOnly: true, size: "md", className: "w-9" },
      { iconOnly: true, size: "lg", className: "w-11" },
    ],
    defaultVariants: { variant: "primary", size: "md", iconOnly: false },
  }
);

const iconSizes = { xs: 12, sm: 14, md: 14, lg: 16 } as const;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof buttonStyles> {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size = "md", leftIcon: LeftIcon, rightIcon: RightIcon, loading, disabled, children, ...rest },
  ref
) {
  const iconSize = iconSizes[size ?? "md"];
  const isIconOnly = !children && (LeftIcon != null || RightIcon != null);
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonStyles({ variant, size, iconOnly: isIconOnly }), className)}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        LeftIcon && <LeftIcon size={iconSize} />
      )}
      {children}
      {!loading && RightIcon && <RightIcon size={iconSize} />}
    </button>
  );
});
