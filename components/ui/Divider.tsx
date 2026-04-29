"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./lib/cva";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  label?: ReactNode;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { className, direction = "horizontal", label, ...rest },
  ref
) {
  if (direction === "vertical") {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={cn("inline-block w-px self-stretch bg-line", className)}
        {...rest}
      />
    );
  }
  if (label) {
    return (
      <div ref={ref} role="separator" className={cn("flex items-center gap-3", className)} {...rest}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-cap-md text-ink-3">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-line", className)}
      {...rest}
    />
  );
});
