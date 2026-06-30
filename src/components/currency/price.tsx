"use client";

import { formatPrice } from "@/lib/currency";
import { useCurrency } from "./currency-provider";

interface PriceProps {
  /** Amount in the base currency (a tour's stored priceFrom / tier price). */
  base: number;
  /** Round to a whole number for tidy "from" prices. Default true. */
  round?: boolean;
  className?: string;
}

/**
 * Renders a base-currency amount in the visitor's selected currency. Falls back
 * to a plain `$` value when no currencies are configured. `suppressHydration-
 * Warning` covers the brief switch after the saved preference loads on mount.
 */
export function Price({ base, round = true, className }: PriceProps) {
  const ctx = useCurrency();

  if (!ctx) {
    return <span className={className}>{`$${round ? Math.round(base) : base}`}</span>;
  }

  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(base, ctx.active, { round })}
    </span>
  );
}

/** Inline currency code (e.g. "USD"), reactive to the active selection. */
export function ActiveCurrencyCode({ fallback = "USD" }: { fallback?: string }) {
  const ctx = useCurrency();
  return <span suppressHydrationWarning>{ctx?.active.code ?? fallback}</span>;
}
