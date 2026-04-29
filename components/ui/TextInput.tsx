"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
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
        readonly: "bg-bg-lv2 border-line",
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

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof wrapperStyles> {
  label?: ReactNode;
  required?: boolean;
  caption?: ReactNode;
  error?: ReactNode;
  helper?: ReactNode;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  action?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    className,
    state,
    size = "md",
    label,
    required,
    caption,
    error,
    helper,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    action,
    id: idProp,
    disabled,
    readOnly,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const finalState = error ? "error" : disabled ? "disabled" : readOnly ? "readonly" : state;
  const iconSize = iconSizes[size ?? "md"];
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label htmlFor={id} required={required} caption={caption}>
          {label}
        </Label>
      )}
      <div className={cn(wrapperStyles({ state: finalState, size }), className)}>
        {LeftIcon && <LeftIcon size={iconSize} className="shrink-0 text-ink-3" />}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          readOnly={readOnly}
          className="flex-1 min-w-0 bg-transparent outline-none text-ink-1 placeholder:text-ink-4 disabled:cursor-not-allowed"
          {...rest}
        />
        {RightIcon && <RightIcon size={iconSize} className="shrink-0 text-ink-3" />}
        {action}
      </div>
      {error ? (
        <span className="text-cap-md text-danger-strong">{error}</span>
      ) : helper ? (
        <span className="text-cap-md text-ink-3">{helper}</span>
      ) : null}
    </div>
  );
});
