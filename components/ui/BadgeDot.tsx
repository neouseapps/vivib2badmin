"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, cn, type VariantProps } from "./lib/cva";

const dotStyles = cva("inline-block rounded-full", {
  variants: {
    intention: {
      neutral: "",
      brand:   "",
      success: "",
      danger:  "",
      warning: "",
      info:    "",
    },
    emphasis: {
      solid:   "",
      outline: "border-2 border-white bg-current",
    },
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
  },
  compoundVariants: [
    { intention: "neutral", emphasis: "solid", className: "bg-grey-400" },
    { intention: "brand",   emphasis: "solid", className: "bg-brand" },
    { intention: "success", emphasis: "solid", className: "bg-success" },
    { intention: "danger",  emphasis: "solid", className: "bg-danger" },
    { intention: "warning", emphasis: "solid", className: "bg-warn" },
    { intention: "info",    emphasis: "solid", className: "bg-info" },
    { intention: "neutral", emphasis: "outline", className: "text-grey-400" },
    { intention: "brand",   emphasis: "outline", className: "text-brand" },
    { intention: "success", emphasis: "outline", className: "text-success" },
    { intention: "danger",  emphasis: "outline", className: "text-danger" },
    { intention: "warning", emphasis: "outline", className: "text-warn" },
    { intention: "info",    emphasis: "outline", className: "text-info" },
  ],
  defaultVariants: { intention: "neutral", emphasis: "solid", size: "md" },
});

export interface BadgeDotProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof dotStyles> {}

export const BadgeDot = forwardRef<HTMLSpanElement, BadgeDotProps>(function BadgeDot(
  { className, intention, emphasis, size, ...rest },
  ref
) {
  return <span ref={ref} className={cn(dotStyles({ intention, emphasis, size }), className)} {...rest} />;
});
