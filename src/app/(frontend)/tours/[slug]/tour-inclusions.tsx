"use client";

import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  inclusions: string[];
  exclusions: string[];
}

export function TourInclusions({ inclusions, exclusions }: Props) {
  const [incOpen, setIncOpen] = useState(true);
  const [excOpen, setExcOpen] = useState(true);

  return (
    <section id="inclusions" className="scroll-mt-20">
      <div className="grid gap-6 md:grid-cols-5">
        {/* Inclusions - 3/5 */}
        <div className="md:col-span-3">
          <button
            type="button"
            onClick={() => setIncOpen(!incOpen)}
            className="flex items-center gap-2 mb-3 cursor-pointer w-full"
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Inclusions</h2>
            <ChevronDown className={cn("size-5 text-slate-400 transition-transform", incOpen && "rotate-180")} />
          </button>
          {incOpen && (
            <ul className="space-y-2">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#00947d]" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Exclusions - 2/5 */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setExcOpen(!excOpen)}
            className="flex items-center gap-2 mb-3 cursor-pointer w-full"
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Exclusions</h2>
            <ChevronDown className={cn("size-5 text-slate-400 transition-transform", excOpen && "rotate-180")} />
          </button>
          {excOpen && (
            <ul className="space-y-2">
              {exclusions.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <X className="mt-0.5 size-4 shrink-0 text-brand-red" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
