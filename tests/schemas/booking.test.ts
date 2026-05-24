import { describe, expect, it } from "vitest";
import { bookingSubmitSchema } from "@/schemas/booking";

describe("booking submit schema", () => {
  it("accepts valid paid tour inquiry input", () => {
    const parsed = bookingSubmitSchema.parse({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+84901234567",
      tourSlug: "hoi-an-private-heritage-walk",
      numPax: 2,
      preferredDate: "2026-06-20",
      contactChannel: "whatsapp",
      source: "direct",
      idempotencyKey: "booking-key-12345"
    });

    expect(parsed.numPax).toBe(2);
  });

  it("rejects invalid pax and contact details", () => {
    const parsed = bookingSubmitSchema.safeParse({
      name: "J",
      email: "bad",
      phone: "1",
      tourSlug: "",
      numPax: 0,
      preferredDate: "not-a-date",
      contactChannel: "sms",
      idempotencyKey: "short"
    });

    expect(parsed.success).toBe(false);
  });
});
