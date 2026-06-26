"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ImageCard } from "./image-card";
import type { HomeDestinationItem } from "./types";

export function DestinationMobileCarousel({ items }: { items: HomeDestinationItem[] }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const max = Math.max(0, items.length - 1);
  const go = (next: number) => setIndex(Math.max(0, Math.min(next, max)));
  return (
    <div
      className="relative touch-pan-y md:hidden"
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
        touchEnd.current = event.touches[0].clientX;
      }}
      onTouchMove={(event) => {
        touchEnd.current = event.touches[0].clientX;
      }}
      onTouchEnd={() => {
        const diff = touchStart.current - touchEnd.current;
        if (Math.abs(diff) > 50) go(diff > 0 ? index + 1 : index - 1);
      }}
    >
      {index > 0 ? <Arrow side="left" onClick={() => go(index - 1)} /> : null}
      {index < max ? <Arrow side="right" onClick={() => go(index + 1)} /> : null}
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {items.map((item) => (
            <div key={item.id} className="w-full shrink-0 px-4">
              <ImageCard item={item} tall />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {items.map((item, dot) => (
          <button key={item.id} type="button" onClick={() => go(dot)} className={cn("size-2 rounded-full transition-all duration-300 border border-white/30", dot === index ? "bg-[var(--izitour-primary)]" : "bg-white hover:bg-white/80")} aria-label={`Go to slide ${dot + 1}`} />
        ))}
      </div>
    </div>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button type="button" onClick={onClick} className={cn("absolute top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg", side === "left" ? "left-2" : "right-2")} aria-label={side === "left" ? "Previous" : "Next"}>
      <Icon className="size-5 text-[var(--izitour-text)]" />
    </button>
  );
}
