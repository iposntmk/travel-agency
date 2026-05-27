import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitBooking } from "@/app/actions/submit-booking";
import { createBookingOnce } from "@/services/booking-repository";
import { sendBookingInquiryEmails } from "@/services/booking-emails";
import { resetRateLimit } from "@/services/rate-limit";
import type { BookingRecord } from "@/types/domain";

vi.mock("@/services/booking-repository", () => ({
  createBookingOnce: vi.fn()
}));

vi.mock("@/services/booking-emails", () => ({
  sendBookingInquiryEmails: vi.fn()
}));

const mockedCreateBookingOnce = vi.mocked(createBookingOnce);
const mockedSendBookingInquiryEmails = vi.mocked(sendBookingInquiryEmails);

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
    resetRateLimit();
    mockedCreateBookingOnce.mockReset();
    mockedSendBookingInquiryEmails.mockReset();
    mockedCreateBookingOnce.mockImplementation(async (booking) => ({ booking, duplicate: false }));
    mockedSendBookingInquiryEmails.mockResolvedValue(undefined);
  });

  it("creates a Pending booking for valid input", async () => {
    const result = await submitBooking(validInput, "test-user");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.booking.status).toBe("Pending");
      expect(result.data.duplicate).toBe(false);
    }
    expect(mockedSendBookingInquiryEmails).toHaveBeenCalledTimes(1);
  });

  it("does not create duplicates for the same idempotency key", async () => {
    const storedBooking = bookingRecord();
    mockedCreateBookingOnce
      .mockResolvedValueOnce({ booking: storedBooking, duplicate: false })
      .mockResolvedValueOnce({ booking: storedBooking, duplicate: true });

    const first = await submitBooking(validInput, "test-user");
    const second = await submitBooking(validInput, "test-user");

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.data.duplicate).toBe(true);
      expect(second.data.booking.id).toBe(first.data.booking.id);
    }
    expect(mockedSendBookingInquiryEmails).toHaveBeenCalledTimes(1);
  });

  it("keeps booking success idempotent when email delivery fails", async () => {
    const storedBooking = bookingRecord();
    mockedCreateBookingOnce
      .mockResolvedValueOnce({ booking: storedBooking, duplicate: false })
      .mockResolvedValueOnce({ booking: storedBooking, duplicate: true });
    mockedSendBookingInquiryEmails.mockRejectedValueOnce(new Error("Resend failed"));

    const first = await submitBooking(validInput, "email-failure-user");
    const second = await submitBooking(validInput, "email-failure-user");

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(mockedCreateBookingOnce).toHaveBeenCalledTimes(2);
    expect(mockedSendBookingInquiryEmails).toHaveBeenCalledTimes(1);
    if (second.ok) {
      expect(second.data.duplicate).toBe(true);
    }
  });

  it("stores special requests as sanitized plain text", async () => {
    const result = await submitBooking(
      {
        ...validInput,
        idempotencyKey: "booking-key-sanitized",
        specialRequest: " <strong>Vegan meal</strong><script>alert(1)</script><br>Window seat "
      },
      "sanitized-user"
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.booking.specialRequest).toBe("Vegan meal\nWindow seat");
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

function bookingRecord(overrides: Partial<BookingRecord> = {}): BookingRecord {
  const now = new Date().toISOString();

  return {
    id: "booking-1",
    customerName: validInput.name,
    email: validInput.email,
    phone: validInput.phone,
    tourSlug: validInput.tourSlug,
    numPax: validInput.numPax,
    preferredDate: validInput.preferredDate,
    contactChannel: validInput.contactChannel,
    source: validInput.source,
    status: "Pending",
    idempotencyKey: validInput.idempotencyKey,
    statusHistory: [{ from: "New", to: "Pending", actor: "public", source: "server-action", createdAt: now }],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}
