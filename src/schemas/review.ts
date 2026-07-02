import { z } from "zod";

export const reviewSubmitSchema = z.object({
  tourId: z.union([z.string().min(1), z.number()]),
  rating: z.number().int().min(1).max(5),
  authorName: z.string().trim().min(2).max(80),
  authorEmail: z.string().trim().email(),
  comment: z.string().trim().min(10).max(2000),
  /** Honeypot — must stay empty; bots that fill it get a silent OK. */
  website: z.literal("").optional()
});

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
