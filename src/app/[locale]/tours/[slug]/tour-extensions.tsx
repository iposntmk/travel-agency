"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const EXTENSION_TABS = ["Beach", "Cambodia", "Laos"] as const;

const EXTENSIONS_DATA: Record<string, { title: string; url: string; image: string; duration: string; priceFrom: string }[]> = {
  beach: [
    { title: "Phu Quoc Beach Escape", url: "/phu-quoc-beach-escape", image: "/images/destinations/dest-1.webp", duration: "04 Days", priceFrom: "$404" },
    { title: "Con Dao Island Beach Break", url: "/con-dao-island-beach-break", image: "/images/destinations/dest-2.webp", duration: "04 Days", priceFrom: "$585" },
  ],
  cambodia: [
    { title: "Timeless Angkor Temples", url: "/timeless-angkor-temples", image: "/images/destinations/dest-3.webp", duration: "04 Days", priceFrom: "$612" },
  ],
  laos: [],
};

export function TourExtensions() {
  const [activeTab, setActiveTab] = useState<(typeof EXTENSION_TABS)[number]>("Beach");
  const items = EXTENSIONS_DATA[activeTab.toLowerCase()] ?? [];

  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Extensions</h2>
      <p className="mt-2 text-sm text-slate-600">Why not treat yourself to a relaxing beach break or a cultural discovery?</p>

      <div className="mt-4 flex gap-0 border-b border-slate-200">
        {EXTENSION_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors cursor-pointer border-b-2 uppercase",
              activeTab === tab
                ? "border-[#00947d] text-[#00947d]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.map((ext) => (
            <Link
              key={ext.url}
              href={ext.url}
              className="group overflow-hidden rounded-xl border border-slate-200 transition-shadow hover:shadow-md"
            >
              <div className="relative h-48">
                <Image src={ext.image} alt={ext.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              </div>
              <div className="p-4">
                <div className="text-sm font-bold text-navy-950 group-hover:text-[#00947d]">{ext.title}</div>
                <div className="mt-2">
                  <span className="rounded border border-[#00947d] px-2 py-0.5 text-xs font-bold text-[#00947d]">{ext.duration}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-400">From <span className="font-bold text-brand-red">{ext.priceFrom}</span> /Person</span>
                  <span className="rounded bg-[#00947d] px-4 py-2 text-xs font-bold text-white group-hover:bg-[#007a67]">View detail</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400">No extensions available for this tour.</div>
      )}
    </section>
  );
}
