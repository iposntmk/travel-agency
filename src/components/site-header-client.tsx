"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, Menu, Search, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { HeaderNavItem } from "@/types/navigation";

interface Props {
  items: HeaderNavItem[];
}

export function SiteHeaderClient({ items }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"EN" | "VI">("EN");
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn("fixed left-0 right-0 top-0 z-50 w-full bg-white transition-shadow duration-300", scrolled && "shadow-md")}
    >
      <div className="hidden bg-[#0f2421] text-white lg:block">
        <div className="container-center flex h-[38px] items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <span>TC Travel Vietnam</span>
            <span>Local guides · Custom proposals · Book now, pay later</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-[var(--izitour-orange)]">Contact</Link>
            <Search className="size-4" />
            <button type="button" onClick={() => setLang(lang === "EN" ? "VI" : "EN")} className="font-bold">{lang}</button>
          </div>
        </div>
      </div>
      <div className="border-b border-[var(--izitour-border)]">
        <div className="container-center flex h-[60px] items-center justify-between lg:h-[72px]">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md text-[var(--izitour-text)] hover:bg-gray-100 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="size-7" />
          </button>
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {items.map((item) => (
              <DesktopDropdown key={item.href} item={item} isActive={isActive} />
            ))}
            <span className="ml-3 flex size-11 items-center justify-center rounded-full border border-[var(--izitour-border)] text-[var(--izitour-text-light)]">
              <User className="size-4" />
            </span>
          </nav>
          <button
            type="button"
            onClick={() => setLang(lang === "EN" ? "VI" : "EN")}
            className="flex items-center gap-1 rounded-full border border-[var(--izitour-border)] px-4 py-2 text-sm font-bold lg:hidden"
          >
            <Globe className="size-4" /> {lang}
          </button>
        </div>
      </div>
      <MobileDrawer open={open} items={items} closeRef={closeRef} onClose={() => setOpen(false)} />
    </header>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="TC Travel Vietnam home">
      <span className="text-2xl font-black tracking-tight text-[var(--izitour-primary)]">TC</span>
      <span className="hidden text-sm font-bold uppercase tracking-[0.16em] text-[var(--izitour-dark)] sm:inline">Travel Vietnam</span>
    </Link>
  );
}

function DesktopDropdown({ item, isActive }: { item: HeaderNavItem; isActive: (href: string) => boolean }) {
  const children = item.children ?? [];
  return (
    <div className="group relative">
      <Link
        href={item.href}
        target={item.target}
        className={cn("flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-bold uppercase text-[var(--izitour-text)] hover:text-[var(--izitour-primary)]", isActive(item.href) && "text-[var(--izitour-primary)]")}
      >
        {item.label}
        {children.length > 0 ? <ChevronDown className="size-3.5" /> : null}
      </Link>
      {children.length > 0 ? (
        <div className="invisible absolute left-0 top-full z-50 w-64 rounded-lg border border-[var(--izitour-border)] bg-white p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
          {children.map((child) => (
            <Link key={child.href} href={child.href} className="block rounded-md px-3 py-2 text-sm font-medium text-[var(--izitour-text)] hover:bg-gray-50 hover:text-[var(--izitour-primary)]">
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileDrawer({ open, items, closeRef, onClose }: { open: boolean; items: HeaderNavItem[]; closeRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!open) return null;

  return (
    <div id="site-mobile-nav" className="fixed inset-0 z-50 lg:hidden">
      <button type="button" aria-label="Close menu overlay" className="absolute inset-0 bg-black/55" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[86vw] max-w-sm overflow-y-auto bg-white shadow-2xl">
        <div className="flex h-[60px] items-center justify-between border-b border-[var(--izitour-border)] px-4">
          <Logo />
          <button ref={closeRef} type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-md hover:bg-gray-100" aria-label="Close menu">
            <X className="size-6" />
          </button>
        </div>
        <nav className="p-4">
          {items.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <div key={item.href} className="border-b border-[var(--izitour-border)] py-1">
                <div className="flex items-center justify-between">
                  <Link href={item.href} onClick={onClose} className="py-3 text-sm font-bold uppercase text-[var(--izitour-dark)]">{item.label}</Link>
                  {hasChildren ? (
                    <button type="button" onClick={() => setExpanded(expanded === item.href ? null : item.href)} className="size-10" aria-label={`Toggle ${item.label}`}>
                      <ChevronDown className={cn("mx-auto size-4 transition", expanded === item.href && "rotate-180")} />
                    </button>
                  ) : null}
                </div>
                {hasChildren && expanded === item.href ? (
                  <div className="pb-3 pl-4">
                    {item.children?.map((child) => (
                      <Link key={child.href} href={child.href} onClick={onClose} className="block py-2 text-sm text-[var(--izitour-body)]">{child.label}</Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
