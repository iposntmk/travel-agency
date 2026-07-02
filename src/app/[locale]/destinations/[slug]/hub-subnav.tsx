"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface HubSection {
  id: string;
  label: string;
}

interface HubSubnavProps {
  sections: HubSection[];
}

/**
 * GetYourGuide-style sticky sub-nav for the destination hub. Pure anchors on a
 * single ISR page; scroll-spy highlights the section in view.
 */
export function HubSubnav({ sections }: HubSubnavProps) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-[60px] z-30 -mx-4 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:top-[110px]"
    >
      <ul className="flex gap-1 py-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "inline-block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active === section.id
                  ? "bg-navy-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-navy-950"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
