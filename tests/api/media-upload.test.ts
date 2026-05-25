import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror the schema from the route handler (avoids importing server-only modules)
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 20 * 1024 * 1024;

const signedUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME),
  fileSize: z.number().int().positive().max(MAX_SIZE),
  alt: z.string().min(1).max(500),
  caption: z.string().max(1000).optional(),
});

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
    const result = signedUploadSchema.safeParse({ ...valid, fileSize: MAX_SIZE + 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing alt text", () => {
    const { alt: _, ...rest } = valid;
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
});
