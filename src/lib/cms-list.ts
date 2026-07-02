import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Payload, Where } from "payload";
import { buildToursWhere, type ToursQuery } from "@/lib/cms-filters";
import { getPayloadClient } from "@/lib/payload";
import type { Config, Tour } from "@/payload-types";

const asLocale = (locale?: string): Config["locale"] | undefined => locale as Config["locale"] | undefined;

const DEFAULT_LIMIT = 24;
const TOUR_LIST_SELECT = {
  title: true,
  slug: true,
  featuredImage: true,
  destination: true,
  durationText: true,
  routeSummary: true,
  ratingAverage: true,
  ratingCount: true,
  operationType: true,
  minPax: true,
  currentPax: true,
  tourType: true,
  season: true,
  isFeaturedInSeason: true,
  isFeatured: true,
  isBestSeller: true,
  pickupAvailable: true,
  privateOption: true,
  groupSizeMax: true,
  deal: true,
  status: true,
  priceFrom: true,
  currency: true,
  createdAt: true,
  updatedAt: true
} as const;

function stableToursQuery(input: ToursQuery = {}): ToursQuery {
  return {
    q: input.q,
    attractionSlug: input.attractionSlug,
    categorySlug: input.categorySlug,
    destinationSlug: input.destinationSlug,
    durationDays: input.durationDays,
    durationMin: input.durationMin,
    featuredOnly: input.featuredOnly,
    freeOnly: input.freeOnly,
    groupSize: input.groupSize,
    limit: input.limit,
    operationType: input.operationType,
    priceMax: input.priceMax,
    ratingMin: input.ratingMin,
    season: input.season,
    sort: input.sort,
    tourType: input.tourType,
    locale: asLocale(input.locale)
  };
}

async function destinationIdForSlug(payload: Payload, slug: string): Promise<number | undefined> {
  // Resolve slug against the default locale — slug is localized but its `where`
  // match doesn't fall back, and only the default locale is guaranteed filled.
  const destinations = await payload.find({
    collection: "destinations",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    select: { slug: true }
  });

  return destinations.docs[0]?.id;
}

async function fetchToursForList(input: ToursQuery): Promise<Tour[]> {
  const payload = await getPayloadClient();
  const baseWhere = buildToursWhere(input);
  let where: Where = baseWhere as Where;

  if (input.destinationSlug) {
    const destinationId = await destinationIdForSlug(payload, input.destinationSlug);
    if (!destinationId) return [];
    where = {
      and: [...baseWhere.and, { destination: { equals: destinationId } }]
    } as Where;
  }
  if (input.categorySlug) {
    const categoryId = await entityIdForSlug(payload, "product-categories", input.categorySlug);
    if (!categoryId) return [];
    where = { and: [...(where.and as Record<string, unknown>[]), { categories: { contains: categoryId } }] } as Where;
  }
  if (input.attractionSlug) {
    const attractionId = await entityIdForSlug(payload, "attractions", input.attractionSlug);
    if (!attractionId) return [];
    where = { and: [...(where.and as Record<string, unknown>[]), { attractions: { contains: attractionId } }] } as Where;
  }

  const result = await payload.find({
    collection: "tours",
    where,
    limit: input.limit ?? DEFAULT_LIMIT,
    depth: 1,
    sort: sortForTours(input.sort),
    select: TOUR_LIST_SELECT,
    locale: asLocale(input.locale)
  });

  return result.docs as Tour[];
}

const getToursForListCached = cache((cacheKey: string) =>
  unstable_cache(
    () => fetchToursForList(JSON.parse(cacheKey) as ToursQuery),
    ["cms", "tours-list", cacheKey],
    { tags: ["tours"] }
  )()
);

export function getToursForList(input: ToursQuery = {}): Promise<Tour[]> {
  return getToursForListCached(JSON.stringify(stableToursQuery(input)));
}

async function fetchToursForDestinationList(destinationId: number, limit: number, locale?: string): Promise<Tour[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: { and: [{ destination: { equals: destinationId } }, { status: { equals: "active" } }] },
    limit,
    depth: 1,
    select: TOUR_LIST_SELECT,
    locale: asLocale(locale)
  });

  return result.docs as Tour[];
}

const getToursForDestinationListCached = cache((destinationId: number, limit: number, locale: string) =>
  unstable_cache(
    () => fetchToursForDestinationList(destinationId, limit, locale),
    ["cms", "tours-for-destination-list", String(destinationId), String(limit), locale],
    { tags: ["tours"] }
  )()
);

export function getToursForDestinationList(destinationId: number, limit = 6, locale = "en"): Promise<Tour[]> {
  return getToursForDestinationListCached(destinationId, limit, locale);
}

async function entityIdForSlug(payload: Payload, collection: string, slug: string): Promise<number | undefined> {
  // Slug resolved against the default locale (localized slug `where` has no fallback).
  const result = await (payload as unknown as { find(args: Record<string, unknown>): Promise<{ docs: { id?: number }[] }> }).find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    select: { slug: true }
  });

  return result.docs[0]?.id;
}

function sortForTours(sort?: string): string {
  if (sort === "price") return "priceFrom";
  if (sort === "rating") return "-ratingAverage";
  if (sort === "duration") return "durationDays";
  return "-isFeatured";
}
