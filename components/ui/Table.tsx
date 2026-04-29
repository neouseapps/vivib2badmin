"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
  type ReactNode,
} from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, MoreHorizontal, type LucideIcon } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";
import { Checkbox } from "./Checkbox";

// ───── Root <Table> ─────

const tableStyles = cva("w-full text-body text-ink-1 border-separate border-spacing-0", {
  variants: {
    variant: {
      default: "",
      bordered: "border border-line rounded-lg overflow-hidden",
    },
    zebra: {
      true:  "[&_tbody_tr:nth-child(odd)]:bg-bg-lv2/40",
      false: "",
    },
    rowHover: {
      true:  "[&_tbody_tr:hover]:bg-bg-lv2",
      false: "",
    },
  },
  defaultVariants: { variant: "default", zebra: false, rowHover: true },
});

export interface TableProps
  extends Omit<TableHTMLAttributes<HTMLTableElement>, "children">,
    VariantProps<typeof tableStyles> {
  stickyHeader?: boolean;
  children: ReactNode;
}

function TableRoot({ className, variant, zebra, rowHover, stickyHeader, children, ...rest }: TableProps) {
  return (
    <div className={cn("relative w-full", stickyHeader && "overflow-auto scrollbar-thin")}>
      <table
        className={cn(
          tableStyles({ variant, zebra, rowHover }),
          stickyHeader && "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10",
          className
        )}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
}

// ───── Structural ─────

function Head({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-bg-lv2 text-ink-2", className)} {...rest} />;
}

function Body({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("", className)} {...rest} />;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  disabled?: boolean;
}

function Row({ className, selected, disabled, ...rest }: TableRowProps) {
  return (
    <tr
      data-selected={selected || undefined}
      className={cn(
        "border-b border-line transition-colors",
        selected && "bg-brand-50",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...rest}
    />
  );
}

// ───── Header cells ─────

type Align = "left" | "center" | "right";
type Weight = "regular" | "medium" | "semibold";
type SortDir = "asc" | "desc" | null;

const alignClass: Record<Align, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

const weightClass: Record<Weight, string> = {
  regular:  "font-normal",
  medium:   "font-medium",
  semibold: "font-semibold",
};

interface HeaderTextProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  weight?: Weight;
  sortable?: boolean;
  sortDir?: SortDir;
  onSort?: () => void;
}

function HeaderText({
  className,
  align = "left",
  weight = "semibold",
  sortable,
  sortDir = null,
  onSort,
  children,
  ...rest
}: HeaderTextProps) {
  const inner = (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap", weightClass[weight])}>
      {children}
      {sortable && <SortIndicator direction={sortDir} />}
    </span>
  );
  return (
    <th
      scope="col"
      className={cn(
        "h-10 px-3 text-cap-md border-b border-line",
        alignClass[align],
        sortable && "cursor-pointer select-none hover:text-ink-1",
        className
      )}
      onClick={sortable ? onSort : undefined}
      aria-sort={sortable ? (sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none") : undefined}
      {...rest}
    >
      {inner}
    </th>
  );
}

interface HeaderSelectionProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "onChange"> {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

function HeaderSelection({ className, checked, indeterminate, onChange, ...rest }: HeaderSelectionProps) {
  return (
    <th
      scope="col"
      className={cn("h-10 w-10 px-3 border-b border-line", className)}
      {...rest}
    >
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
        aria-label="Select all"
      />
    </th>
  );
}

// ───── Content cells ─────

interface CellTextProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  weight?: Weight;
  image?: ReactNode;
  subContent?: ReactNode;
}

function CellText({ className, align = "left", weight = "regular", image, subContent, children, ...rest }: CellTextProps) {
  return (
    <td className={cn("h-12 px-3 border-b border-line", alignClass[align], className)} {...rest}>
      <div className={cn("inline-flex items-center gap-2", align === "right" && "justify-end")}>
        {image && <span className="shrink-0">{image}</span>}
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className={cn("truncate", weightClass[weight])}>{children}</span>
          {subContent && <span className="text-cap-md text-ink-3 truncate">{subContent}</span>}
        </span>
      </div>
    </td>
  );
}

interface CellBadgeProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

function CellBadge({ className, align = "left", children, ...rest }: CellBadgeProps) {
  return (
    <td className={cn("h-12 px-3 border-b border-line", alignClass[align], className)} {...rest}>
      <div className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {children}
      </div>
    </td>
  );
}

interface CellMediaProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  images: string[];
  maxVisible?: number;
}

function CellMedia({ className, align = "left", images, maxVisible = 3, ...rest }: CellMediaProps) {
  const visible = images.slice(0, maxVisible);
  const overflow = images.length - visible.length;
  return (
    <td className={cn("h-12 px-3 border-b border-line", alignClass[align], className)} {...rest}>
      <div className={cn("inline-flex items-center -space-x-2", align === "right" && "justify-end")}>
        {visible.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="h-7 w-7 rounded-md border-2 border-white object-cover bg-bg-lv3"
          />
        ))}
        {overflow > 0 && (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border-2 border-white bg-bg-lv3 text-cap font-semibold text-ink-2">
            +{overflow}
          </span>
        )}
      </div>
    </td>
  );
}

interface CellActionProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  actions?: { icon: LucideIcon; label: string; onClick?: () => void; disabled?: boolean }[];
  overflow?: boolean;
  onOverflow?: () => void;
}

function CellAction({ className, align = "right", actions = [], overflow, onOverflow, ...rest }: CellActionProps) {
  return (
    <td className={cn("h-12 px-3 border-b border-line", alignClass[align], className)} {...rest}>
      <div className={cn("inline-flex items-center gap-0.5", align === "right" && "justify-end")}>
        {actions.map(({ icon: Icon, label, onClick, disabled }, i) => (
          <button
            key={i}
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-3 hover:bg-bg-lv3 hover:text-ink-1 disabled:opacity-40"
          >
            <Icon size={14} />
          </button>
        ))}
        {overflow && (
          <button
            type="button"
            onClick={onOverflow}
            aria-label="More actions"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-3 hover:bg-bg-lv3 hover:text-ink-1"
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </div>
    </td>
  );
}

interface CellSelectionProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "onChange"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabel?: string;
}

function CellSelection({ className, checked, onChange, ariaLabel = "Select row", ...rest }: CellSelectionProps) {
  return (
    <td className={cn("h-12 w-10 px-3 border-b border-line", className)} {...rest}>
      <Checkbox
        checked={checked}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
        aria-label={ariaLabel}
      />
    </td>
  );
}

// ───── Sort indicator ─────

interface SortIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, "dir"> {
  direction?: SortDir;
}

function SortIndicator({ className, direction, ...rest }: SortIndicatorProps) {
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <span className={cn("inline-flex shrink-0 text-ink-3", direction && "text-ink-1", className)} {...rest}>
      <Icon size={12} />
    </span>
  );
}

// ───── Compound export ─────

export const Table = Object.assign(forwardRef<HTMLTableElement, TableProps>(function Table(props, ref) {
  return <TableRoot {...props} />;
}), {
  Head,
  Body,
  Row,
  HeaderText,
  HeaderSelection,
  CellText,
  CellBadge,
  CellMedia,
  CellAction,
  CellSelection,
  SortIndicator,
});

export type { TableRowProps, HeaderTextProps, HeaderSelectionProps, CellTextProps, CellBadgeProps, CellMediaProps, CellActionProps, CellSelectionProps, SortIndicatorProps, SortDir };
