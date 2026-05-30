export interface ToursQuery {
  destinationSlug?: string;
  categorySlug?: string;
  attractionSlug?: string;
  tourType?: string;
  season?: string;
  operationType?: string;
  priceMax?: number;
  durationDays?: number;
  groupSize?: number;
  ratingMin?: number;
  sort?: string;
  freeOnly?: boolean;
  featuredOnly?: boolean;
  limit?: number;
}

export function buildToursWhere(input: ToursQuery): { and: Record<string, unknown>[] } {
  const and: Record<string, unknown>[] = [{ status: { equals: "active" } }];

  if (input.tourType) and.push({ tourType: { equals: input.tourType } });
  if (input.season) and.push({ season: { equals: input.season } });
  if (input.operationType) and.push({ operationType: { equals: input.operationType } });
  if (input.durationDays) and.push({ durationDays: { less_than_equal: input.durationDays } });
  if (input.groupSize) and.push({ groupSizeMax: { greater_than_equal: input.groupSize } });
  if (input.ratingMin) and.push({ ratingAverage: { greater_than_equal: input.ratingMin } });
  if (input.freeOnly) {
    and.push({ tourType: { in: ["free-walking", "free-cycling"] } });
  }
  if (typeof input.priceMax === "number" && Number.isFinite(input.priceMax)) {
    and.push({ priceFrom: { less_than_equal: input.priceMax } });
  }
  if (input.featuredOnly) {
    and.push({ or: [{ isFeatured: { equals: true } }, { isFeaturedInSeason: { equals: true } }] });
  }
  return { and };
}
