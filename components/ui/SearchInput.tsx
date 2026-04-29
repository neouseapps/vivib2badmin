"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";
import { Label } from "./Label";

const wrapperStyles = cva(
  "flex items-center gap-2 w-full bg-white border rounded-lg transition-colors focus-within:outline-none",
  {
    variants: {
      state: {
        default:  "border-line focus-within:border-ink-2",
        error:    "border-danger focus-within:border-danger",
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

const iconSizes = { sm: 14, md: 14, lg: 16 } as const;

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    VariantProps<typeof wrapperStyles> {
  label?: ReactNode;
  showFrontIcon?: boolean;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, state, size = "md", label, showFrontIcon = true, onClear, id: idProp, disabled, value, ...rest },
  ref
) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const finalState = disabled ? "disabled" : state;
  const iconSize = iconSizes[size ?? "md"];
  const hasValue = typeof value === "string" && value.length > 0;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={cn(wrapperStyles({ state: finalState, size }), className)}>
        {showFrontIcon && <Search size={iconSize} className="shrink-0 text-ink-3" />}
        <input
          ref={ref}
          id={id}
          type="search"
          disabled={disabled}
          value={value}
          className="flex-1 min-w-0 bg-transparent outline-none text-ink-1 placeholder:text-ink-4 disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden"
          {...rest}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full p-0.5 text-ink-3 hover:bg-bg-lv3 hover:text-ink-1"
            aria-label="Clear search"
          >
            <X size={iconSize} />
          </button>
        )}
      </div>
    </div>
  );
});
