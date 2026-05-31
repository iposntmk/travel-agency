"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";
import type { HeaderNavItem } from "@/types/navigation";

interface Props {
  open: boolean;
  items: HeaderNavItem[];
  primaryItem?: HeaderNavItem;
  isActive: (href: string) => boolean;
  firstLinkRef: RefObject<HTMLAnchorElement | null>;
  onClose: () => void;
}

export function SiteNavMobile({ open, items, primaryItem, isActive, firstLinkRef, onClose }: Props) {
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
              <MobileLink item={item} active={isActive(item.href)} refValue={idx === 0 ? firstLinkRef : undefined} />
              {item.children?.length ? (
                <ul className="ml-3 border-l border-navy-100 pl-2">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <MobileLink item={child} active={isActive(child.href)} child />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
          {primaryItem ? <PrimaryMobileLink item={primaryItem} /> : null}
        </ul>
      </nav>
    </div>
  );
}

function MobileLink({
  item,
  active,
  refValue,
  child = false
}: {
  item: HeaderNavItem;
  active: boolean;
  refValue?: RefObject<HTMLAnchorElement | null>;
  child?: boolean;
}) {
  return (
    <Link
      ref={refValue}
      href={item.href}
      target={item.target}
      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-xl px-4 py-3 font-medium transition-colors",
        child ? "text-sm" : "text-base",
        active ? "bg-navy-50 text-navy-900" : "text-slate-700 hover:bg-navy-50 hover:text-navy-900"
      )}
    >
      {item.label}
    </Link>
  );
}

function PrimaryMobileLink({ item }: { item: HeaderNavItem }) {
  return (
    <li className="mt-2 border-t border-navy-100 pt-2">
      <Link
        href={item.href}
        target={item.target}
        rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
        className="block rounded-xl bg-brand-green px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-brand-green-dark"
      >
        {item.label}
      </Link>
    </li>
  );
}
