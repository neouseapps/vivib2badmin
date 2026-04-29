"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { UploadCloud, FileIcon, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cva, cn, type VariantProps } from "./lib/cva";
import { Button } from "./Button";
import { Progress } from "./Progress";

// ─── shared helpers ──────────────────────────────────

export interface UploadEntry {
  id: string;
  file: File;
  progress?: number; // 0–100, undefined = idle
  error?: string;
  url?: string; // preview URL for images
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

// ─── UploadFile ──────────────────────────────────────

const dropzoneStyles = cva(
  "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
  {
    variants: {
      state: {
        default:  "border-line bg-bg-lv1 hover:bg-bg-lv2",
        dragging: "border-brand bg-brand-50",
        error:    "border-danger bg-danger-light",
        disabled: "border-line bg-bg-lv2 opacity-60 cursor-not-allowed",
      },
    },
    defaultVariants: { state: "default" },
  }
);

export interface UploadFileProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  value?: UploadEntry[];
  onChange?: (entries: UploadEntry[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  disabled?: boolean;
  description?: ReactNode;
  state?: VariantProps<typeof dropzoneStyles>["state"];
}

export const UploadFile = forwardRef<HTMLDivElement, UploadFileProps>(function UploadFile(
  { className, value = [], onChange, accept, multiple = true, maxSize, disabled, description, state, ...rest },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFiles = useCallback(
    (list: FileList | File[]) => {
      const files = Array.from(list);
      const next: UploadEntry[] = [];
      let counter = value.length;
      for (const f of files) {
        const tooBig = maxSize && f.size > maxSize;
        next.push({
          id: `f-${++counter}-${f.name}`,
          file: f,
          error: tooBig ? `Vượt quá ${formatBytes(maxSize)}` : undefined,
        });
      }
      onChange?.(multiple ? [...value, ...next] : next.slice(0, 1));
    },
    [maxSize, multiple, onChange, value]
  );

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) acceptFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files) acceptFiles(e.dataTransfer.files);
  };

  const remove = (id: string) => onChange?.(value.filter((e) => e.id !== id));
  const finalState = state ?? (disabled ? "disabled" : dragging ? "dragging" : "default");

  return (
    <div ref={ref} className={cn("flex flex-col gap-3", className)} {...rest}>
      <label
        className={dropzoneStyles({ state: finalState })}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <UploadCloud size={28} className={cn("text-ink-3", dragging && "text-brand")} />
        <div className="flex flex-col gap-0.5">
          <span className="text-body text-ink-1 font-medium">
            Kéo thả file vào đây hoặc <span className="text-brand underline">chọn file</span>
          </span>
          {description && <span className="text-cap-md text-ink-3">{description}</span>}
          {maxSize && !description && (
            <span className="text-cap-md text-ink-3">Tối đa {formatBytes(maxSize)} mỗi file</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onInput}
          className="sr-only"
        />
      </label>

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((entry) => (
            <li
              key={entry.id}
              className={cn(
                "flex items-center gap-3 rounded-md border p-2.5",
                entry.error ? "border-danger bg-danger-light" : "border-line bg-bg-lv1"
              )}
            >
              {entry.error ? (
                <AlertCircle size={20} className="shrink-0 text-danger" />
              ) : (
                <FileIcon size={20} className="shrink-0 text-ink-3" />
              )}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-body text-ink-1 truncate">{entry.file.name}</span>
                  <span className="text-cap-md text-ink-3 shrink-0">{formatBytes(entry.file.size)}</span>
                </div>
                {entry.error ? (
                  <span className="text-cap-md text-danger-strong">{entry.error}</span>
                ) : entry.progress !== undefined && entry.progress < 100 ? (
                  <Progress value={entry.progress} size="sm" />
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label="Remove file"
                className="rounded p-1 text-ink-3 hover:bg-bg-lv3 hover:text-ink-1"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

// ─── UploadImage ──────────────────────────────────────

export interface UploadImageProps extends Omit<UploadFileProps, "accept"> {
  /** Override accept; default `image/*` */
  accept?: string;
}

export const UploadImage = forwardRef<HTMLDivElement, UploadImageProps>(function UploadImage(
  { className, value = [], onChange, accept = "image/*", multiple = true, maxSize, disabled, description, state, ...rest },
  ref
) {
  // Hydrate previews
  useEffect(() => {
    const next = value.map((e) => {
      if (e.url || e.error) return e;
      return { ...e, url: URL.createObjectURL(e.file) };
    });
    if (next.some((e, i) => e.url !== value[i].url)) onChange?.(next);
    return () => {
      value.forEach((e) => e.url && URL.revokeObjectURL(e.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.length]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFiles = useCallback(
    (list: FileList | File[]) => {
      const files = Array.from(list);
      const next: UploadEntry[] = [];
      let counter = value.length;
      for (const f of files) {
        const tooBig = maxSize && f.size > maxSize;
        next.push({
          id: `i-${++counter}-${f.name}`,
          file: f,
          error: tooBig ? `Vượt quá ${formatBytes(maxSize)}` : undefined,
          url: tooBig ? undefined : URL.createObjectURL(f),
        });
      }
      onChange?.(multiple ? [...value, ...next] : next.slice(0, 1));
    },
    [maxSize, multiple, onChange, value]
  );

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) acceptFiles(e.target.files);
    e.target.value = "";
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files) acceptFiles(e.dataTransfer.files);
  };
  const remove = (id: string) => {
    const target = value.find((e) => e.id === id);
    if (target?.url) URL.revokeObjectURL(target.url);
    onChange?.(value.filter((e) => e.id !== id));
  };

  const finalState = state ?? (disabled ? "disabled" : dragging ? "dragging" : "default");

  return (
    <div ref={ref} className={cn("flex flex-col gap-3", className)} {...rest}>
      <label
        className={dropzoneStyles({ state: finalState })}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <ImageIcon size={28} className={cn("text-ink-3", dragging && "text-brand")} />
        <div className="flex flex-col gap-0.5">
          <span className="text-body text-ink-1 font-medium">
            Kéo thả ảnh hoặc <span className="text-brand underline">chọn ảnh</span>
          </span>
          {description && <span className="text-cap-md text-ink-3">{description}</span>}
          {maxSize && !description && (
            <span className="text-cap-md text-ink-3">Tối đa {formatBytes(maxSize)} mỗi ảnh</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onInput}
          className="sr-only"
        />
      </label>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-md border bg-bg-lv2",
                entry.error ? "border-danger" : "border-line"
              )}
            >
              {entry.url ? (
                <img src={entry.url} alt={entry.file.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <AlertCircle size={20} className="text-danger" />
                </div>
              )}
              {entry.progress !== undefined && entry.progress < 100 && (
                <div className="absolute inset-x-1 bottom-1">
                  <Progress value={entry.progress} size="sm" />
                </div>
              )}
              {entry.error && (
                <div className="absolute inset-x-0 bottom-0 bg-danger px-1.5 py-0.5 text-cap text-white truncate">
                  {entry.error}
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label="Remove image"
                className="absolute top-1 right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// re-export Button so callers can build a "Browse" trigger easily
export { Button as _UploadButton };
