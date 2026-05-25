export interface ToursQuery {
  destinationSlug?: string;
  tourType?: string;
  season?: string;
  operationType?: string;
  priceMax?: number;
  freeOnly?: boolean;
  featuredOnly?: boolean;
  limit?: number;
}

export function buildToursWhere(input: ToursQuery): { and: Record<string, unknown>[] } {
  const and: Record<string, unknown>[] = [{ status: { equals: "active" } }];

  if (input.tourType) and.push({ tourType: { equals: input.tourType } });
  if (input.season) and.push({ season: { equals: input.season } });
  if (input.operationType) and.push({ operationType: { equals: input.operationType } });
  if (input.freeOnly) {
    and.push({ tourType: { in: ["free-walking", "free-cycling"] } });
  }
  if (typeof input.priceMax === "number" && Number.isFinite(input.priceMax)) {
    and.push({ priceFrom: { less_than_equal: input.priceMax } });
  }
  if (input.featuredOnly) {
    and.push({ isFeaturedInSeason: { equals: true } });
  }
  return { and };
}
