import { z } from "zod";

export const paymentReadySchema = z.object({
  bookingId: z.string().min(1),
  provider: z.enum(["stripe", "vnpay", "momo"]),
  providerEventId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(["USD", "VND", "EUR"]),
  status: z.enum(["pending", "paid", "failed", "cancelled"])
});

export type PaymentReadyInput = z.infer<typeof paymentReadySchema>;
