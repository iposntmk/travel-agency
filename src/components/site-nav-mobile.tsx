"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
}

interface Props {
  open: boolean;
  items: NavItem[];
  isActive: (href: string) => boolean;
  firstLinkRef: RefObject<HTMLAnchorElement | null>;
  onClose: () => void;
}

export function SiteNavMobile({ open, items, isActive, firstLinkRef, onClose }: Props) {
  return (
    <div
      id="site-mobile-nav"
      className={cn("md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "fixed inset-0 z-30 bg-navy-950/40 transition-opacity duration-200 ease-out-soft",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <nav
        aria-label="Mobile primary"
        className={cn(
          "fixed inset-x-3 top-[64px] z-40 origin-top rounded-2xl border border-navy-100 bg-white p-2 shadow-elevated transition-all duration-200 ease-out-soft",
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        )}
      >
        <ul className="flex flex-col">
          {items.map((item, idx) => (
            <li key={item.href}>
              <Link
                ref={idx === 0 ? firstLinkRef : undefined}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-navy-50 text-navy-900"
                    : "text-slate-700 hover:bg-navy-50 hover:text-navy-900"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 border-t border-navy-100 pt-2">
            <Link
              href="/tours"
              className="block rounded-xl bg-navy-900 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-navy-800"
            >
              Book a tour
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
