"use client";

import { forwardRef, useMemo, type HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./lib/cva";

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  onRowsPerPageChange?: (n: number) => void;
}

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(function Pagination(
  { className, page, totalPages, onPageChange, rowsPerPage, rowsPerPageOptions, onRowsPerPageChange, ...rest },
  ref
) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  return (
    <div ref={ref} className={cn("flex items-center gap-3", className)} {...rest}>
      {rowsPerPage !== undefined && rowsPerPageOptions && onRowsPerPageChange && (
        <label className="inline-flex items-center gap-2 text-cap-md text-ink-2">
          Hiển thị
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="h-7 rounded-md border border-line bg-white px-1.5 text-cap-md focus:outline-none focus:border-ink-2"
          >
            {rowsPerPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      <nav role="navigation" aria-label="Pagination" className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-2 hover:bg-bg-lv2 disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-2 text-ink-3" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-cap-md transition-colors",
                p === page ? "bg-ink-1 text-white" : "text-ink-2 hover:bg-bg-lv2"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-2 hover:bg-bg-lv2 disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </nav>
    </div>
  );
});

export interface ResultCountProps extends HTMLAttributes<HTMLSpanElement> {
  total: number;
  shown?: number;
  label?: string;
}

export const ResultCount = forwardRef<HTMLSpanElement, ResultCountProps>(function ResultCount(
  { className, total, shown, label = "kết quả", ...rest },
  ref
) {
  return (
    <span ref={ref} className={cn("text-cap-md text-ink-3", className)} {...rest}>
      {shown !== undefined ? `Hiển thị ${shown} trên ${total} ${label}` : `${total} ${label}`}
    </span>
  );
});
