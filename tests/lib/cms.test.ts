import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTourBySlug } from "@/lib/cms";
import { getToursForList } from "@/lib/cms-list";
import { buildToursWhere } from "@/lib/cms-filters";
import { getPayloadClient } from "@/lib/payload";
import { getTourSitemapEntries } from "@/lib/cms-sitemap";

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
    expect(where.and).toContainEqual({
      or: [{ isFeatured: { equals: true } }, { isFeaturedInSeason: { equals: true } }]
    });
  });
});

describe("CMS getters", () => {
  beforeEach(() => {
    mockedGetPayloadClient.mockReset();
  });

  it("does not swallow database failures", async () => {
    const error = new Error("database unavailable");
    mockedGetPayloadClient.mockRejectedValue(error);

    await expect(getToursForList({ limit: 7 })).rejects.toThrow("database unavailable");
  });

  it("returns null when a slug lookup has no matching document", async () => {
    mockedGetPayloadClient.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] })
    } as unknown as Awaited<ReturnType<typeof getPayloadClient>>);

    await expect(getTourBySlug("missing-tour")).resolves.toBeNull();
  });

  it("uses a narrow select for tour list cards", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    mockedGetPayloadClient.mockResolvedValue({ find } as unknown as Awaited<ReturnType<typeof getPayloadClient>>);

    await getToursForList({ limit: 3 });

    const call = find.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      collection: "tours",
      depth: 1,
      limit: 3,
      select: expect.objectContaining({ title: true, slug: true, featuredImage: true })
    });
    expect(Object.keys(call.select)).not.toContain("description");
    expect(Object.keys(call.select)).not.toContain("itinerary");
  });

  it("uses slug and updatedAt only for tour sitemap entries", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    mockedGetPayloadClient.mockResolvedValue({ find } as unknown as Awaited<ReturnType<typeof getPayloadClient>>);

    await getTourSitemapEntries(10);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "tours",
        depth: 0,
        limit: 10,
        select: { slug: true, updatedAt: true }
      })
    );
  });
});
