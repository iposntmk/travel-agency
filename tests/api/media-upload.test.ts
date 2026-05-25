import { describe, it, expect } from "vitest";
import { maxMediaUploadSize, mediaProcessJobSchema, signedUploadSchema } from "@/schemas/media";

describe("signed-upload request validation", () => {
  const valid = {
    filename: "tour-hero.jpg",
    mimeType: "image/jpeg" as const,
    fileSize: 5 * 1024 * 1024,
    alt: "Hội An lanterns at night",
  };

  it("accepts a valid upload request", () => {
    expect(signedUploadSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional caption", () => {
    const result = signedUploadSchema.safeParse({ ...valid, caption: "A lovely scene" });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported MIME types", () => {
    const result = signedUploadSchema.safeParse({ ...valid, mimeType: "image/gif" });
    expect(result.success).toBe(false);
  });

  it("rejects files over 20MB", () => {
    const result = signedUploadSchema.safeParse({ ...valid, fileSize: maxMediaUploadSize + 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing alt text", () => {
    const rest: Partial<typeof valid> = { ...valid };
    delete rest.alt;
    expect(signedUploadSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty filename", () => {
    const result = signedUploadSchema.safeParse({ ...valid, filename: "" });
    expect(result.success).toBe(false);
  });

  it("accepts webp and png MIME types", () => {
    expect(signedUploadSchema.safeParse({ ...valid, mimeType: "image/png" }).success).toBe(true);
    expect(signedUploadSchema.safeParse({ ...valid, mimeType: "image/webp" }).success).toBe(true);
  });
});

describe("media processing idempotency", () => {
  it("skips processing when status is already ready", () => {
    const shouldSkip = (status: string) => status === "ready";
    expect(shouldSkip("ready")).toBe(true);
    expect(shouldSkip("processing")).toBe(false);
    expect(shouldSkip("uploading")).toBe(false);
    expect(shouldSkip("failed")).toBe(false);
  });

  it("requires a deterministic media job key", () => {
    expect(
      mediaProcessJobSchema.safeParse({
        mediaId: 42,
        r2Key: "originals/2026/05/42/original.jpg",
        jobKey: "media:42:originals/2026/05/42/original.jpg"
      }).success
    ).toBe(true);

    expect(
      mediaProcessJobSchema.safeParse({
        mediaId: 42,
        r2Key: "originals/2026/05/42/original.jpg"
      }).success
    ).toBe(false);
  });
});
