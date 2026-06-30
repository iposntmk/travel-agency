"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useCurrency } from "./currency-provider";

interface CurrencySelectorProps {
  className?: string;
}

/**
 * Storefront currency switcher. Updates the active currency in context (instant,
 * no reload) and persists the choice to a cookie. Hidden when fewer than two
 * currencies are configured — nothing to switch between.
 */
export function CurrencySelector({ className }: CurrencySelectorProps) {
  const ctx = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ctx || ctx.currencies.length < 2) return null;
  const { currencies, active, setActive } = ctx;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change currency, current ${active.code}`}
        className="flex items-center gap-1.5 rounded-full border border-[var(--tctravel-border)] px-3 py-1.5 text-sm font-bold text-[var(--tctravel-text)] transition-colors hover:bg-gray-100"
      >
        <span aria-hidden>{active.symbol}</span>
        <span>{active.code}</span>
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Currency"
          className="absolute right-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-md border border-[var(--tctravel-border)] bg-white py-1 shadow-lg"
        >
          {currencies.map((c) => {
            const selected = c.code === active.code;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setActive(c.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-[var(--tctravel-primary)] hover:text-white",
                    selected ? "font-bold text-[var(--tctravel-primary)]" : "text-[var(--tctravel-text)]"
                  )}
                >
                  <span aria-hidden className="w-4 text-left">
                    {c.symbol}
                  </span>
                  <span className="w-9 text-left">{c.code}</span>
                  <span className="truncate text-xs opacity-70">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
