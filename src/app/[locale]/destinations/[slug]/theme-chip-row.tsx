"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface ThemeChip {
  id: string;
  label: string;
  /** Link target for the "view all" behaviour when JS filters aren't enough. */
  href: string;
}

export interface ChipFilterItem {
  key: string | number;
  /** Category ids this card belongs to (string form). */
  categoryIds: string[];
  /** Server-rendered card. */
  node: React.ReactNode;
}

interface ThemeChipRowProps {
  chips: ThemeChip[];
  items: ChipFilterItem[];
  allLabel: string;
  viewAllLabel: string;
}

/**
 * 1-click experience chips (Cooking classes, Basket boats, Lanterns…) that
 * filter the server-rendered tour cards entirely client-side — no
 * searchParams, ISR stays intact. Each chip links to the filtered /tours page
 * as a no-JS fallback and "view all" escape hatch.
 */
export function ThemeChipRow({ chips, items, allLabel, viewAllLabel }: ThemeChipRowProps) {
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const visible = useMemo(
    () => (activeChip ? items.filter((item) => item.categoryIds.includes(activeChip)) : items),
    [items, activeChip]
  );
  const activeHref = chips.find((chip) => chip.id === activeChip)?.href;

  if (chips.length === 0) {
    return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => item.node)}</div>;
  }

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-3">
          <button
            type="button"
            onClick={() => setActiveChip(null)}
            aria-pressed={activeChip === null}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeChip === null
                ? "border-navy-950 bg-navy-950 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-navy-300"
            )}
          >
            {allLabel}
          </button>
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActiveChip(activeChip === chip.id ? null : chip.id)}
              aria-pressed={activeChip === chip.id}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeChip === chip.id
                  ? "border-navy-950 bg-navy-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-navy-300"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => item.node)}</div>
      ) : null}

      {activeChip && activeHref ? (
        <div className="mt-6 text-center">
          <a
            href={activeHref}
            className="inline-flex items-center gap-1 rounded-full border border-navy-200 px-5 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-50"
          >
            {viewAllLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}
