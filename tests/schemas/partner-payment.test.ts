import { describe, expect, it } from "vitest";
import { partnerSchema } from "@/schemas/partner";
import { paymentReadySchema } from "@/schemas/payment";

describe("partner schema", () => {
  it("keeps commission rates in the allowed range", () => {
    expect(() =>
      partnerSchema.parse({ name: "Spa Partner", partnerType: "spa", commissionRate: 0.2 })
    ).not.toThrow();
    expect(() =>
      partnerSchema.parse({ name: "Bad Partner", partnerType: "spa", commissionRate: 0.36 })
    ).toThrow();
    expect(() =>
      partnerSchema.parse({ name: "Bad Partner", partnerType: "spa", commissionRate: 0.19 })
    ).toThrow();
  });
});

describe("payment-ready schema", () => {
  it("validates future payment contract inputs", () => {
    expect(() =>
      paymentReadySchema.parse({
        bookingId: "booking-1",
        provider: "stripe",
        providerEventId: "evt_1",
        amount: 100,
        currency: "USD",
        status: "paid"
      })
    ).not.toThrow();
  });
});
