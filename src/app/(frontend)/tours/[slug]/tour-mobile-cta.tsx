"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Price } from "@/components/currency/price";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "prices", label: "Prices" },
  { id: "inclusions", label: "Inclusions" },
  { id: "reviews", label: "Reviews" },
  { id: "goodtoknow", label: "Good to know" },
] as const;

export function TourStickyTabs() {
  const [active, setActive] = useState("overview");

  const scrollTo = useCallback((id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const ids = TABS.map((t) => t.id);
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (ids.includes(id as (typeof TABS)[number]["id"])) setActive(id as (typeof TABS)[number]["id"]);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-page overflow-x-auto px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollTo(tab.id)}
            className={cn(
              "shrink-0 px-5 py-3 text-sm font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap",
              active === tab.id
                ? "border-[#00947d] text-[#00947d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

interface BottomCtaProps {
  slug: string;
  isFree: boolean;
  priceFrom?: number | null;
}

export function TourMobileBottomCta({ slug, isFree, priceFrom }: BottomCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-3 shadow-elevated lg:hidden">
      <div className="mx-auto flex max-w-page items-center justify-between gap-3">
        <div>
          <span className="text-xs text-brand-red">From </span>
          <span className="text-lg font-bold text-brand-red">
            {isFree ? "Free" : <Price base={priceFrom ?? 0} />}
          </span>
          {!isFree && <span className="text-xs text-slate-400"> /pax</span>}
        </div>
        <Link
          href={`/booking/${slug}`}
          className="rounded-full bg-[#fb6a00] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#e05e00] transition-colors"
        >
          Inquire Now
        </Link>
      </div>
    </div>
  );
}
