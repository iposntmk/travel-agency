import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTourBySlug, getTours } from "@/lib/cms";
import { buildToursWhere } from "@/lib/cms-filters";
import { getPayloadClient } from "@/lib/payload";

vi.mock("next/cache", () => ({
  unstable_cache:
    <T extends () => unknown>(fn: T) =>
    () =>
      fn(),
  revalidateTag: vi.fn()
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T) => fn
  };
});

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn()
}));

const mockedGetPayloadClient = vi.mocked(getPayloadClient);

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

describe("CMS getters", () => {
  beforeEach(() => {
    mockedGetPayloadClient.mockReset();
  });

  it("does not swallow database failures", async () => {
    const error = new Error("database unavailable");
    mockedGetPayloadClient.mockRejectedValue(error);

    await expect(getTours({ limit: 7 })).rejects.toThrow("database unavailable");
  });

  it("returns null when a slug lookup has no matching document", async () => {
    mockedGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] })
    } as unknown as Awaited<ReturnType<typeof getPayloadClient>>);

    await expect(getTourBySlug("missing-tour")).resolves.toBeNull();
  });
});
