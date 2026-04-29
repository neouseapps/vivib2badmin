"use client";

import { forwardRef, useId, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cva, cn, type VariantProps } from "./lib/cva";
import { Label } from "./Label";

const wrapperStyles = cva(
  "flex flex-col gap-1.5 w-full bg-white border rounded-lg p-3 transition-colors focus-within:outline-none",
  {
    variants: {
      state: {
        default:  "border-line focus-within:border-ink-2",
        error:    "border-danger focus-within:border-danger",
        disabled: "bg-bg-lv2 border-line cursor-not-allowed",
        readonly: "bg-bg-lv2 border-line",
      },
      size: {
        sm: "text-cap-md",
        md: "text-body",
        lg: "text-body",
      },
    },
    defaultVariants: { state: "default", size: "md" },
  }
);

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof wrapperStyles> {
  label?: ReactNode;
  required?: boolean;
  caption?: ReactNode;
  error?: ReactNode;
  helper?: ReactNode;
  action?: ReactNode;
  showCount?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    className,
    state,
    size = "md",
    label,
    required,
    caption,
    error,
    helper,
    action,
    showCount,
    id: idProp,
    disabled,
    readOnly,
    rows = 4,
    maxLength,
    value,
    defaultValue,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const finalState = error ? "error" : disabled ? "disabled" : readOnly ? "readonly" : state;
  const length = typeof value === "string" ? value.length : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label htmlFor={id} required={required} caption={caption}>
          {label}
        </Label>
      )}
      <div className={cn(wrapperStyles({ state: finalState, size }), className)}>
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          className="resize-none bg-transparent outline-none text-ink-1 placeholder:text-ink-4 disabled:cursor-not-allowed"
          {...rest}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">{action}</div>
          {showCount && maxLength && (
            <span className="text-cap text-ink-3">
              {length ?? 0}/{maxLength}
            </span>
          )}
        </div>
      </div>
      {error ? (
        <span className="text-cap-md text-danger-strong">{error}</span>
      ) : helper ? (
        <span className="text-cap-md text-ink-3">{helper}</span>
      ) : null}
    </div>
  );
});
