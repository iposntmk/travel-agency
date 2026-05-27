import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Destination, Post, Tour } from "@/payload-types";

const DEFAULT_LIMIT = 24;

async function fetchTourBySlug(slug: string): Promise<Tour | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "tours",
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
    limit: 1,
    depth: 1
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

const DESTINATION_LIST_SELECT = {
  title: true,
  slug: true,
  featuredImage: true,
  description: true,
  updatedAt: true
} as const;

async function fetchDestinations(limit: number): Promise<Destination[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "destinations",
    limit,
    depth: 1,
    sort: "title",
    select: DESTINATION_LIST_SELECT
  });
  return result.docs as Destination[];
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

const POST_LIST_SELECT = {
  title: true,
  slug: true,
  featuredImage: true,
  destination: true,
  readingTime: true,
  status: true,
  createdAt: true,
  updatedAt: true
} as const;

async function fetchPublishedPosts(limit: number): Promise<Post[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit,
    depth: 1,
    sort: "-createdAt",
    select: POST_LIST_SELECT
  });
  return result.docs as Post[];
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
    depth: 1
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
