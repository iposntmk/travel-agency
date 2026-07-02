"use client";

import { useEffect, useState } from "react";

interface PromoCountdownProps {
  /** ISO end date passed from the server. */
  endsAt: string;
  className?: string;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

/**
 * Client countdown for a sale banner. Renders a neutral placeholder until
 * mount (hydration-safe), ticks every second, and hides itself at zero —
 * covering the up-to-300s ISR staleness of the server-rendered banner.
 */
export function PromoCountdown({ endsAt, className }: PromoCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = Date.parse(endsAt);
    const tick = () => setRemaining(end - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining === null) {
    return (
      <span className={className} suppressHydrationWarning>
        --:--:--
      </span>
    );
  }
  if (remaining <= 0) return null;

  return (
    <span className={className} suppressHydrationWarning>
      {formatRemaining(remaining)}
    </span>
  );
}
