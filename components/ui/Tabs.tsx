"use client";

import {
  createContext,
  forwardRef,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import type { LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

type TabsStyle = "line" | "segment";

interface TabsContextValue {
  value: string;
  onChange: (v: string) => void;
  style: TabsStyle;
}
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabItem must be used inside <Tabs>");
  return ctx;
}

export interface TabsProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children" | "style"> {
  value: T;
  onChange: (v: T) => void;
  variant?: TabsStyle;
  children: ReactNode;
}

export function Tabs<T extends string = string>({
  value,
  onChange,
  variant = "line",
  className,
  children,
  ...rest
}: TabsProps<T>) {
  return (
    <TabsContext.Provider value={{ value, onChange: onChange as (v: string) => void, style: variant }}>
      <div
        role="tablist"
        className={cn(
          variant === "line" && "flex border-b border-line gap-0",
          variant === "segment" && "inline-flex bg-bg-lv2 rounded-lg p-1 gap-1",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const tabItemLineStyles = cva(
  "inline-flex items-center gap-2 px-4 py-3 text-body font-medium transition-colors border-b-2 -mb-px focus:outline-none focus-visible:bg-bg-lv2",
  {
    variants: {
      active: {
        true:  "text-ink-1 border-ink-1",
        false: "text-ink-3 border-transparent hover:text-ink-1",
      },
      disabled: { true: "opacity-50 pointer-events-none", false: "" },
    },
    defaultVariants: { active: false, disabled: false },
  }
);

const tabItemSegmentStyles = cva(
  "inline-flex items-center gap-2 px-3 py-1.5 text-body font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
  {
    variants: {
      active: {
        true:  "bg-white text-ink-1 shadow-lv1",
        false: "text-ink-3 hover:text-ink-1",
      },
      disabled: { true: "opacity-50 pointer-events-none", false: "" },
    },
    defaultVariants: { active: false, disabled: false },
  }
);

export interface TabItemProps<T extends string = string>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: T;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  count?: number;
  disabled?: boolean;
}

export const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(function TabItem(
  { value, leftIcon: LeftIcon, rightIcon: RightIcon, count, disabled, className, onClick, children, ...rest },
  ref
) {
  const { value: active, onChange, style } = useTabs();
  const isActive = active === value;
  const styles = style === "segment" ? tabItemSegmentStyles : tabItemLineStyles;
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        onChange(value);
      }}
      className={cn(styles({ active: isActive, disabled }), className)}
      {...rest}
    >
      {LeftIcon && <LeftIcon size={14} />}
      {children}
      {typeof count === "number" && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-cap font-semibold",
            isActive ? "bg-brand text-white" : "bg-bg-lv3 text-ink-2"
          )}
        >
          {count}
        </span>
      )}
      {RightIcon && <RightIcon size={14} />}
    </button>
  );
}) as <T extends string = string>(props: TabItemProps<T> & { ref?: Ref<HTMLButtonElement> }) => ReactElement;
