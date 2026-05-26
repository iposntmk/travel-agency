import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateDimensions, variantKey, generateVariants } from "@/services/media-processor";
import { r2PutObject } from "@/lib/r2";

vi.mock("@/lib/r2", () => ({
  IMMUTABLE_CACHE_CONTROL: "public, max-age=31536000, immutable",
  r2GetObject: vi.fn().mockResolvedValue(Buffer.from("fake-image-data")),
  r2PutObject: vi.fn().mockResolvedValue(undefined),
  r2PublicUrl: (key: string) => `https://cdn.example.com/${key}`,
}));

vi.mock("sharp", () => {
  const mkBuf = () => Promise.resolve(Buffer.from("processed"));
  const instance = {
    metadata: vi.fn().mockResolvedValue({ width: 1200, height: 800 }),
    resize: function () {
      return this;
    },
    avif: function () {
      return { toBuffer: mkBuf };
    },
    webp: function () {
      return { toBuffer: mkBuf };
    },
    jpeg: function () {
      return { toBuffer: mkBuf };
    },
  };
  return { default: vi.fn(() => instance) };
});

describe("validateDimensions", () => {
  it("passes for normal image sizes", () => {
    expect(() => validateDimensions(1920, 1080)).not.toThrow();
    expect(() => validateDimensions(400, 300)).not.toThrow();
    expect(() => validateDimensions(8000, 8000)).not.toThrow();
  });

  it("throws when width exceeds 8000px", () => {
    expect(() => validateDimensions(8001, 1000)).toThrow("8000px limit");
  });

  it("throws when height exceeds 8000px", () => {
    expect(() => validateDimensions(1000, 8001)).toThrow("8000px limit");
  });

  it("handles undefined dimensions without throwing", () => {
    expect(() => validateDimensions(undefined, undefined)).not.toThrow();
  });
});

describe("variantKey", () => {
  it("generates deterministic keys from mediaId", () => {
    expect(variantKey(42, "thumb", "avif")).toBe("variants/42/thumb.avif");
    expect(variantKey(42, "card", "webp")).toBe("variants/42/card.webp");
    expect(variantKey(42, "hero", "avif")).toBe("variants/42/hero.avif");
    expect(variantKey(42, "og", "jpg")).toBe("variants/42/og.jpg");
  });

  it("is idempotent — same inputs produce same key", () => {
    const key1 = variantKey(99, "thumb", "avif");
    const key2 = variantKey(99, "thumb", "avif");
    expect(key1).toBe(key2);
  });
});

describe("generateVariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all expected variant URLs", async () => {
    const variants = await generateVariants("42", "originals/2026/05/42/original.jpg");

    expect(variants).toMatchObject({
      thumb: {
        avif: expect.stringContaining("thumb.avif"),
        webp: expect.stringContaining("thumb.webp"),
      },
      card: {
        avif: expect.stringContaining("card.avif"),
        webp: expect.stringContaining("card.webp"),
      },
      hero: {
        avif: expect.stringContaining("hero.avif"),
        webp: expect.stringContaining("hero.webp"),
      },
      og: expect.stringContaining("og.jpg"),
    });
  });

  it("variant URLs follow the deterministic key pattern", async () => {
    const variants = await generateVariants("42", "originals/2026/05/42/original.jpg");
    expect(variants.thumb.avif).toBe("https://cdn.example.com/variants/42/thumb.avif");
    expect(variants.og).toBe("https://cdn.example.com/variants/42/og.jpg");
  });

  it("uploads generated variants with immutable cache headers", async () => {
    await generateVariants("42", "originals/2026/05/42/original.jpg");

    expect(r2PutObject).toHaveBeenCalledWith(
      expect.stringContaining("variants/42/"),
      expect.any(Buffer),
      expect.stringMatching(/^image\//),
      "public, max-age=31536000, immutable"
    );
  });
});
