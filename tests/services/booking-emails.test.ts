import { describe, expect, it, vi } from "vitest";
import { sendBookingInquiryEmails } from "@/services/booking-emails";
import type { BookingEmailEnv } from "@/config/env";
import type { BookingRecord } from "@/types/domain";

const emailEnv: BookingEmailEnv = {
  RESEND_API_KEY: "resend-token",
  RESEND_FROM_EMAIL: "An's Travel Agency <bookings@example.test>",
  BOOKING_SALES_EMAIL: "sales@example.test"
};

describe("booking email service", () => {
  it("sends customer confirmation and internal sales notification", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ id: "email_123" }));

    await sendBookingInquiryEmails(bookingRecord(), {
      env: emailEnv,
      fetcher: fetchMock as unknown as typeof fetch
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [customerMessage, internalMessage] = fetchMock.mock.calls.map((call) =>
      JSON.parse(String(requestInit(call).body))
    );

    expect(customerMessage).toMatchObject({
      from: emailEnv.RESEND_FROM_EMAIL,
      to: "jane@example.test",
      reply_to: emailEnv.BOOKING_SALES_EMAIL,
      subject: "We received your tour inquiry"
    });
    expect(internalMessage).toMatchObject({
      from: emailEnv.RESEND_FROM_EMAIL,
      to: emailEnv.BOOKING_SALES_EMAIL,
      reply_to: "jane@example.test",
      subject: "New booking inquiry: Jane Doe"
    });
    expect(internalMessage.html).toContain("Need &lt;vegan&gt; meals");
  });

  it("surfaces provider failures to the caller", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ error: { message: "Bad sender" } }, 400));

    await expect(
      sendBookingInquiryEmails(bookingRecord(), {
        env: emailEnv,
        fetcher: fetchMock as unknown as typeof fetch
      })
    ).rejects.toThrow("Bad sender");
  });
});

function bookingRecord(): BookingRecord {
  const now = new Date().toISOString();

  return {
    id: "booking-1",
    customerName: "Jane Doe",
    email: "jane@example.test",
    phone: "+84901234567",
    tourSlug: "hoi-an-private-heritage-walk",
    numPax: 2,
    preferredDate: "2026-06-20",
    contactChannel: "whatsapp",
    specialRequest: "Need <vegan> meals",
    source: "direct",
    status: "Pending",
    idempotencyKey: "booking-key-12345",
    statusHistory: [{ from: "New", to: "Pending", actor: "public", source: "server-action", createdAt: now }],
    createdAt: now,
    updatedAt: now
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function requestInit(call: unknown): RequestInit {
  return (call as [unknown, RequestInit])[1];
}
