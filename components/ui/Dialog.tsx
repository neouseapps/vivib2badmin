"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

type DialogSize = "sm" | "md" | "lg" | "xl";

interface DialogContextValue {
  onClose?: () => void;
  titleId: string;
}
const DialogContext = createContext<DialogContextValue | null>(null);

const panelStyles = cva(
  "relative bg-white rounded-lg shadow-lv4 w-full flex flex-col max-h-[90vh] overflow-hidden",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-2xl",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  size?: DialogSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function Dialog({
  open,
  onClose,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true,
  className,
  children,
  ariaLabel,
}: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onClose, titleId }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-label={ariaLabel}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => closeOnBackdrop && onClose?.()}
          aria-hidden
        />
        <div className={cn(panelStyles({ size }), className)}>{children}</div>
      </div>
    </DialogContext.Provider>
  );
}

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
  subLevel?: ReactNode;
  size?: "md" | "lg";
}

function Header({ children, className, showClose = true, subLevel, size = "md", ...rest }: HeaderProps) {
  const ctx = useContext(DialogContext);
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-line",
        size === "md" ? "p-4" : "p-5",
        className
      )}
      {...rest}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <h2 id={ctx?.titleId} className={cn("font-semibold text-ink-1", size === "md" ? "text-h4" : "text-h3")}>
          {children}
        </h2>
        {subLevel && <p className="text-cap-md text-ink-3">{subLevel}</p>}
      </div>
      {showClose && ctx?.onClose && (
        <button
          type="button"
          onClick={ctx.onClose}
          className="-mr-1 -mt-1 rounded-md p-1.5 text-ink-3 hover:bg-bg-lv3 hover:text-ink-1"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function Body({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4 scrollbar-thin", className)} {...rest}>
      {children}
    </div>
  );
}

interface FooterProps extends HTMLAttributes<HTMLDivElement> {
  additionalInfo?: ReactNode;
  size?: "md" | "lg";
}

function Footer({ children, className, additionalInfo, size = "md", ...rest }: FooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-line bg-bg-lv1",
        size === "md" ? "p-4" : "p-5",
        className
      )}
      {...rest}
    >
      <div className="text-cap-md text-ink-3">{additionalInfo}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

Dialog.Header = Header;
Dialog.Body = Body;
Dialog.Footer = Footer;
