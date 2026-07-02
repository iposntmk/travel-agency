"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "tc-wishlist";

type WishlistEntry = { type: string; slug: string };

interface WishlistButtonProps {
  type: "tour" | "cruise" | "car-rental" | "experience";
  slug: string;
  className?: string;
}

/**
 * localStorage-backed wishlist toggle. No account required — keeps ISR HTML
 * user-agnostic. Renders a neutral (empty) state until mount to avoid a
 * hydration mismatch between server HTML and the client's saved list.
 */
export function WishlistButton({ type, slug, className }: WishlistButtonProps) {
  const t = useTranslations("wishlist");
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(readWishlist().some((e) => e.type === type && e.slug === slug));
  }, [type, slug]);

  function toggle() {
    const next = saved
      ? readWishlist().filter((e) => !(e.type === type && e.slug === slug))
      : [...readWishlist(), { type, slug }];
    writeWishlist(next);
    setSaved(!saved);
  }

  const active = mounted && saved;
  const label = active ? t("remove") : t("add");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={
        className ??
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-card backdrop-blur transition hover:scale-105"
      }
    >
      <Heart
        className="h-4 w-4"
        strokeWidth={1.8}
        fill={active ? "currentColor" : "none"}
        color={active ? "#C65A3A" : "currentColor"}
        aria-hidden="true"
      />
    </button>
  );
}

function readWishlist(): WishlistEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is WishlistEntry =>
        typeof e === "object" && e !== null && typeof (e as WishlistEntry).type === "string" && typeof (e as WishlistEntry).slug === "string"
    );
  } catch {
    return [];
  }
}

function writeWishlist(entries: WishlistEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage disabled / quota — non-fatal, wishlist just won't persist
  }
}
