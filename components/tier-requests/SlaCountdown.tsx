"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Quá hạn";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = totalMinutes % 60;
  if (days > 0) return `${days}n ${hours}g`;
  if (hours > 0) return `${hours}g ${mins}ph`;
  return `${mins}ph`;
}

function getColorClass(ms: number): string {
  if (ms <= 0) return "text-danger font-semibold";
  if (ms < 4 * 3600000) return "text-danger font-semibold";
  if (ms < 24 * 3600000) return "text-warn-text font-semibold";
  return "text-ink-2";
}

interface Props {
  deadline: string;
  className?: string;
}

export function SlaCountdown({ deadline, className }: Props) {
  const [remaining, setRemaining] = useState(() => new Date(deadline).getTime() - Date.now());

  useEffect(() => {
    const tick = () => setRemaining(new Date(deadline).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <span className={cn(getColorClass(remaining), className)}>
      {formatRemaining(remaining)}
    </span>
  );
}
