import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";

export interface SitemapContentEntry {
  slug: string;
  updatedAt: string;
}

const SITEMAP_SELECT = {
  slug: true,
  updatedAt: true
} as const;

async function fetchTourSitemapEntries(limit: number): Promise<SitemapContentEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: { status: { equals: "active" } },
    limit,
    depth: 0,
    select: SITEMAP_SELECT
  });

  return result.docs as SitemapContentEntry[];
}

async function fetchDestinationSitemapEntries(limit: number): Promise<SitemapContentEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "destinations",
    limit,
    depth: 0,
    select: SITEMAP_SELECT
  });

  return result.docs as SitemapContentEntry[];
}

async function fetchPostSitemapEntries(limit: number): Promise<SitemapContentEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit,
    depth: 0,
    select: SITEMAP_SELECT
  });

  return result.docs as SitemapContentEntry[];
}

export const getTourSitemapEntries = cache((limit: number) =>
  unstable_cache(() => fetchTourSitemapEntries(limit), ["cms", "sitemap", "tours", String(limit)], {
    tags: ["tours"]
  })()
);

export const getDestinationSitemapEntries = cache((limit: number) =>
  unstable_cache(() => fetchDestinationSitemapEntries(limit), ["cms", "sitemap", "destinations", String(limit)], {
    tags: ["destinations"]
  })()
);

export const getPostSitemapEntries = cache((limit: number) =>
  unstable_cache(() => fetchPostSitemapEntries(limit), ["cms", "sitemap", "posts", String(limit)], {
    tags: ["posts"]
  })()
);
