import { beforeEach, describe, expect, it } from "vitest";
import { submitBooking } from "@/app/actions/submit-booking";
import { resetBookings } from "@/services/booking-repository";
import { resetRateLimit } from "@/services/rate-limit";

const validInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+84901234567",
  tourSlug: "hoi-an-private-heritage-walk",
  numPax: 2,
  preferredDate: "2026-06-20",
  contactChannel: "whatsapp" as const,
  source: "direct" as const,
  idempotencyKey: "booking-key-12345"
};

describe("submitBooking action", () => {
  beforeEach(() => {
    resetBookings();
    resetRateLimit();
  });

  it("creates a Pending booking for valid input", async () => {
    const result = await submitBooking(validInput, "test-user");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.booking.status).toBe("Pending");
      expect(result.data.duplicate).toBe(false);
    }
  });

  it("does not create duplicates for the same idempotency key", async () => {
    const first = await submitBooking(validInput, "test-user");
    const second = await submitBooking(validInput, "test-user");

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.data.duplicate).toBe(true);
      expect(second.data.booking.id).toBe(first.data.booking.id);
    }
  });

  it("returns validation errors for bad input", async () => {
    const result = await submitBooking({ ...validInput, email: "bad" }, "test-user");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("validation");
    }
  });

  it("rate limits repeated submits", async () => {
    for (let index = 0; index < 5; index += 1) {
      await submitBooking({ ...validInput, idempotencyKey: `booking-key-${index}` }, "limited-user");
    }

    const blocked = await submitBooking(
      { ...validInput, idempotencyKey: "booking-key-blocked" },
      "limited-user"
    );

    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error.type).toBe("rate-limit");
    }
  });
});
