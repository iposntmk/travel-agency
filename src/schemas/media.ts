import { z } from "zod";

export const mediaMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxMediaUploadSize = 20 * 1024 * 1024;

export const signedUploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mimeType: z.enum(mediaMimeTypes),
  fileSize: z.number().int().positive().max(maxMediaUploadSize),
  alt: z.string().trim().min(1).max(500),
  caption: z.string().trim().max(1000).optional()
});

export const completeMediaUploadSchema = z.object({
  mediaId: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional()
});

export const mediaProcessJobSchema = z.object({
  mediaId: z.number().int().positive(),
  r2Key: z.string().trim().min(1),
  jobKey: z.string().trim().min(1).max(300)
});

export type SignedUploadRequest = z.infer<typeof signedUploadSchema>;
