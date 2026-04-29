"use client";

import { forwardRef, type AnchorHTMLAttributes } from "react";
import { ExternalLink as ExternalIcon, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

const linkStyles = cva(
  "inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:underline transition-colors",
  {
    variants: {
      variant: {
        default: "text-info hover:text-info-strong",
        brand:   "text-brand hover:text-brand-hover",
        muted:   "text-ink-2 hover:text-ink-1",
      },
      size: {
        sm: "text-cap-md",
        md: "text-body",
        lg: "text-lg",
      },
      state: {
        default:  "",
        disabled: "opacity-50 pointer-events-none",
      },
    },
    defaultVariants: { variant: "default", size: "md", state: "default" },
  }
);

const iconSizes = { sm: 12, md: 14, lg: 16 } as const;

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkStyles> {
  external?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { className, variant, size = "md", state, external, leftIcon: LeftIcon, rightIcon: RightIcon, target, rel, children, ...rest },
  ref
) {
  const iconSize = iconSizes[size ?? "md"];
  return (
    <a
      ref={ref}
      target={external ? "_blank" : target}
      rel={external ? "noopener noreferrer" : rel}
      className={cn(linkStyles({ variant, size, state }), className)}
      {...rest}
    >
      {LeftIcon && <LeftIcon size={iconSize} />}
      {children}
      {RightIcon ? <RightIcon size={iconSize} /> : external ? <ExternalIcon size={iconSize} /> : null}
    </a>
  );
});
