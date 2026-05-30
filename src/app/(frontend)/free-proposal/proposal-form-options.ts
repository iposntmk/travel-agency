import type { Path } from "react-hook-form";
import type { z } from "zod";
import { customInquirySchema } from "@/schemas/custom-inquiry";

export type CustomInquiryFormValues = z.input<typeof customInquirySchema>;

export const PROPOSAL_THEMES = ["Culture", "Food", "Nature", "Family", "Beach", "Photography"];
export const PROPOSAL_STAGES = ["I have an idea", "I need advice", "Ready to book"];

export const PROPOSAL_STEP_FIELDS = [
  ["planningStage"],
  ["adults", "children", "departureMonth", "estimatedDays"],
  ["selectedDestinations", "themes", "message"],
  ["name", "email", "phone", "nationality", "whatsappOptIn"]
] satisfies readonly (readonly Path<CustomInquiryFormValues>[])[];
