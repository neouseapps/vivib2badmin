"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cva, cn, type VariantProps } from "./lib/cva";

const trackStyles = cva(
  "relative inline-flex shrink-0 items-center rounded-full transition-colors cursor-pointer",
  {
    variants: {
      state: {
        off:      "bg-grey-250",
        on:       "bg-brand",
        disabled: "bg-bg-lv3 cursor-not-allowed",
      },
      size: {
        sm: "h-4 w-7",
        md: "h-5 w-9",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: { state: "off", size: "md" },
  }
);

const thumbStyles = cva(
  "inline-block rounded-full bg-white shadow-lv1 transition-transform",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
      checked: {
        true:  "",
        false: "translate-x-0.5",
      },
    },
    compoundVariants: [
      { size: "sm", checked: true, className: "translate-x-3.5" },
      { size: "md", checked: true, className: "translate-x-[18px]" },
      { size: "lg", checked: true, className: "translate-x-[22px]" },
    ],
    defaultVariants: { size: "md", checked: false },
  }
);

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: VariantProps<typeof trackStyles>["size"];
  label?: ReactNode;
  description?: ReactNode;
  switchPosition?: "leading" | "trailing";
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { className, size = "md", checked, disabled, label, description, switchPosition = "trailing", id: idProp, ...rest },
  ref
) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const state = disabled ? "disabled" : checked ? "on" : "off";

  const switchEl = (
    <span className={trackStyles({ state, size })} aria-hidden>
      <span className={thumbStyles({ size, checked: !!checked })} />
    </span>
  );
  const textEl =
    label || description ? (
      <span className="flex flex-col gap-0.5 min-w-0">
        {label && <span className="text-body text-ink-1">{label}</span>}
        {description && <span className="text-cap-md text-ink-3">{description}</span>}
      </span>
    ) : null;

  const showLabel = !!textEl;

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2",
        showLabel && "cursor-pointer",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <input ref={ref} id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} className="sr-only" {...rest} />
      {switchPosition === "leading" ? (
        <>
          {switchEl}
          {textEl}
        </>
      ) : (
        <>
          {textEl}
          {switchEl}
        </>
      )}
    </label>
  );
});
