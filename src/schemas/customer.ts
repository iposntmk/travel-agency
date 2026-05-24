import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(40)
});

export type CustomerInput = z.infer<typeof customerSchema>;
