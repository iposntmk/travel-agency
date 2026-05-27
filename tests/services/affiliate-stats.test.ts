import { describe, expect, it } from "vitest";
import {
  aggregateAffiliateClicks,
  decodeAffiliateTargetId,
  parseAffiliateRange
} from "@/services/affiliate-stats";

const NOW = new Date("2026-05-27T12:00:00.000Z");

const sampleRows = [
  // 5 OTA clicks for GetYourGuide Hoi An across two days, within range
  row({ id: 1, type: "ota", targetId: "getyourguide:hoi-an", source: "/", at: "2026-05-26T10:00:00.000Z" }),
  row({ id: 2, type: "ota", targetId: "getyourguide:hoi-an", source: "/", at: "2026-05-26T11:00:00.000Z" }),
  row({ id: 3, type: "ota", targetId: "getyourguide:hoi-an", source: "/", at: "2026-05-27T09:00:00.000Z" }),
  row({ id: 4, type: "ota", targetId: "getyourguide:hoi-an", source: "/destinations/hoi-an", at: "2026-05-27T10:00:00.000Z" }),
  row({ id: 5, type: "ota", targetId: "getyourguide:hoi-an", source: "/destinations/hoi-an", at: "2026-05-27T10:30:00.000Z" }),
  // 2 OTA clicks for Viator Hue
  row({ id: 6, type: "ota", targetId: "viator:hue", source: "/destinations/hue", at: "2026-05-25T08:00:00.000Z" }),
  row({ id: 7, type: "ota", targetId: "viator:hue", source: "/tours/hue-bicycle", at: "2026-05-24T08:00:00.000Z" }),
  // 1 add-on click
  row({ id: 8, type: "addon", targetId: "partner-42", source: "/tours/spa-day", at: "2026-05-23T08:00:00.000Z" }),
  // Outside range (older than 7d when range=7)
  row({ id: 9, type: "ota", targetId: "getyourguide:da-nang", source: "/", at: "2026-05-10T08:00:00.000Z" }),
  // Malformed OTA targetId
  row({ id: 10, type: "ota", targetId: "unknown_format", source: "/", at: "2026-05-27T01:00:00.000Z" })
];

describe("decodeAffiliateTargetId", () => {
  it("decodes ota provider + city slug", () => {
    expect(decodeAffiliateTargetId("ota", "getyourguide:hoi-an")).toEqual({
      provider: "getyourguide",
      citySlug: "hoi-an",
      label: "GetYourGuide — Hoi An"
    });
  });

  it("falls back to raw targetId for unknown provider", () => {
    expect(decodeAffiliateTargetId("ota", "weirdprovider:somewhere")).toEqual({
      citySlug: "somewhere",
      label: "weirdprovider:somewhere"
    });
  });

  it("falls back to raw targetId for malformed payload", () => {
    expect(decodeAffiliateTargetId("ota", "no-separator")).toEqual({
      label: "no-separator"
    });
  });

  it("returns addon targetId unchanged", () => {
    expect(decodeAffiliateTargetId("addon", "partner-42")).toEqual({ label: "partner-42" });
  });
});

describe("parseAffiliateRange", () => {
  it("defaults to 30 days for unknown input", () => {
    expect(parseAffiliateRange(undefined)).toBe(30);
    expect(parseAffiliateRange(null)).toBe(30);
    expect(parseAffiliateRange("foo")).toBe(30);
    expect(parseAffiliateRange("365")).toBe(30);
  });

  it("accepts 7, 30, 90 (with or without 'd' suffix)", () => {
    expect(parseAffiliateRange("7")).toBe(7);
    expect(parseAffiliateRange("7d")).toBe(7);
    expect(parseAffiliateRange("30")).toBe(30);
    expect(parseAffiliateRange("90d")).toBe(90);
  });
});

describe("aggregateAffiliateClicks", () => {
  it("counts only rows inside the range window", () => {
    const stats = aggregateAffiliateClicks({ rows: sampleRows, rangeDays: 7, now: NOW });
    // 9 rows are within 7d of NOW (row id=9 is 17 days old)
    expect(stats.totalClicks).toBe(9);
    expect(stats.rangeDays).toBe(7);
  });

  it("buckets clicks by targetType", () => {
    const stats = aggregateAffiliateClicks({ rows: sampleRows, rangeDays: 30, now: NOW });
    const map = Object.fromEntries(stats.byTargetType.map((entry) => [entry.targetType, entry.clicks]));
    expect(map.ota).toBe(9); // 5 ghi + 2 viator + 1 da-nang + 1 unknown-format
    expect(map.addon).toBe(1);
  });

  it("orders top targets by click count descending", () => {
    const stats = aggregateAffiliateClicks({ rows: sampleRows, rangeDays: 30, now: NOW });
    expect(stats.topTargets[0]).toMatchObject({
      targetType: "ota",
      targetId: "getyourguide:hoi-an",
      clicks: 5,
      label: "GetYourGuide — Hoi An"
    });
    expect(stats.topTargets[1]).toMatchObject({ targetId: "viator:hue", clicks: 2 });
  });

  it("orders top sources by click count and labels each path", () => {
    const stats = aggregateAffiliateClicks({ rows: sampleRows, rangeDays: 30, now: NOW });
    const top = stats.topSources[0];
    expect(top.clicks).toBeGreaterThanOrEqual(stats.topSources[stats.topSources.length - 1]?.clicks ?? 0);
    const sources = stats.topSources.map((s) => s.source);
    expect(sources).toContain("/");
    expect(sources).toContain("/destinations/hoi-an");
    expect(sources).toContain("/destinations/hue");
  });

  it("buckets clicks into UTC day slots and fills empty days with zero", () => {
    const stats = aggregateAffiliateClicks({ rows: sampleRows, rangeDays: 7, now: NOW });
    // 8 days inclusive: 2026-05-20 .. 2026-05-27
    expect(stats.byDay.length).toBe(8);
    const indexed = Object.fromEntries(stats.byDay.map((d) => [d.day, d.clicks]));
    expect(indexed["2026-05-27"]).toBe(4); // ids 3,4,5,10
    expect(indexed["2026-05-26"]).toBe(2); // ids 1,2
    expect(indexed["2026-05-21"]).toBe(0); // empty day kept
  });

  it("aggregates ota providers separately from addons", () => {
    const stats = aggregateAffiliateClicks({ rows: sampleRows, rangeDays: 30, now: NOW });
    const map = Object.fromEntries(stats.byOtaProvider.map((entry) => [entry.provider, entry.clicks]));
    expect(map.getyourguide).toBe(6); // 5 hoi-an + 1 da-nang (within 30d)
    expect(map.viator).toBe(2);
    expect(map.unknown).toBe(1); // malformed row decoded as unknown provider
  });

  it("returns most-recent rows in `recent`", () => {
    const stats = aggregateAffiliateClicks({ rows: sampleRows, rangeDays: 30, now: NOW });
    expect(stats.recent[0]?.id).toBe("5"); // 2026-05-27 10:30
    expect(stats.recent[1]?.id).toBe("4");
    expect(stats.recent.length).toBeLessThanOrEqual(20);
  });
});

interface RowInput {
  id: number;
  type: "ota" | "addon";
  targetId: string;
  source: string;
  at: string;
}

function row(input: RowInput) {
  return {
    id: input.id,
    targetType: input.type,
    targetId: input.targetId,
    source: input.source,
    createdAt: input.at
  };
}
