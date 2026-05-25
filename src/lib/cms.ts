import type { Where } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { buildToursWhere, type ToursQuery } from "@/lib/cms-filters";
import type { Destination, Post, Tour } from "@/payload-types";

export { buildToursWhere };
export type { ToursQuery };

const DEFAULT_LIMIT = 24;

export async function getTours(input: ToursQuery = {}): Promise<Tour[]> {
  try {
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
  } catch (error) {
    console.error("[cms.getTours] failed", error);
    return [];
  }
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "tours",
      where: { and: [{ slug: { equals: slug } }, { status: { equals: "active" } }] },
      limit: 1,
      depth: 2
    });
    return result.docs[0] ?? null;
  } catch (error) {
    console.error("[cms.getTourBySlug] failed", error);
    return null;
  }
}

export async function getDestinations(limit = DEFAULT_LIMIT): Promise<Destination[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "destinations",
      limit,
      depth: 1,
      sort: "title"
    });
    return result.docs;
  } catch (error) {
    console.error("[cms.getDestinations] failed", error);
    return [];
  }
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "destinations",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1
    });
    return result.docs[0] ?? null;
  } catch (error) {
    console.error("[cms.getDestinationBySlug] failed", error);
    return null;
  }
}

export async function getToursForDestination(destinationId: number, limit = 6): Promise<Tour[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "tours",
      where: { and: [{ destination: { equals: destinationId } }, { status: { equals: "active" } }] },
      limit,
      depth: 1
    });
    return result.docs;
  } catch (error) {
    console.error("[cms.getToursForDestination] failed", error);
    return [];
  }
}

export async function getPublishedPosts(limit = DEFAULT_LIMIT): Promise<Post[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "posts",
      where: { status: { equals: "published" } },
      limit,
      depth: 1,
      sort: "-createdAt"
    });
    return result.docs;
  } catch (error) {
    console.error("[cms.getPublishedPosts] failed", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "posts",
      where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
      limit: 1,
      depth: 2
    });
    return result.docs[0] ?? null;
  } catch (error) {
    console.error("[cms.getPostBySlug] failed", error);
    return null;
  }
}
