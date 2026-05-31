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

  it("prefers the requested AVIF variant before WebP and original URLs", () => {
    const resolved = resolveImage(
      makeMedia({
        variants: {
          card: {
            avif: "https://cdn.example.com/variants/1/card.avif",
            webp: "https://cdn.example.com/variants/1/card.webp"
          }
        }
      }),
      "Tour",
      { variant: "card" }
    );

    expect(resolved.isFallback).toBe(false);
    expect(resolved.url).toBe("https://cdn.example.com/variants/1/card.avif");
  });

  it("falls back to WebP when the requested AVIF variant is unavailable", () => {
    const resolved = resolveImage(
      makeMedia({
        variants: {
          thumb: {
            webp: "https://cdn.example.com/variants/1/thumb.webp"
          }
        }
      }),
      "Tour",
      { variant: "thumb" }
    );

    expect(resolved.url).toBe("https://cdn.example.com/variants/1/thumb.webp");
  });

  it("derives an R2 public URL from filename when publicUrl is missing", () => {
    const resolved = resolveImage(
      makeMedia({ filename: "Dai-Noi-Hue-khi-hoang-hon-buong-xuong-1.jpg", publicUrl: null }),
      undefined,
      { publicBaseUrl: "https://pub.example.r2.dev" }
    );

    expect(resolved.isFallback).toBe(false);
    expect(resolved.url).toBe("https://pub.example.r2.dev/Dai-Noi-Hue-khi-hoang-hon-buong-xuong-1.jpg");
  });

  it("does not use Cloudflare dashboard URLs as image sources", () => {
    const resolved = resolveImage(
      makeMedia({
        filename: "hue.jpg",
        publicUrl: "https://dash.cloudflare.com/account/r2/default/buckets/travel-agency/objects/hue.jpg/details"
      }),
      undefined,
      { publicBaseUrl: "https://pub.example.r2.dev" }
    );

    expect(resolved.url).toBe("https://pub.example.r2.dev/hue.jpg");
  });

  it("returns focal point object positioning for cropped renders", () => {
    const resolved = resolveImage(makeMedia({ focalX: 24.4, focalY: 78.6 }));

    expect(resolved.objectPosition).toBe("24% 79%");
  });

  it("clamps invalid focal points to the image bounds", () => {
    const resolved = resolveImage(makeMedia({ focalX: -10, focalY: 140 }));

    expect(resolved.objectPosition).toBe("0% 100%");
  });
});

describe("resolveOgImage", () => {
  it("prefixes site URL to the raster OG fallback (not the on-page SVG)", () => {
    expect(resolveOgImage(undefined, "https://example.com")).toBe("https://example.com/og-default");
  });

  it("trims trailing slash on the site URL", () => {
    expect(resolveOgImage(undefined, "https://example.com/")).toBe("https://example.com/og-default");
  });

  it("uses the media publicUrl when ready", () => {
    expect(resolveOgImage(makeMedia(), "https://example.com")).toContain("cdn.example.com");
  });

  it("prefers the OG variant when ready", () => {
    const media = makeMedia({
      variants: {
        og: "https://cdn.example.com/variants/1/og.jpg"
      }
    });

    expect(resolveOgImage(media, "https://example.com")).toBe("https://cdn.example.com/variants/1/og.jpg");
  });
});
