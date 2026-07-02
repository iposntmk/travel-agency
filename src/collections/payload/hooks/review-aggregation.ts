import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

type ReviewDoc = {
  id: number | string;
  tour?: number | { id: number | string } | null;
  status?: string | null;
  rating?: number | null;
};

function tourIdOf(doc: ReviewDoc | null | undefined): number | string | undefined {
  if (!doc?.tour) return undefined;
  return typeof doc.tour === "object" ? doc.tour.id : doc.tour;
}

/**
 * Recomputes ratingAverage/ratingCount on the related tour from its APPROVED
 * reviews. The tour update fires the existing tour revalidate hook, so public
 * pages refresh automatically. Errors are logged, never thrown — a failed
 * aggregate must not block the review save itself.
 */
async function recomputeTourRating(req: Parameters<CollectionAfterChangeHook>[0]["req"], tourId: number | string): Promise<void> {
  try {
    const approved = await req.payload.find({
      collection: "reviews",
      where: { and: [{ tour: { equals: tourId } }, { status: { equals: "approved" } }] },
      limit: 500,
      depth: 0,
      select: { rating: true },
      overrideAccess: true
    });

    const ratings = approved.docs
      .map((doc) => (doc as { rating?: number }).rating)
      .filter((rating): rating is number => typeof rating === "number");
    const count = ratings.length;
    const average = count > 0 ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / count) * 10) / 10 : 0;

    await req.payload.update({
      collection: "tours",
      id: tourId,
      data: { ratingAverage: average, ratingCount: count },
      overrideAccess: true
    });
  } catch (error: unknown) {
    req.payload.logger.error({ err: error, tourId }, "review-aggregation: failed to recompute tour rating");
  }
}

export const aggregateTourRatingAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const review = doc as ReviewDoc;
  const previous = previousDoc as ReviewDoc | undefined;
  const statusChanged = review.status !== previous?.status;
  const ratingChanged = review.rating !== previous?.rating;
  const involvesApproved = review.status === "approved" || previous?.status === "approved";

  if ((statusChanged || ratingChanged) && involvesApproved) {
    const tourIds = new Set(
      [tourIdOf(review), tourIdOf(previous)].filter((id): id is number | string => id !== undefined)
    );
    for (const tourId of tourIds) {
      await recomputeTourRating(req, tourId);
    }
  }
  return doc;
};

export const aggregateTourRatingAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const tourId = tourIdOf(doc as ReviewDoc);
  if (tourId !== undefined && (doc as ReviewDoc).status === "approved") {
    await recomputeTourRating(req, tourId);
  }
  return doc;
};
