import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Config } from "@/payload-types";

const asLocale = (locale: string): Config["locale"] => locale as Config["locale"];

export interface SitemapContentEntry {
  slug: string;
  updatedAt: string;
}

const SITEMAP_SELECT = {
  slug: true,
  updatedAt: true
} as const;

async function fetchTourSitemapEntries(limit: number, locale: string): Promise<SitemapContentEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: { status: { equals: "active" } },
    limit,
    depth: 0,
    select: SITEMAP_SELECT,
    locale: asLocale(locale)
  });

  return result.docs as SitemapContentEntry[];
}

async function fetchDestinationSitemapEntries(limit: number, locale: string): Promise<SitemapContentEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "destinations",
    limit,
    depth: 0,
    select: SITEMAP_SELECT,
    locale: asLocale(locale)
  });

  return result.docs as SitemapContentEntry[];
}

async function fetchPostSitemapEntries(limit: number, locale: string): Promise<SitemapContentEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit,
    depth: 0,
    select: SITEMAP_SELECT,
    locale: asLocale(locale)
  });

  return result.docs as SitemapContentEntry[];
}

export const getTourSitemapEntries = cache((limit: number, locale = "en") =>
  unstable_cache(() => fetchTourSitemapEntries(limit, locale), ["cms", "sitemap", "tours", String(limit), locale], {
    tags: ["tours"]
  })()
);

export const getDestinationSitemapEntries = cache((limit: number, locale = "en") =>
  unstable_cache(
    () => fetchDestinationSitemapEntries(limit, locale),
    ["cms", "sitemap", "destinations", String(limit), locale],
    { tags: ["destinations"] }
  )()
);

export const getPostSitemapEntries = cache((limit: number, locale = "en") =>
  unstable_cache(() => fetchPostSitemapEntries(limit, locale), ["cms", "sitemap", "posts", String(limit), locale], {
    tags: ["posts"]
  })()
);
