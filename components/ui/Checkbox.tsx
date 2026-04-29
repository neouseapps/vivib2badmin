"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";

const boxStyles = cva(
  "inline-flex items-center justify-center shrink-0 rounded border transition-colors",
  {
    variants: {
      state: {
        default:  "border-grey-250 bg-white",
        checked:  "border-brand bg-brand text-white",
        indeterminate: "border-brand bg-brand text-white",
        disabled: "border-line bg-bg-lv2 cursor-not-allowed",
      },
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: { state: "default", size: "md" },
  }
);

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: VariantProps<typeof boxStyles>["size"];
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, size = "md", indeterminate, checked, disabled, ...rest },
  ref
) {
  const state = disabled ? "disabled" : indeterminate ? "indeterminate" : checked ? "checked" : "default";
  const iconSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;
  return (
    <span className={cn("relative inline-flex", className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...rest}
      />
      <span className={boxStyles({ state, size })} aria-hidden>
        {indeterminate ? <Minus size={iconSize} /> : checked ? <Check size={iconSize} /> : null}
      </span>
    </span>
  );
});

export interface CheckboxItemProps extends CheckboxProps {
  label?: ReactNode;
  description?: ReactNode;
}

export const CheckboxItem = forwardRef<HTMLInputElement, CheckboxItemProps>(function CheckboxItem(
  { label, description, id: idProp, className, ...rest },
  ref
) {
  const reactId = useId();
  const id = idProp ?? reactId;
  return (
    <label htmlFor={id} className={cn("flex items-start gap-2 cursor-pointer", rest.disabled && "cursor-not-allowed", className)}>
      <Checkbox ref={ref} id={id} className="mt-0.5" {...rest} />
      <span className="flex flex-col gap-0.5">
        {label && <span className="text-body text-ink-1">{label}</span>}
        {description && <span className="text-cap-md text-ink-3">{description}</span>}
      </span>
    </label>
  );
});
