import { describe, expect, it } from "vitest";
import { resolveImage, resolveOgImage } from "@/lib/media";
import type { Media } from "@/payload-types";

function makeMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: 1,
    alt: "Hoi An",
    status: "ready",
    publicUrl: "https://cdn.example.com/originals/2026/05/1/original.jpg",
    updatedAt: "2026-05-25T00:00:00.000Z",
    createdAt: "2026-05-25T00:00:00.000Z",
    ...overrides
  } as Media;
}

describe("resolveImage", () => {
  it("falls back when media is missing", () => {
    const resolved = resolveImage(undefined, "Tour");
    expect(resolved.isFallback).toBe(true);
    expect(resolved.alt).toBe("Tour");
  });

  it("falls back when media is a relationship id only", () => {
    expect(resolveImage(42).isFallback).toBe(true);
  });

  it("falls back when status is not ready", () => {
    const resolved = resolveImage(makeMedia({ status: "processing" }));
    expect(resolved.isFallback).toBe(true);
    expect(resolved.alt).toBe("Hoi An");
  });

  it("returns the publicUrl when media is ready", () => {
    const resolved = resolveImage(makeMedia());
    expect(resolved.isFallback).toBe(false);
    expect(resolved.url).toContain("cdn.example.com");
  });
});

describe("resolveOgImage", () => {
  it("prefixes site URL to the fallback path", () => {
    expect(resolveOgImage(undefined, "https://example.com")).toBe("https://example.com/og-fallback.svg");
  });

  it("trims trailing slash on the site URL", () => {
    expect(resolveOgImage(undefined, "https://example.com/")).toBe("https://example.com/og-fallback.svg");
  });

  it("uses the media publicUrl when ready", () => {
    expect(resolveOgImage(makeMedia(), "https://example.com")).toContain("cdn.example.com");
  });
});
