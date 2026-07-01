"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CurrencySelector } from "@/components/currency/currency-selector";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { HeaderNavItem } from "@/types/navigation";

interface Props {
  items: HeaderNavItem[];
  children?: React.ReactNode;
}

export function SiteHeaderClient({ items, children }: Props) {
  const t = useTranslations("a11y");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
      {children}
      <div className="border-b border-[var(--tctravel-border)]">
        <div className="container-center flex h-[60px] items-center justify-between lg:h-[72px]">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md text-[var(--tctravel-text)] hover:bg-gray-100 lg:hidden"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="size-7" />
          </button>
          <Logo />
          <nav aria-label={t("primaryNav")} className="hidden items-center gap-1 lg:flex">
            {items.map((item) => (
              <DesktopDropdown key={`${item.href}-${item.label}`} item={item} isActive={isActive} />
            ))}
            <CurrencySelector className="ml-3" />
            <span className="ml-3 flex size-11 items-center justify-center rounded-full border border-[var(--tctravel-border)] text-[var(--tctravel-text-light)]">
              <User className="size-4" />
            </span>
          </nav>
          <div className="flex items-center gap-2 lg:hidden">
            <CurrencySelector />
            <LanguageSwitcher className="rounded-full border border-[var(--tctravel-border)] px-2 py-1.5 text-sm font-bold text-[var(--tctravel-text)]" />
          </div>
        </div>
      </div>
      <MobileDrawer open={open} items={items} closeRef={closeRef} onClose={() => setOpen(false)} />
    </header>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="TC Travel Vietnam home">
      <span className="text-2xl font-black tracking-tight text-[var(--tctravel-primary)]">TC</span>
      <span className="hidden text-sm font-bold uppercase tracking-[0.16em] text-[var(--tctravel-dark)] sm:inline">Travel Vietnam</span>
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
        className={cn("flex min-h-11 items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors", isActive(item.href) ? "text-[var(--tctravel-primary)]" : "text-[var(--tctravel-text)] hover:text-[var(--tctravel-primary)]")}
      >
        {item.label}
        {children.length > 0 ? <ChevronDown className="size-3" /> : null}
      </Link>
      {children.length > 0 ? (
        <div className="invisible absolute left-0 top-full z-50 min-w-[220px] rounded-b-md border border-[var(--tctravel-border)] bg-white shadow-lg p-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
          {children.map((child) => (
            <Link key={`${child.href}-${child.label}`} href={child.href} className="block px-3 py-2 text-sm text-[var(--tctravel-text)] transition-colors hover:bg-[var(--tctravel-primary)] hover:text-white rounded">
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileDrawer({ open, items, closeRef, onClose }: { open: boolean; items: HeaderNavItem[]; closeRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  const t = useTranslations("a11y");
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!open) return null;

  return (
    <div id="site-mobile-nav" className="fixed inset-0 z-50 lg:hidden">
      <button type="button" aria-label={t("menuOverlay")} className="absolute inset-0 bg-black/55" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[86vw] max-w-sm overflow-y-auto bg-white shadow-2xl">
        <div className="flex h-[60px] items-center justify-between border-b border-[var(--tctravel-border)] px-4">
          <Logo />
          <button ref={closeRef} type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-md hover:bg-gray-100" aria-label={t("closeMenu")}>
            <X className="size-6" />
          </button>
        </div>
        <nav className="p-4">
          {items.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <div key={`${item.href}-${item.label}`} className="border-b border-[var(--tctravel-border)] py-1">
                <div className="flex items-center justify-between">
                  <Link href={item.href} onClick={onClose} className="py-3 text-sm font-bold uppercase text-[var(--tctravel-dark)]">{item.label}</Link>
                  {hasChildren ? (
                    <button type="button" onClick={() => setExpanded(expanded === item.href ? null : item.href)} className="size-10" aria-label={t("toggleSubmenu", { label: item.label })}>
                      <ChevronDown className={cn("mx-auto size-4 transition", expanded === item.href && "rotate-180")} />
                    </button>
                  ) : null}
                </div>
                {hasChildren && expanded === item.href ? (
                  <div className="pb-3 pl-4">
                    {item.children?.map((child) => (
                      <Link key={`${child.href}-${child.label}`} href={child.href} onClick={onClose} className="block py-2 text-sm text-[var(--tctravel-body)]">{child.label}</Link>
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
