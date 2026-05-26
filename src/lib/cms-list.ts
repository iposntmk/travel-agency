import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Payload, Where } from "payload";
import { buildToursWhere, type ToursQuery } from "@/lib/cms-filters";
import { getPayloadClient } from "@/lib/payload";
import type { Tour } from "@/payload-types";

const DEFAULT_LIMIT = 24;
const TOUR_LIST_SELECT = {
  title: true,
  slug: true,
  featuredImage: true,
  destination: true,
  operationType: true,
  minPax: true,
  currentPax: true,
  tourType: true,
  season: true,
  isFeaturedInSeason: true,
  status: true,
  priceFrom: true,
  currency: true,
  updatedAt: true
} as const;

function stableToursQuery(input: ToursQuery = {}): ToursQuery {
  return {
    destinationSlug: input.destinationSlug,
    featuredOnly: input.featuredOnly,
    freeOnly: input.freeOnly,
    limit: input.limit,
    operationType: input.operationType,
    priceMax: input.priceMax,
    season: input.season,
    tourType: input.tourType
  };
}

async function destinationIdForSlug(payload: Payload, slug: string): Promise<number | undefined> {
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

  const result = await payload.find({
    collection: "tours",
    where,
    limit: input.limit ?? DEFAULT_LIMIT,
    depth: 1,
    sort: "-isFeaturedInSeason",
    select: TOUR_LIST_SELECT
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

async function fetchToursForDestinationList(destinationId: number, limit: number): Promise<Tour[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: { and: [{ destination: { equals: destinationId } }, { status: { equals: "active" } }] },
    limit,
    depth: 1,
    select: TOUR_LIST_SELECT
  });

  return result.docs as Tour[];
}

const getToursForDestinationListCached = cache((destinationId: number, limit: number) =>
  unstable_cache(
    () => fetchToursForDestinationList(destinationId, limit),
    ["cms", "tours-for-destination-list", String(destinationId), String(limit)],
    { tags: ["tours"] }
  )()
);

export function getToursForDestinationList(destinationId: number, limit = 6): Promise<Tour[]> {
  return getToursForDestinationListCached(destinationId, limit);
}
