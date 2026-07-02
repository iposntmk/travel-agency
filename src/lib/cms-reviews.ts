import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Review } from "@/payload-types";

/**
 * Approved reviews for any tour of a destination (depth 2 join through the
 * tour's destination relation). Powers the destination-hub review wall.
 */
async function fetchReviewsForDestination(destinationId: number | string, limit: number): Promise<Review[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "reviews",
    where: {
      and: [{ status: { equals: "approved" } }, { "tour.destination": { equals: destinationId } }]
    },
    limit,
    depth: 1,
    sort: "-createdAt",
    overrideAccess: true
  });
  return result.docs as Review[];
}

const getReviewsForDestinationCached = cache((destinationId: number | string, limit: number) =>
  unstable_cache(
    () => fetchReviewsForDestination(destinationId, limit),
    ["cms", "destination-reviews", String(destinationId), String(limit)],
    { tags: ["reviews"] }
  )()
);

export function getReviewsForDestination(destinationId: number | string, limit = 6): Promise<Review[]> {
  return getReviewsForDestinationCached(destinationId, limit);
}
