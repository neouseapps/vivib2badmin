"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

type ToastType = "info" | "success" | "warning" | "error";

const toastStyles = cva(
  "flex items-start gap-3 rounded-lg shadow-lv3 p-3 pr-10 min-w-[320px] max-w-md text-body relative",
  {
    variants: {
      type: {
        info:    "bg-white border border-line text-ink-1",
        success: "bg-white border border-line text-ink-1",
        warning: "bg-white border border-line text-ink-1",
        error:   "bg-white border border-line text-ink-1",
      },
    },
    defaultVariants: { type: "info" },
  }
);

const iconByType: Record<ToastType, { Icon: LucideIcon; color: string }> = {
  info:    { Icon: Info,         color: "text-info" },
  success: { Icon: CheckCircle2, color: "text-success" },
  warning: { Icon: AlertTriangle, color: "text-warn" },
  error:   { Icon: AlertCircle,  color: "text-danger" },
};

export interface ToastProps extends VariantProps<typeof toastStyles> {
  id: string;
  title?: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  duration?: number;
  showIcon?: boolean;
  onClose?: () => void;
}

interface ToastContextValue {
  show: (toast: Omit<ToastProps, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: Omit<ToastProps, "id">) => {
      const id = `t-${++counter.current}`;
      setToasts((arr) => [...arr, { ...t, id }]);
      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ id, type = "info", title, message, action, duration = 5000, showIcon = true, onClose }: ToastProps) {
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const { Icon, color } = iconByType[type ?? "info"];
  return (
    <div role="status" id={id} className={cn(toastStyles({ type }), "pointer-events-auto")}>
      {showIcon && <Icon size={18} className={cn("shrink-0 mt-0.5", color)} />}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {title && <div className="font-semibold">{title}</div>}
        <div className={title ? "text-cap-md text-ink-2" : ""}>{message}</div>
        {action && <div className="mt-1">{action}</div>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="absolute top-2 right-2 rounded p-1 text-ink-3 hover:bg-bg-lv3 hover:text-ink-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
