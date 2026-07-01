"use client";

import { useState } from "react";
import type { TocHeading } from "@/lib/lexical";

interface BlogTocProps {
  headings: TocHeading[];
}

export function BlogToc({ headings }: BlogTocProps) {
  const [open, setOpen] = useState(true);

  if (headings.length === 0) return null;

  return (
    <div className="my-8 rounded-xl border border-navy-100 bg-white p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold text-navy-950">Table of Contents</span>
        <span className="text-xs font-medium text-brand-blue">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? (
        <ul className="mt-3 space-y-1.5">
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? "1rem" : h.level === 4 ? "2rem" : 0 }}>
              <a
                href={`#${h.id}`}
                className="text-sm leading-6 text-navy-700 transition-colors hover:text-brand-blue hover:underline"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
