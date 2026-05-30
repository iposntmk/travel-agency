import { z } from "zod";
import { customerSchema } from "./customer";

const text = z.string().trim().max(120);
const optionalText = text.optional().or(z.literal(""));
const plainList = z.array(text.min(1)).max(12).default([]);

export const customInquirySchema = customerSchema.extend({
  planningStage: optionalText,
  referralSource: optionalText,
  travelCompanions: optionalText,
  occasion: optionalText,
  adults: z.coerce.number().int().min(1).max(40),
  children: z.coerce.number().int().min(0).max(20).default(0),
  exactDatesKnown: z.coerce.boolean().default(false),
  departureDate: optionalText,
  returnDate: optionalText,
  departureMonth: optionalText,
  estimatedDays: z.coerce.number().int().min(1).max(90).optional(),
  accommodationLevels: plainList,
  themes: plainList,
  accompanimentType: optionalText,
  budgetPerPerson: z.coerce.number().min(0).max(100000).optional(),
  maxBudget: z.coerce.number().min(0).max(1000000).optional(),
  selectedDestinations: z.array(text.min(1)).min(1, "Select at least one destination").max(12),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
  nationality: optionalText,
  whatsappOptIn: z.coerce.boolean().default(false),
  source: text.default("free-proposal"),
  idempotencyKey: z.string().trim().min(12).max(120)
}).superRefine((input, ctx) => {
  if (input.exactDatesKnown && (!input.departureDate || !input.returnDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["departureDate"],
      message: "Departure and return dates are required when exact dates are known"
    });
  }

  if (!input.exactDatesKnown && !input.departureMonth) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["departureMonth"],
      message: "Choose an approximate departure month"
    });
  }
});

export type CustomInquiryInput = z.infer<typeof customInquirySchema>;
