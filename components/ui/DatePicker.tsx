"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./lib/cva";
import { TextInput } from "./TextInput";

// ─── helpers ──────────────────────────────────────────

const VI_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]; // Mon–Sun
const VI_MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromISO(iso?: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function inRange(d: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = d.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

interface DayCell {
  date: Date;
  outside: boolean;
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  // Mon=0 ... Sun=6
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: d, outside: d.getMonth() !== month });
  }
  return cells;
}

// ─── shared popover ───────────────────────────────────

interface CalendarPopoverProps {
  viewYear: number;
  viewMonth: number;
  onPrev: () => void;
  onNext: () => void;
  selected?: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  hovered?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onPickDay: (d: Date) => void;
  onHoverDay?: (d: Date | null) => void;
}

function CalendarPopover({
  viewYear,
  viewMonth,
  onPrev,
  onNext,
  selected,
  rangeStart,
  rangeEnd,
  hovered,
  minDate,
  maxDate,
  onPickDay,
  onHoverDay,
}: CalendarPopoverProps) {
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const today = new Date();
  const previewEnd = !rangeEnd && hovered && rangeStart ? hovered : rangeEnd;

  return (
    <div className="w-72 bg-white border border-line rounded-lg shadow-lv4 p-3">
      {/* Period header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-2 hover:bg-bg-lv2"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-body font-semibold text-ink-1">
          {VI_MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-2 hover:bg-bg-lv2"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day name row */}
      <div className="grid grid-cols-7 mb-1">
        {VI_DAYS.map((d) => (
          <span key={d} className="text-cap text-ink-3 text-center py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => onHoverDay?.(null)}>
        {grid.map((cell, i) => {
          const isSelected = sameDay(cell.date, selected ?? null);
          const isStart = sameDay(cell.date, rangeStart ?? null);
          const isEnd = sameDay(cell.date, rangeEnd ?? null);
          const isInRange = rangeStart && previewEnd && inRange(cell.date, rangeStart, previewEnd);
          const isToday = sameDay(cell.date, today);
          const disabled =
            (minDate && cell.date.getTime() < minDate.getTime()) ||
            (maxDate && cell.date.getTime() > maxDate.getTime());

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onMouseEnter={() => onHoverDay?.(cell.date)}
              onClick={() => onPickDay(cell.date)}
              className={cn(
                "relative h-8 inline-flex items-center justify-center text-cap-md rounded-md transition-colors",
                cell.outside ? "text-ink-4" : "text-ink-1",
                isInRange && !isStart && !isEnd && "bg-brand-50 rounded-none",
                (isSelected || isStart || isEnd) && "bg-brand text-white font-semibold",
                !isSelected && !isStart && !isEnd && !isInRange && !disabled && "hover:bg-bg-lv2",
                isToday && !isSelected && !isStart && !isEnd && "ring-1 ring-brand",
                disabled && "opacity-40 pointer-events-none"
              )}
              aria-pressed={isSelected || isStart || isEnd}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── single DatePicker ────────────────────────────────

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  value?: string; // ISO YYYY-MM-DD
  onChange?: (iso: string) => void;
  label?: ReactNode;
  placeholder?: string;
  required?: boolean;
  error?: ReactNode;
  helper?: ReactNode;
  minDate?: string;
  maxDate?: string;
  format?: (d: Date) => string;
  disabled?: boolean;
}

const defaultFormat = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  { className, value, onChange, label, placeholder = "Chọn ngày", required, error, helper, minDate, maxDate, format = defaultFormat, disabled, ...rest },
  ref
) {
  const selected = fromISO(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const d = selected ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handlePick = (d: Date) => {
    onChange?.(toISO(d));
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)} {...rest}>
      <div ref={wrapperRef}>
        <TextInput
          label={label}
          required={required}
          error={error}
          helper={helper}
          placeholder={placeholder}
          value={selected ? format(selected) : ""}
          onFocus={() => !disabled && setOpen(true)}
          onClick={() => !disabled && setOpen(true)}
          readOnly
          disabled={disabled}
          rightIcon={Calendar}
        />
        {open && (
          <div className="absolute left-0 top-full z-30 mt-1">
            <CalendarPopover
              viewYear={view.year}
              viewMonth={view.month}
              onPrev={() =>
                setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }))
              }
              onNext={() =>
                setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }))
              }
              selected={selected}
              minDate={fromISO(minDate) ?? undefined}
              maxDate={fromISO(maxDate) ?? undefined}
              onPickDay={handlePick}
            />
          </div>
        )}
      </div>
    </div>
  );
});

// ─── DateRangePicker ──────────────────────────────────

export interface DateRangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  value?: { start?: string; end?: string };
  onChange?: (range: { start: string; end: string }) => void;
  label?: ReactNode;
  placeholder?: string;
  required?: boolean;
  error?: ReactNode;
  helper?: ReactNode;
  minDate?: string;
  maxDate?: string;
  format?: (d: Date) => string;
  disabled?: boolean;
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(function DateRangePicker(
  { className, value, onChange, label, placeholder = "Chọn khoảng ngày", required, error, helper, minDate, maxDate, format = defaultFormat, disabled, ...rest },
  ref
) {
  const start = fromISO(value?.start);
  const end = fromISO(value?.end);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Date | null>(null);
  const [pickStart, setPickStart] = useState<Date | null>(null);
  const [view, setView] = useState(() => {
    const d = start ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setPickStart(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPickStart(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handlePick = (d: Date) => {
    if (!pickStart) {
      setPickStart(d);
      return;
    }
    const a = pickStart.getTime() <= d.getTime() ? pickStart : d;
    const b = pickStart.getTime() <= d.getTime() ? d : pickStart;
    onChange?.({ start: toISO(a), end: toISO(b) });
    setPickStart(null);
    setOpen(false);
  };

  const display = start && end ? `${format(start)} – ${format(end)}` : "";

  return (
    <div ref={ref} className={cn("relative", className)} {...rest}>
      <div ref={wrapperRef}>
        <TextInput
          label={label}
          required={required}
          error={error}
          helper={helper}
          placeholder={placeholder}
          value={display}
          onFocus={() => !disabled && setOpen(true)}
          onClick={() => !disabled && setOpen(true)}
          readOnly
          disabled={disabled}
          rightIcon={Calendar}
        />
        {open && (
          <div className="absolute left-0 top-full z-30 mt-1">
            <CalendarPopover
              viewYear={view.year}
              viewMonth={view.month}
              onPrev={() =>
                setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }))
              }
              onNext={() =>
                setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }))
              }
              rangeStart={pickStart ?? start}
              rangeEnd={pickStart ? null : end}
              hovered={hovered}
              minDate={fromISO(minDate) ?? undefined}
              maxDate={fromISO(maxDate) ?? undefined}
              onPickDay={handlePick}
              onHoverDay={setHovered}
            />
          </div>
        )}
      </div>
    </div>
  );
});
