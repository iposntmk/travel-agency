import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { NavItem, NavTarget } from "@/types/navigation";

type NavigationLocation = "header" | "footer";

type RawNavItem = {
  label?: unknown;
  href?: unknown;
  target?: unknown;
  children?: RawNavItem[] | null;
};

type RawNavigationDoc = {
  items?: RawNavItem[] | null;
};

type PublicFindPayload = {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[] }>;
};

const DEFAULT_HEADER_NAV: NavItem[] = [];

const DEFAULT_FOOTER_NAV: NavItem[] = [];

async function fetchNavigation(location: NavigationLocation): Promise<NavItem[]> {
  const payload = (await getPayloadClient()) as unknown as PublicFindPayload;
  try {
    const result = await payload.find({
      collection: "navigation",
      where: { and: [{ location: { equals: location } }, { status: { equals: "published" } }] },
      limit: 1,
      depth: 0,
      sort: "-updatedAt"
    });
    const doc = result.docs[0] as RawNavigationDoc | undefined;
    return normalizeItems(doc?.items);
  } catch (error) {
    if (isMissingNavigationTableError(error)) return [];
    throw error;
  }
}

const getNavigationCached = cache((location: NavigationLocation) =>
  unstable_cache(() => fetchNavigation(location), ["cms", "navigation", location], {
    tags: ["navigation", `navigation-${location}`]
  })()
);

export async function getHeaderNavigation(): Promise<NavItem[]> {
  const items = await getNavigationCached("header");
  return items.length > 0 ? items : DEFAULT_HEADER_NAV;
}

export async function getFooterNavigation(): Promise<NavItem[]> {
  const items = await getNavigationCached("footer");
  return items.length > 0 ? items : DEFAULT_FOOTER_NAV;
}

function normalizeItems(items?: RawNavItem[] | null): NavItem[] {
  return (items ?? []).map(normalizeItem).filter((item): item is NavItem => Boolean(item));
}

function normalizeItem(item: RawNavItem): NavItem | null {
  const label = cleanString(item.label);
  if (!label) return null;

  const href = cleanString(item.href);
  const children = normalizeItems(item.children);
  if (!href && children.length === 0) return null;

  return {
    label,
    ...(href ? { href } : {}),
    target: normalizeTarget(item.target),
    ...(children.length > 0 ? { children } : {})
  };
}

function normalizeTarget(value: unknown): NavTarget {
  return value === "_blank" ? "_blank" : "_self";
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isMissingNavigationTableError(error: unknown): boolean {
  const record = asErrorRecord(error);
  const cause = asErrorRecord(record.cause);
  if (cause.code === "42P01") return true;
  return typeof record.message === "string" && record.message.includes('relation "navigation" does not exist');
}

function asErrorRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}
