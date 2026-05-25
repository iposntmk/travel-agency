import { describe, expect, it } from "vitest";
import { buildToursWhere } from "@/lib/cms-filters";

describe("buildToursWhere", () => {
  it("defaults to active tours when no filters are supplied", () => {
    expect(buildToursWhere({})).toEqual({ and: [{ status: { equals: "active" } }] });
  });

  it("applies tourType, season, and operationType filters", () => {
    const where = buildToursWhere({
      tourType: "paid-private",
      season: "winter",
      operationType: "self-operated"
    });
    expect(where).toEqual({
      and: [
        { status: { equals: "active" } },
        { tourType: { equals: "paid-private" } },
        { season: { equals: "winter" } },
        { operationType: { equals: "self-operated" } }
      ]
    });
  });

  it("translates freeOnly into a tourType in-filter", () => {
    const where = buildToursWhere({ freeOnly: true }) as { and: Array<Record<string, unknown>> };
    expect(where.and).toContainEqual({ tourType: { in: ["free-walking", "free-cycling"] } });
  });

  it("includes a price upper bound when priceMax is a finite positive number", () => {
    const where = buildToursWhere({ priceMax: 80 }) as { and: Array<Record<string, unknown>> };
    expect(where.and).toContainEqual({ priceFrom: { less_than_equal: 80 } });
  });

  it("ignores priceMax when not a finite number", () => {
    const where = buildToursWhere({ priceMax: Number.NaN }) as { and: Array<Record<string, unknown>> };
    expect(where.and.every((clause) => !("priceFrom" in clause))).toBe(true);
  });

  it("filters featured tours when featuredOnly is true", () => {
    const where = buildToursWhere({ featuredOnly: true }) as { and: Array<Record<string, unknown>> };
    expect(where.and).toContainEqual({ isFeaturedInSeason: { equals: true } });
  });
});
