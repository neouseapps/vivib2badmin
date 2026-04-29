"use client";

import { useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { DropdownButton, DropdownPopover, DropdownItem } from "./Dropdown";
import { cn } from "./lib/cva";

export interface SelectOption<T extends string = string> {
  value: T;
  label: ReactNode;
  caption?: ReactNode;
  disabled?: boolean;
  leftIcon?: LucideIcon;
}

export interface SelectGroup<T extends string = string> {
  label?: ReactNode;
  options: SelectOption<T>[];
}

export interface SelectProps<T extends string = string> {
  value?: T;
  onChange: (value: T) => void;
  /** Flat options. Use `groups` instead for sectioned options. */
  options?: SelectOption<T>[];
  /** Sectioned options (replaces native `<optgroup>`). */
  groups?: SelectGroup<T>[];
  placeholder?: ReactNode;
  size?: "sm" | "md" | "lg";
  state?: "default" | "active" | "error" | "disabled";
  leftIcon?: LucideIcon;
  className?: string;
  popoverClassName?: string;
  align?: "start" | "end";
  disabled?: boolean;
  id?: string;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  groups,
  placeholder = "Chọn…",
  size = "md",
  state,
  leftIcon,
  className,
  popoverClassName,
  align = "start",
  disabled,
  id,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const allOptions = groups ? groups.flatMap((g) => g.options) : options ?? [];
  const selected = allOptions.find((o) => o.value === value);

  const renderItem = (opt: SelectOption<T>) => (
    <DropdownItem
      key={opt.value}
      selected={value === opt.value}
      disabled={opt.disabled}
      leftIcon={opt.leftIcon}
      caption={opt.caption}
      onClick={() => {
        onChange(opt.value);
        setOpen(false);
      }}
    >
      {opt.label}
    </DropdownItem>
  );

  return (
    <div className={cn("relative", className)}>
      <DropdownButton
        ref={triggerRef}
        onClick={() => !disabled && setOpen((o) => !o)}
        size={size}
        state={open ? "active" : state}
        leftIcon={leftIcon}
        disabled={disabled}
        placeholder={placeholder}
        selected={selected?.label}
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
      />
      <DropdownPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={triggerRef}
        align={align}
        className={popoverClassName}
      >
        {groups
          ? groups.map((g, i) => (
              <div key={(typeof g.label === "string" ? g.label : null) ?? `group-${i}`}>
                {g.label && (
                  <div className="px-3 pt-2 pb-1 text-cap font-semibold uppercase tracking-wide text-ink-3 select-none">
                    {g.label}
                  </div>
                )}
                {g.options.map(renderItem)}
              </div>
            ))
          : (options ?? []).map(renderItem)}
      </DropdownPopover>
    </div>
  );
}
