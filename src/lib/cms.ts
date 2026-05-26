import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Where } from "payload";
import { buildToursWhere, type ToursQuery } from "@/lib/cms-filters";
import { getPayloadClient } from "@/lib/payload";
import type { Destination, Post, Tour } from "@/payload-types";

export { buildToursWhere };
export type { ToursQuery };

const DEFAULT_LIMIT = 24;

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

async function fetchTours(input: ToursQuery): Promise<Tour[]> {
  const payload = await getPayloadClient();
  const baseWhere = buildToursWhere(input);
  let where: Where = baseWhere as Where;

  if (input.destinationSlug) {
    const destinations = await payload.find({
      collection: "destinations",
      where: { slug: { equals: input.destinationSlug } },
      limit: 1,
      depth: 0
    });
    const destination = destinations.docs[0];
    if (!destination) return [];
    where = {
      and: [...baseWhere.and, { destination: { equals: destination.id } }]
    } as Where;
  }

  const result = await payload.find({
    collection: "tours",
    where,
    limit: input.limit ?? DEFAULT_LIMIT,
    depth: 1,
    sort: "-isFeaturedInSeason"
  });
  return result.docs;
}

const getToursCached = cache((cacheKey: string) =>
  unstable_cache(
    () => fetchTours(JSON.parse(cacheKey) as ToursQuery),
    ["cms", "tours", cacheKey],
    { tags: ["tours"] }
  )()
);

export function getTours(input: ToursQuery = {}): Promise<Tour[]> {
  return getToursCached(JSON.stringify(stableToursQuery(input)));
}

async function fetchTourBySlug(slug: string): Promise<Tour | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
    limit: 1,
    depth: 2
  });
  return result.docs[0] ?? null;
}

const getTourBySlugCached = cache((slug: string) =>
  unstable_cache(() => fetchTourBySlug(slug), ["cms", "tour", slug], {
    tags: ["tours", `tour-${slug}`]
  })()
);

export function getTourBySlug(slug: string): Promise<Tour | null> {
  return getTourBySlugCached(slug);
}

async function fetchDestinations(limit: number): Promise<Destination[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "destinations",
    limit,
    depth: 1,
    sort: "title"
  });
  return result.docs;
}

const getDestinationsCached = cache((limit: number) =>
  unstable_cache(() => fetchDestinations(limit), ["cms", "destinations", String(limit)], {
    tags: ["destinations"]
  })()
);

export function getDestinations(limit = DEFAULT_LIMIT): Promise<Destination[]> {
  return getDestinationsCached(limit);
}

async function fetchDestinationBySlug(slug: string): Promise<Destination | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "destinations",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1
  });
  return result.docs[0] ?? null;
}

const getDestinationBySlugCached = cache((slug: string) =>
  unstable_cache(() => fetchDestinationBySlug(slug), ["cms", "destination", slug], {
    tags: ["destinations", `destination-${slug}`]
  })()
);

export function getDestinationBySlug(slug: string): Promise<Destination | null> {
  return getDestinationBySlugCached(slug);
}

async function fetchToursForDestination(destinationId: number, limit: number): Promise<Tour[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: { and: [{ destination: { equals: destinationId } }, { status: { equals: "active" } }] },
    limit,
    depth: 1
  });
  return result.docs;
}

const getToursForDestinationCached = cache((destinationId: number, limit: number) =>
  unstable_cache(
    () => fetchToursForDestination(destinationId, limit),
    ["cms", "tours-for-destination", String(destinationId), String(limit)],
    { tags: ["tours"] }
  )()
);

export function getToursForDestination(destinationId: number, limit = 6): Promise<Tour[]> {
  return getToursForDestinationCached(destinationId, limit);
}

async function fetchPublishedPosts(limit: number): Promise<Post[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit,
    depth: 1,
    sort: "-createdAt"
  });
  return result.docs;
}

const getPublishedPostsCached = cache((limit: number) =>
  unstable_cache(() => fetchPublishedPosts(limit), ["cms", "posts", String(limit)], {
    tags: ["posts"]
  })()
);

export function getPublishedPosts(limit = DEFAULT_LIMIT): Promise<Post[]> {
  return getPublishedPostsCached(limit);
}

async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
    limit: 1,
    depth: 2
  });
  return result.docs[0] ?? null;
}

const getPostBySlugCached = cache((slug: string) =>
  unstable_cache(() => fetchPostBySlug(slug), ["cms", "post", slug], {
    tags: ["posts", `post-${slug}`]
  })()
);

export function getPostBySlug(slug: string): Promise<Post | null> {
  return getPostBySlugCached(slug);
}
