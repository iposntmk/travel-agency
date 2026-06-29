"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GOOD_TO_KNOW_DATA, type GoodToKnowItem } from "./good-to-know-data";

interface TourGoodToKnowProps {
  faqs?: GoodToKnowItem[];
}

export function TourGoodToKnow({ faqs = [] }: TourGoodToKnowProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items: GoodToKnowItem[] = [...faqs, ...GOOD_TO_KNOW_DATA];

  return (
    <section id="goodtoknow" className="scroll-mt-20">
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Good to know</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        {items.map((item, i) => (
          <div key={item.title} className="border-b border-slate-200 last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="text-sm font-bold text-navy-950">{item.title}</span>
              <ChevronDown className={cn("size-4 text-slate-400 transition-transform", openIdx === i && "rotate-180")} />
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 text-sm leading-6 text-slate-600">{item.content}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
