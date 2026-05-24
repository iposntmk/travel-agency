import { z } from "zod";
import { bookingStatuses } from "@/types/domain";
import { customerSchema } from "./customer";

export const contactChannelSchema = z.enum(["whatsapp", "email", "zalo", "phone"]);
export const bookingSourceSchema = z.enum(["direct", "free-tour-upsell", "blog-cta", "social", "ota"]);
export const bookingStatusSchema = z.enum(bookingStatuses);

export const bookingSubmitSchema = customerSchema.extend({
  tourSlug: z.string().trim().min(1).max(120),
  numPax: z.coerce.number().int().min(1).max(40),
  preferredDate: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Preferred date is invalid"),
  contactChannel: contactChannelSchema,
  specialRequest: z.string().trim().max(2000).optional().or(z.literal("")),
  source: bookingSourceSchema.default("direct"),
  idempotencyKey: z.string().trim().min(12).max(120)
});

export type BookingSubmitInput = z.infer<typeof bookingSubmitSchema>;
