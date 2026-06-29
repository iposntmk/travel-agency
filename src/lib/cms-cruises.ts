import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Payload, Where } from "payload";
import { getPayloadClient } from "@/lib/payload";
import type { Cruise } from "@/payload-types";

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
    select: CRUISE_LIST_SELECT
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
      limit: input.limit
    })
  );
}

async function fetchCruiseBySlug(slug: string): Promise<Cruise | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "cruises",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
    limit: 1,
    depth: 1
  });
  return result.docs[0] ?? null;
}

const getCruiseBySlugCached = cache((slug: string) =>
  unstable_cache(() => fetchCruiseBySlug(slug), ["cms", "cruise", slug], {
    tags: ["cruises", `cruise-${slug}`]
  })()
);

export function getCruiseBySlug(slug: string): Promise<Cruise | null> {
  return getCruiseBySlugCached(slug);
}
