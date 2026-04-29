"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, cn, type VariantProps } from "./lib/cva";

const cardStyles = cva("bg-bg-lv1 border", {
  variants: {
    variant: {
      default: "border-line",
      ghost:   "border-transparent",
    },
    elevation: {
      none: "shadow-none",
      lv1:  "shadow-lv1",
      lv2:  "shadow-lv2",
      lv3:  "shadow-lv3",
    },
    radius: {
      sm: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
    },
    padding: {
      none: "",
      sm:   "p-3",
      md:   "p-4",
      lg:   "p-5",
    },
  },
  defaultVariants: { variant: "default", elevation: "lv1", radius: "md", padding: "none" },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardStyles> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, elevation, radius, padding, ...rest },
  ref
) {
  return <div ref={ref} className={cn(cardStyles({ variant, elevation, radius, padding }), className)} {...rest} />;
});
