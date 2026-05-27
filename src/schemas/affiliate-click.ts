import { z } from "zod";

export const affiliateTargetTypeSchema = z.enum(["addon", "ota"]);

export const affiliateClickEventSchema = z.object({
  targetType: affiliateTargetTypeSchema,
  targetId: z.string().trim().min(1).max(200),
  targetUrl: z.string().trim().url().max(2000),
  source: z.string().trim().min(1).max(500)
});

export type AffiliateClickEventInput = z.infer<typeof affiliateClickEventSchema>;
