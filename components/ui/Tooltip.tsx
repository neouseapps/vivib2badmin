"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "./lib/cva";

type Position = "top" | "bottom" | "left" | "right";
type BeakPosition = "start" | "center" | "end";

const positionClass: Record<Position, string> = {
  top:    "bottom-full mb-2",
  bottom: "top-full mt-2",
  left:   "right-full mr-2 top-1/2 -translate-y-1/2",
  right:  "left-full ml-2 top-1/2 -translate-y-1/2",
};

const alignClass: Record<Position, Record<BeakPosition, string>> = {
  top:    { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" },
  bottom: { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" },
  left:   { start: "", center: "", end: "" },
  right:  { start: "", center: "", end: "" },
};

const beakClass: Record<Position, Record<BeakPosition, string>> = {
  top: {
    start:  "bottom-[-4px] left-3",
    center: "bottom-[-4px] left-1/2 -translate-x-1/2",
    end:    "bottom-[-4px] right-3",
  },
  bottom: {
    start:  "top-[-4px] left-3",
    center: "top-[-4px] left-1/2 -translate-x-1/2",
    end:    "top-[-4px] right-3",
  },
  left:   { start: "right-[-4px] top-3", center: "right-[-4px] top-1/2 -translate-y-1/2", end: "right-[-4px] bottom-3" },
  right:  { start: "left-[-4px] top-3", center: "left-[-4px] top-1/2 -translate-y-1/2", end: "left-[-4px] bottom-3" },
};

export interface TooltipProps {
  content: ReactNode;
  position?: Position;
  beakPosition?: BeakPosition;
  showBeak?: boolean;
  delay?: number;
  className?: string;
  children: ReactElement;
}

export function Tooltip({
  content,
  position = "top",
  beakPosition = "center",
  showBeak = true,
  delay = 0,
  className,
  children,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const show = () => {
    if (delay) timer = setTimeout(() => setOpen(true), delay);
    else setOpen(true);
  };
  const hide = () => {
    if (timer) clearTimeout(timer);
    setOpen(false);
  };

  const triggerProps = {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    "aria-describedby": open ? id : undefined,
  };

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, triggerProps)
    : children;

  return (
    <span className="relative inline-flex">
      {trigger}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute z-40 px-2 py-1 rounded-md bg-ink-1 text-white text-cap-md whitespace-nowrap pointer-events-none",
            positionClass[position],
            (position === "top" || position === "bottom") && alignClass[position][beakPosition],
            className
          )}
        >
          {content}
          {showBeak && (
            <span
              aria-hidden
              className={cn(
                "absolute h-2 w-2 rotate-45 bg-ink-1",
                beakClass[position][beakPosition]
              )}
            />
          )}
        </span>
      )}
    </span>
  );
}
