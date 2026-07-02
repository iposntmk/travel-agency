import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Attraction, Config, Tour } from "@/payload-types";

const asLocale = (locale?: string): Config["locale"] | undefined => locale as Config["locale"] | undefined;

const DEFAULT_LOCALE = "en";

/**
 * Attraction detail for the nested route
 * /destinations/[slug]/attractions/[attractionSlug]. Slug matching runs in the
 * default locale (localized slug `where` has no fallback), content loads in the
 * requested locale — same two-step pattern as getTourBySlug.
 */
async function fetchAttractionBySlug(
  destinationSlug: string,
  attractionSlug: string,
  locale?: string
): Promise<Attraction | null> {
  const payload = await getPayloadClient();

  const destination = await payload.find({
    collection: "destinations",
    where: { slug: { equals: destinationSlug } },
    limit: 1,
    depth: 0,
    select: { slug: true }
  });
  const destinationId = destination.docs[0]?.id;
  if (!destinationId) return null;

  const idResult = await payload.find({
    collection: "attractions",
    where: {
      and: [{ slug: { equals: attractionSlug } }, { destination: { equals: destinationId } }]
    },
    limit: 1,
    depth: 0
  });
  const id = idResult.docs[0]?.id;
  if (!id) return null;

  return (await payload.findByID({
    collection: "attractions",
    id,
    depth: 1,
    locale: asLocale(locale)
  })) as Attraction;
}

const getAttractionBySlugCached = cache((destinationSlug: string, attractionSlug: string, locale: string) =>
  unstable_cache(
    () => fetchAttractionBySlug(destinationSlug, attractionSlug, locale),
    ["cms", "attraction", destinationSlug, attractionSlug, locale],
    { tags: ["attractions", `attraction-${attractionSlug}`, "destinations"] }
  )()
);

export function getAttractionBySlug(
  destinationSlug: string,
  attractionSlug: string,
  locale?: string
): Promise<Attraction | null> {
  return getAttractionBySlugCached(destinationSlug, attractionSlug, locale ?? DEFAULT_LOCALE);
}

/** Active tours that visit an attraction (Tours.attractions relationship). */
async function fetchToursForAttraction(attractionId: number | string, limit: number, locale?: string): Promise<Tour[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: {
      and: [{ attractions: { contains: attractionId } }, { status: { equals: "active" } }]
    },
    limit,
    depth: 1,
    sort: "-isFeatured",
    locale: asLocale(locale)
  });
  return result.docs as Tour[];
}

const getToursForAttractionCached = cache((attractionId: number | string, limit: number, locale: string) =>
  unstable_cache(
    () => fetchToursForAttraction(attractionId, limit, locale),
    ["cms", "attraction-tours", String(attractionId), String(limit), locale],
    { tags: ["tours", "attractions"] }
  )()
);

export function getToursForAttraction(attractionId: number | string, limit = 6, locale?: string): Promise<Tour[]> {
  return getToursForAttractionCached(attractionId, limit, locale ?? DEFAULT_LOCALE);
}

export type AttractionSitemapEntry = { slug: string; destinationSlug: string; updatedAt?: string };

/** All attractions of a destination for generateStaticParams / sitemap (default locale slugs). */
async function fetchAttractionSitemapEntries(limit: number): Promise<AttractionSitemapEntry[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "attractions",
    limit,
    depth: 1,
    sort: "-sortWeight",
    select: { slug: true, destination: true, updatedAt: true }
  });

  return result.docs
    .map((doc): AttractionSitemapEntry | null => {
      const attraction = doc as Attraction;
      const destination =
        attraction.destination && typeof attraction.destination === "object" ? attraction.destination : null;
      if (!destination?.slug || !attraction.slug) return null;
      return { slug: attraction.slug, destinationSlug: destination.slug, updatedAt: attraction.updatedAt };
    })
    .filter((entry): entry is AttractionSitemapEntry => entry !== null);
}

const getAttractionSitemapEntriesCached = cache((limit: number) =>
  unstable_cache(() => fetchAttractionSitemapEntries(limit), ["cms", "attraction-sitemap", String(limit)], {
    tags: ["attractions"]
  })()
);

export function getAttractionSitemapEntries(limit = 200): Promise<AttractionSitemapEntry[]> {
  return getAttractionSitemapEntriesCached(limit);
}
