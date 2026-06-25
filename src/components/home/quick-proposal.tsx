"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useState } from "react";
import type { Destination } from "@/payload-types";

interface Props {
  destinations: Destination[];
}

export function QuickProposal({ destinations }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-elevated md:p-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 text-left text-sm font-medium text-slate-700 md:hidden"
        >
          <span>Find your trip</span>
          <Search className="h-4 w-4" aria-hidden />
        </button>
        <div className="hidden items-center gap-3 md:flex">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green">Start here</p>
            <p className="truncate text-sm font-medium text-slate-700">
              Tell us where you want to go and we will shape a private route.
            </p>
          </div>
          <Link
            href="/customize-tour"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-green px-5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            Free proposal
          </Link>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-white p-4 md:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-green">Find your trip</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200"
              aria-label="Close search"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-950">Where would you like to go?</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {destinations.map((destination) => (
                  <Link
                    key={destination.id}
                    href={`/destinations/${destination.slug}`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {destination.title}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/customize-tour"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-green px-5 text-sm font-semibold text-white"
            >
              Start a free proposal
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
