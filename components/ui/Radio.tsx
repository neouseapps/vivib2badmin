"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cva, cn, type VariantProps } from "./lib/cva";

const circleStyles = cva(
  "inline-flex items-center justify-center shrink-0 rounded-full border transition-colors",
  {
    variants: {
      state: {
        default:  "border-grey-250 bg-white",
        checked:  "border-brand bg-white",
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

const dotStyles = cva("rounded-full bg-brand", {
  variants: {
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
  },
  defaultVariants: { size: "md" },
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: VariantProps<typeof circleStyles>["size"];
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, size = "md", checked, disabled, ...rest },
  ref
) {
  const state = disabled ? "disabled" : checked ? "checked" : "default";
  return (
    <span className={cn("relative inline-flex", className)}>
      <input
        ref={ref}
        type="radio"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...rest}
      />
      <span className={circleStyles({ state, size })} aria-hidden>
        {checked && <span className={dotStyles({ size })} />}
      </span>
    </span>
  );
});

export interface RadioItemProps extends RadioProps {
  label?: ReactNode;
  description?: ReactNode;
}

export const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(function RadioItem(
  { label, description, id: idProp, className, ...rest },
  ref
) {
  const reactId = useId();
  const id = idProp ?? reactId;
  return (
    <label htmlFor={id} className={cn("flex items-start gap-2 cursor-pointer", rest.disabled && "cursor-not-allowed", className)}>
      <Radio ref={ref} id={id} className="mt-0.5" {...rest} />
      <span className="flex flex-col gap-0.5">
        {label && <span className="text-body text-ink-1">{label}</span>}
        {description && <span className="text-cap-md text-ink-3">{description}</span>}
      </span>
    </label>
  );
});
