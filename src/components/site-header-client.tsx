"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DesktopNavItem, PrimaryLink } from "@/components/site-header-links";
import { SiteNavMobile } from "@/components/site-nav-mobile";
import { cn } from "@/lib/utils";
import type { HeaderNavItem } from "@/types/navigation";

interface Props {
  items: HeaderNavItem[];
}

export function SiteHeaderClient({ items }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const primaryItem = items.at(-1);
  const navItems = primaryItem ? items.slice(0, -1) : items;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstLinkRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-shadow duration-200 ease-out-soft",
        scrolled
          ? "border-navy-100/80 bg-white/95 shadow-card backdrop-blur"
          : "border-transparent bg-white/85 backdrop-blur"
      )}
    >
      <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-4 py-3 md:py-4">
        <Link href="/" className="group inline-flex items-center gap-2" aria-label="TC Travel Vietnam home">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-white shadow-card transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M3 12L11 4l3 3-5 5h11v2H9l5 5-3 3z" fill="currentColor" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-500">TC Travel</span>
            <span className="text-base font-semibold tracking-tight text-navy-900">Vietnam</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <DesktopNavItem key={item.href} item={item} isActive={isActive} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {primaryItem ? <PrimaryLink item={primaryItem} /> : null}
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-navy-100 bg-white text-navy-900 transition hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <SiteNavMobile
        open={open}
        items={navItems}
        primaryItem={primaryItem}
        isActive={isActive}
        firstLinkRef={firstLinkRef}
        onClose={() => setOpen(false)}
      />
    </header>
  );
}
