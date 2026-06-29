"use client";

import { ChevronDown, Star } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { lexicalToHtml } from "@/lib/lexical";
import type { Tour } from "@/payload-types";

interface Props {
  items: NonNullable<Tour["itinerary"]>;
}

export function TourItinerary({ items }: Props) {
  const [open, setOpen] = useState(0);
  const allExpanded = open === -2;

  const toggle = useCallback(
    (index: number) => {
      if (allExpanded) {
        setOpen(-2);
      } else {
        setOpen(open === index ? -1 : index);
      }
    },
    [open, allExpanded]
  );

  const expandAll = useCallback(() => {
    setOpen(allExpanded ? 0 : -2);
  }, [allExpanded]);

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Itinerary</h2>

      {/* Day tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-2">
        {items.map((item, index) => (
          <button
            key={item.id ?? index}
            type="button"
            onClick={() => {
              setOpen(index);
              document.getElementById(`itinerary-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className={cn(
              "shrink-0 px-4 py-2 text-sm font-semibold transition-colors cursor-pointer border-b-2",
              (open === index || allExpanded)
                ? "border-[#00947d] text-[#00947d] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            Day {index + 1}
          </button>
        ))}
      </div>

      {/* Expand/Collapse toggle */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-bold text-navy-950">Day by day itinerary</span>
        <button
          type="button"
          onClick={expandAll}
          className="text-sm font-bold text-[#00947d] hover:underline cursor-pointer"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Itinerary items — border-bottom accordion style */}
      <div className="mt-4">
        {items.map((item, index) => {
          const html = lexicalToHtml(item.activity);
          const isOpen = allExpanded || open === index;
          const included = Array.isArray(item.included) ? item.included : [];
          return (
            <div
              key={item.id ?? index}
              id={`itinerary-${index}`}
              className="border-b border-slate-200 scroll-mt-20"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between py-4 px-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#00947d] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.time && (
                      <p className="text-xs font-semibold text-slate-400">{item.time}</p>
                    )}
                    {item.location && (
                      <p className="truncate text-sm font-bold text-navy-950">{item.location}</p>
                    )}
                    {item.distance && (
                      <p className="text-xs text-slate-400">{item.distance}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Expand</span>
                  <ChevronDown
                    className={cn("size-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
                    aria-hidden
                  />
                </div>
              </button>
              {isOpen ? (
                <div className="px-2 pb-4 pl-12">
                  {item.title && (
                    <p className="mb-2 text-sm font-bold text-navy-950">{item.title}</p>
                  )}
                  {html ? (
                    <div
                      className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  ) : null}
                  {item.note && (
                    <div className="mt-3 rounded bg-[#fff8e1] p-3 text-xs text-[#8a6d3b]">
                      <strong>Note:</strong> {item.note}
                    </div>
                  )}
                  {included.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-bold text-navy-950">Included:</p>
                      <div className="flex flex-wrap gap-2">
                        {included.map((inc, i) => (
                          <span
                            key={inc.id ?? i}
                            className="rounded-full bg-[#e8f5e9] px-3 py-1 text-xs text-[#2e7d32]"
                          >
                            {inc.item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.hotelName && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-navy-950">{item.hotelName}</span>
                      {typeof item.hotelStars === "number" && item.hotelStars > 0 && (
                        <span className="flex gap-0.5">
                          {Array.from({ length: item.hotelStars }).map((_, i) => (
                            <Star key={i} className="size-3 fill-[#faca1a] text-[#faca1a]" />
                          ))}
                        </span>
                      )}
                      {item.hotelRoom && <span className="text-xs text-slate-500">({item.hotelRoom})</span>}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
