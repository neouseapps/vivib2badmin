"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

// ───── DropdownButton (the trigger) ─────

const dropdownButtonStyles = cva(
  "inline-flex items-center justify-between gap-2 w-full bg-white border rounded-lg transition-colors focus:outline-none",
  {
    variants: {
      state: {
        default:  "border-line hover:border-ink-3 focus-visible:border-ink-2",
        active:   "border-ink-2",
        error:    "border-danger",
        disabled: "bg-bg-lv2 border-line cursor-not-allowed",
      },
      size: {
        sm: "h-8 px-2.5 text-cap-md",
        md: "h-9 px-3 text-body",
        lg: "h-11 px-3.5 text-body",
      },
    },
    defaultVariants: { state: "default", size: "md" },
  }
);

export interface DropdownButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    VariantProps<typeof dropdownButtonStyles> {
  placeholder?: ReactNode;
  selected?: ReactNode;
  leftIcon?: LucideIcon;
}

export const DropdownButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(function DropdownButton(
  { className, state, size = "md", placeholder, selected, leftIcon: LeftIcon, disabled, ...rest },
  ref
) {
  const finalState = disabled ? "disabled" : state;
  const iconSize = size === "lg" ? 16 : 14;
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(dropdownButtonStyles({ state: finalState, size }), className)}
      {...rest}
    >
      <span className="inline-flex items-center gap-2 min-w-0 flex-1">
        {LeftIcon && <LeftIcon size={iconSize} className="text-ink-3" />}
        <span className={cn("truncate", selected ? "text-ink-1" : "text-ink-4")}>
          {selected ?? placeholder}
        </span>
      </span>
      <ChevronDown size={iconSize} className="shrink-0 text-ink-3" />
    </button>
  );
});

// ───── DropdownPopover (positioned panel) ─────

export interface DropdownPopoverProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  align?: "start" | "end";
  searchbox?: ReactNode;
  subCTA?: ReactNode;
  listLabel?: ReactNode;
}

export function DropdownPopover({
  open,
  onClose,
  anchorRef,
  align = "start",
  searchbox,
  subCTA,
  listLabel,
  className,
  children,
  ...rest
}: DropdownPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number; minWidth: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Position popover at fixed coords derived from anchor's bounding rect.
  // Recompute on scroll (capture phase to catch nested scrollers) and resize.
  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;
    const compute = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      const top = r.bottom + 4; // 4px gap
      if (align === "end") {
        setCoords({ top, right: window.innerWidth - r.right, minWidth: r.width });
      } else {
        setCoords({ top, left: r.left, minWidth: r.width });
      }
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRef, align]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return;
      if (anchorRef?.current?.contains(t)) return;
      onClose?.();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !mounted || !coords) return null;
  return createPortal(
    <div
      ref={ref}
      role="listbox"
      style={coords}
      className={cn(
        "fixed z-50 bg-white border border-line rounded-lg shadow-lv3 flex flex-col overflow-hidden",
        className
      )}
      {...rest}
    >
      {searchbox && <div className="p-2 border-b border-line">{searchbox}</div>}
      {listLabel && (
        <div className="px-3 pt-2 pb-1 text-cap font-semibold uppercase tracking-wide text-ink-3">
          {listLabel}
        </div>
      )}
      <div className="max-h-64 overflow-y-auto scrollbar-thin py-1">{children}</div>
      {subCTA && <div className="border-t border-line p-2">{subCTA}</div>}
    </div>,
    document.body
  );
}

// ───── DropdownItem ─────

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  caption?: ReactNode;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  level?: "parent" | "child";
}

export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(function DropdownItem(
  { className, selected, caption, leftIcon: LeftIcon, rightIcon: RightIcon, level = "parent", children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      className={cn(
        "flex items-start gap-2 px-3 py-2 text-left text-body w-full transition-colors focus:outline-none",
        level === "child" && "pl-8",
        selected ? "bg-bg-lv3" : "hover:bg-bg-lv2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {LeftIcon && <LeftIcon size={14} className="mt-0.5 shrink-0 text-ink-3" />}
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-ink-1 truncate">{children}</span>
        {caption && <span className="text-cap-md text-ink-3 truncate">{caption}</span>}
      </span>
      {selected && !RightIcon && <Check size={14} className="shrink-0 text-brand" />}
      {RightIcon && <RightIcon size={14} className="shrink-0 text-ink-3" />}
    </button>
  );
});
