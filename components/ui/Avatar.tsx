"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { User, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

const avatarStyles = cva(
  "relative inline-flex items-center justify-center shrink-0 overflow-hidden font-semibold select-none",
  {
    variants: {
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
      size: {
        xs: "h-6 w-6 text-cap",
        sm: "h-8 w-8 text-cap-md",
        md: "h-10 w-10 text-body",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-h3",
      },
      color: {
        neutral: "bg-grey-150 text-ink-2",
        brand:   "bg-brand-100 text-brand-800",
        info:    "bg-info-light text-info",
        success: "bg-success-light text-success",
        warning: "bg-warn-light text-warn-text",
        danger:  "bg-danger-light text-danger-strong",
      },
      emphasis: {
        light: "",
        bold:  "",
      },
    },
    compoundVariants: [
      { color: "neutral", emphasis: "bold", className: "bg-grey-700 text-white" },
      { color: "brand",   emphasis: "bold", className: "bg-brand text-white" },
      { color: "info",    emphasis: "bold", className: "bg-info text-white" },
      { color: "success", emphasis: "bold", className: "bg-success text-white" },
      { color: "warning", emphasis: "bold", className: "bg-warn text-white" },
      { color: "danger",  emphasis: "bold", className: "bg-danger text-white" },
    ],
    defaultVariants: { shape: "circle", size: "md", color: "neutral", emphasis: "light" },
  }
);

const dotPositionBySize = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-3.5 w-3.5",
} as const;

type AvatarStatus = "online" | "offline" | "away" | "busy";

const dotColor: Record<AvatarStatus, string> = {
  online:  "bg-success",
  offline: "bg-grey-400",
  away:    "bg-warn",
  busy:    "bg-danger",
};

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof avatarStyles> {
  src?: string;
  alt?: string;
  initials?: string;
  icon?: LucideIcon;
  status?: AvatarStatus;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, shape, size = "md", color = "neutral", emphasis, src, alt, initials, icon: Icon, status, ...rest },
  ref
) {
  return (
    <span ref={ref} className={cn(avatarStyles({ shape, size, color, emphasis }), className)} {...rest}>
      {src ? (
        <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
      ) : initials ? (
        <span>{initials.slice(0, 2).toUpperCase()}</span>
      ) : (
        <span className="grid place-items-center">
          {Icon ? <Icon size={size === "xs" ? 12 : size === "sm" ? 14 : 16} /> : <User size={16} />}
        </span>
      )}
      {status && (
        <span
          aria-label={status}
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            dotPositionBySize[size ?? "md"],
            dotColor[status]
          )}
        />
      )}
    </span>
  );
});
