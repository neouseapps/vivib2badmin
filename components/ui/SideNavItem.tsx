"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

const itemStyles = cva(
  "flex items-center gap-2 w-full rounded-md transition-colors text-left focus:outline-none focus-visible:bg-bg-lv2",
  {
    variants: {
      level: {
        1: "px-3 py-2",
        2: "pl-9 pr-3 py-1.5",
      },
      state: {
        default: "text-ink-2 hover:bg-bg-lv2 hover:text-ink-1",
        active:  "bg-bg-lv3 text-ink-1 font-medium",
        disabled: "text-ink-4 cursor-not-allowed",
      },
      collapsed: {
        true:  "justify-center px-2",
        false: "",
      },
    },
    defaultVariants: { level: 1, state: "default", collapsed: false },
  }
);

export interface SideNavItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof itemStyles> {
  icon?: LucideIcon;
  label: ReactNode;
  expandable?: boolean;
  expanded?: boolean;
  trailing?: ReactNode;
  profileImage?: ReactNode;
}

export const SideNavItem = forwardRef<HTMLButtonElement, SideNavItemProps>(function SideNavItem(
  { className, level, state, collapsed, icon: Icon, label, expandable, expanded, trailing, profileImage, disabled, ...rest },
  ref
) {
  const finalState = disabled ? "disabled" : state;
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(itemStyles({ level, state: finalState, collapsed }), className)}
      aria-expanded={expandable ? expanded : undefined}
      {...rest}
    >
      {profileImage ? (
        <span className="shrink-0">{profileImage}</span>
      ) : Icon ? (
        <Icon size={16} className="shrink-0" />
      ) : null}
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-body">{label}</span>
          {trailing}
          {expandable && (
            <ChevronDown
              size={14}
              className={cn("shrink-0 transition-transform text-ink-3", expanded && "rotate-180")}
            />
          )}
        </>
      )}
    </button>
  );
});
