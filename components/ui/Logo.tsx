"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "./lib/cva";

type LogoKind = "main" | "admin" | "partner";
type LogoColor = "brand" | "white" | "black";

const sizeMap = {
  sm: { logo: 24, text: "text-cap-md", sub: "text-cap" },
  md: { logo: 32, text: "text-body",   sub: "text-cap-md" },
  lg: { logo: 40, text: "text-lg",     sub: "text-body" },
} as const;

const colorMap: Record<LogoColor, { bg: string; mark: string; text: string }> = {
  brand: { bg: "bg-brand", mark: "text-white",   text: "text-ink-1" },
  white: { bg: "bg-white", mark: "text-brand",   text: "text-white" },
  black: { bg: "bg-ink-1", mark: "text-white",   text: "text-ink-1" },
};

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  kind?: LogoKind;
  color?: LogoColor;
  size?: keyof typeof sizeMap;
  showText?: boolean;
}

export const Logo = forwardRef<HTMLDivElement, LogoProps>(function Logo(
  { className, kind = "main", color = "brand", size = "md", showText = true, ...rest },
  ref
) {
  const s = sizeMap[size];
  const c = colorMap[color];
  const subLabel = kind === "admin" ? "Admin & Operation Portal" : kind === "partner" ? "Partner Portal" : null;

  return (
    <div ref={ref} className={cn("inline-flex items-center gap-2", className)} {...rest}>
      <span
        className={cn("inline-flex items-center justify-center rounded-md font-bold", c.bg, c.mark)}
        style={{ width: s.logo, height: s.logo, fontSize: s.logo * 0.4 }}
        aria-label="Visit Vietnam"
      >
        VV
      </span>
      {showText && (
        <span className="flex flex-col leading-tight">
          <span className={cn("font-semibold", s.text, c.text)}>Visit Vietnam</span>
          {subLabel && <span className={cn(s.sub, "text-ink-3")}>{subLabel}</span>}
        </span>
      )}
    </div>
  );
});
