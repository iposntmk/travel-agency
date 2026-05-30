import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email(),
  source: z.string().trim().max(120).optional()
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
