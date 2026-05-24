import { describe, expect, it } from "vitest";
import { createInitialStatusHistory, transitionBookingStatus } from "@/services/booking-transitions";
import type { BookingRecord } from "@/types/domain";

const booking: BookingRecord = {
  id: "booking-1",
  customerName: "Jane Doe",
  email: "jane@example.com",
  phone: "+84901234567",
  tourSlug: "hoi-an-private-heritage-walk",
  numPax: 2,
  preferredDate: "2026-06-20",
  contactChannel: "whatsapp",
  source: "direct",
  status: "Pending",
  idempotencyKey: "booking-key-12345",
  statusHistory: createInitialStatusHistory(),
  createdAt: "2026-05-24T00:00:00.000Z",
  updatedAt: "2026-05-24T00:00:00.000Z"
};

describe("booking transitions", () => {
  it("allows Pending to Confirmed - Pay Later and appends audit history", () => {
    const updated = transitionBookingStatus(booking, "Confirmed - Pay Later", {
      actor: "sales@example.com",
      source: "sales",
      reason: "Customer confirmed via WhatsApp"
    });

    expect(updated.status).toBe("Confirmed - Pay Later");
    expect(updated.statusHistory).toHaveLength(2);
  });

  it("rejects invalid forward transitions", () => {
    expect(() =>
      transitionBookingStatus(booking, "Completed", {
        actor: "sales@example.com",
        source: "sales"
      })
    ).toThrow("Invalid booking transition");
  });

  it("requires reason for admin reverse transitions", () => {
    const paid = { ...booking, status: "Confirmed - Paid" as const };
    expect(() =>
      transitionBookingStatus(paid, "Pending", {
        actor: "admin@example.com",
        source: "admin",
        allowAdminReverse: true
      })
    ).toThrow("audit reason");
  });
});
