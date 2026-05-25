import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  partnerType: z.enum(["tour-outsource", "spa", "dental", "nail", "wellness", "other"]),
  commissionRate: z.number().min(0.2).max(0.35),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  isFeatured: z.boolean().default(false)
});

export type PartnerInput = z.infer<typeof partnerSchema>;
