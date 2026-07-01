import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Payload, Where } from "payload";
import { getPayloadClient } from "@/lib/payload";
import type { Config, Cruise } from "@/payload-types";

const asLocale = (locale?: string): Config["locale"] | undefined => locale as Config["locale"] | undefined;

const DEFAULT_LIMIT = 12;

const CRUISE_LIST_SELECT = {
  title: true,
  slug: true,
  featuredImage: true,
  destination: true,
  nights: true,
  durationText: true,
  routeSummary: true,
  ratingAverage: true,
  ratingCount: true,
  priceFrom: true,
  currency: true,
  status: true,
  updatedAt: true
} as const;

interface CruisesQuery {
  featuredOnly?: boolean;
  destinationSlug?: string;
  nights?: number;
  limit?: number;
  locale?: string;
}

async function destinationIdForSlug(payload: Payload, slug: string): Promise<number | undefined> {
  // Slug resolved against the default locale (localized slug `where` has no fallback).
  const destinations = await payload.find({
    collection: "destinations",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    select: { slug: true }
  });

  return destinations.docs[0]?.id;
}

async function fetchCruisesForList(input: CruisesQuery): Promise<Cruise[]> {
  const payload = await getPayloadClient();
  const and: Where[] = [{ status: { equals: "active" } }];
  if (input.featuredOnly) and.push({ isFeatured: { equals: true } });
  if (input.nights) and.push({ nights: { equals: input.nights } });

  if (input.destinationSlug) {
    const destinationId = await destinationIdForSlug(payload, input.destinationSlug);
    if (!destinationId) return [];
    and.push({ destination: { equals: destinationId } });
  }

  const result = await payload.find({
    collection: "cruises",
    where: { and },
    limit: input.limit ?? DEFAULT_LIMIT,
    depth: 1,
    sort: "-isFeatured",
    select: CRUISE_LIST_SELECT,
    locale: asLocale(input.locale)
  });

  return result.docs as Cruise[];
}

const getCruisesForListCached = cache((cacheKey: string) =>
  unstable_cache(() => fetchCruisesForList(JSON.parse(cacheKey) as CruisesQuery), ["cms", "cruises-list", cacheKey], {
    tags: ["cruises"]
  })()
);

export function getCruisesForList(input: CruisesQuery = {}): Promise<Cruise[]> {
  return getCruisesForListCached(
    JSON.stringify({
      featuredOnly: input.featuredOnly,
      destinationSlug: input.destinationSlug,
      nights: input.nights,
      limit: input.limit,
      locale: input.locale
    })
  );
}

async function fetchCruiseBySlug(slug: string, locale?: string): Promise<Cruise | null> {
  const payload = await getPayloadClient();
  // Match slug in the default locale (Payload `where` has no locale fallback),
  // then load content in the target locale.
  const idResult = await payload.find({
    collection: "cruises",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
    limit: 1,
    depth: 0
  });
  const id = idResult.docs[0]?.id;
  if (!id) return null;
  return (await payload.findByID({ collection: "cruises", id, depth: 1, locale: asLocale(locale) })) as Cruise;
}

const getCruiseBySlugCached = cache((slug: string, locale: string) =>
  unstable_cache(() => fetchCruiseBySlug(slug, locale), ["cms", "cruise", slug, locale], {
    tags: ["cruises", `cruise-${slug}`, `${locale}-cruise-${slug}`]
  })()
);

export function getCruiseBySlug(slug: string, locale = "en"): Promise<Cruise | null> {
  return getCruiseBySlugCached(slug, locale);
}
