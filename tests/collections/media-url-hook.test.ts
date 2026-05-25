import { describe, expect, it } from "vitest";
import { normalizeMediaDocumentUrls } from "@/collections/payload/hooks/normalize-media-url";
import type { Media } from "@/payload-types";

type TestMedia = Media & {
  sizes?: Record<string, { filename?: string | null; url?: string | null } | null> | null;
};

function makeMedia(overrides: Partial<TestMedia> = {}): TestMedia {
  return {
    id: 1,
    alt: "Hue",
    status: "ready",
    filename: "Dai-Noi-Hue-khi-hoang-hon-buong-xuong-1.jpg",
    url: "/api/media/file/Dai-Noi-Hue-khi-hoang-hon-buong-xuong-1.jpg",
    updatedAt: "2026-05-25T00:00:00.000Z",
    createdAt: "2026-05-25T00:00:00.000Z",
    ...overrides
  } as TestMedia;
}

describe("normalizeMediaDocumentUrls", () => {
  it("keeps the document unchanged when R2 public URL is missing", () => {
    const media = makeMedia();
    expect(normalizeMediaDocumentUrls(media, undefined).url).toBe(
      "/api/media/file/Dai-Noi-Hue-khi-hoang-hon-buong-xuong-1.jpg"
    );
  });

  it("rewrites internal media file URLs to R2 public URLs", () => {
    const media = normalizeMediaDocumentUrls(makeMedia(), "https://pub.example.r2.dev");

    expect(media.url).toBe("https://pub.example.r2.dev/Dai-Noi-Hue-khi-hoang-hon-buong-xuong-1.jpg");
  });

  it("rewrites nested image size URLs", () => {
    const media = normalizeMediaDocumentUrls(
      makeMedia({
        sizes: {
          thumbnail: {
            filename: "thumb.jpg",
            url: "https://tc-travel-vietnam.vercel.app/api/media/file/thumb.jpg"
          },
          hero: {
            filename: "hero.jpg",
            url: "https://cdn.example.com/hero.jpg"
          }
        }
      }),
      "https://pub.example.r2.dev"
    );

    expect(media.sizes?.thumbnail?.url).toBe("https://pub.example.r2.dev/thumb.jpg");
    expect(media.sizes?.hero?.url).toBe("https://cdn.example.com/hero.jpg");
  });
});
