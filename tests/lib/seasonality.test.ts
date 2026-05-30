import { describe, expect, it } from "vitest";
import { getSeasonalCampaign } from "@/lib/seasonality";

const at = (month: number) => new Date(Date.UTC(2026, month - 1, 15));

describe("getSeasonalCampaign", () => {
  it("returns the Vietnam summer campaign for May–August", () => {
    for (const m of [5, 6, 7, 8]) {
      expect(getSeasonalCampaign(at(m)).key).toBe("vietnam-summer");
    }
  });

  it("returns the Italy long-holiday campaign in September", () => {
    expect(getSeasonalCampaign(at(9)).key).toBe("italy-long-holiday");
  });

  it("returns the Europe winter campaign for October–April", () => {
    for (const m of [10, 11, 12, 1, 2, 3, 4]) {
      expect(getSeasonalCampaign(at(m)).key).toBe("europe-winter");
    }
  });

  it("links each campaign to a valid tours filter", () => {
    const hrefs = [at(1), at(6), at(9)].map((d) => getSeasonalCampaign(d).ctaHref);
    expect(hrefs).toEqual(["/tours?season=winter", "/tours?season=summer", "/tours?type=paid-private"]);
  });
});
