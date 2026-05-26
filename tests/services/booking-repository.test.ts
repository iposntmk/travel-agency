import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBookingOnce } from "@/services/booking-repository";
import { getPayloadClient } from "@/lib/payload";
import type { Booking, Customer, Tour } from "@/payload-types";
import type { BookingRecord } from "@/types/domain";

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn()
}));

const mockedGetPayloadClient = vi.mocked(getPayloadClient);

describe("booking repository", () => {
  beforeEach(() => {
    mockedGetPayloadClient.mockReset();
  });

  it("returns an existing booking for duplicate idempotency keys", async () => {
    const payload = payloadMock({
      find: vi.fn().mockResolvedValueOnce({ docs: [payloadBooking()] }),
      create: vi.fn()
    });
    mockedGetPayloadClient.mockResolvedValue(payload);

    const result = await createBookingOnce(bookingRecord());

    expect(result.duplicate).toBe(true);
    expect(result.booking.id).toBe("99");
    expect(result.booking.customerName).toBe("Jane Doe");
    expect(payload.create).not.toHaveBeenCalled();
  });

  it("creates a customer and Pending booking in Payload", async () => {
    const payload = payloadMock({
      find: vi.fn(async ({ collection }) => {
        if (collection === "tours") {
          return { docs: [payloadTour()] };
        }

        return { docs: [] };
      }),
      create: vi.fn(async ({ collection }) => {
        if (collection === "customers") {
          return payloadCustomer();
        }

        return payloadBooking();
      })
    });
    mockedGetPayloadClient.mockResolvedValue(payload);

    const result = await createBookingOnce(bookingRecord());

    expect(result.duplicate).toBe(false);
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "customers",
        overrideAccess: true,
        data: expect.objectContaining({ email: "jane@example.test", preferredContactChannel: "whatsapp" })
      })
    );
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "bookings",
        depth: 1,
        overrideAccess: true,
        data: expect.objectContaining({
          customer: 7,
          tour: 42,
          status: "Pending",
          idempotencyKey: "booking-key-12345"
        })
      })
    );
    expect(result.booking.tourSlug).toBe("hoi-an-private-heritage-walk");
  });

  it("recovers duplicate booking races from the database unique constraint", async () => {
    const create = vi.fn().mockRejectedValue({ code: "23505", message: "bookings_idempotency_key_idx" });
    const payload = payloadMock({
      find: vi.fn(async ({ collection }) => {
        if (collection === "tours") {
          return { docs: [payloadTour()] };
        }
        if (collection === "customers") {
          return { docs: [payloadCustomer()] };
        }
        if (create.mock.calls.length > 0) {
          return { docs: [payloadBooking()] };
        }

        return { docs: [] };
      }),
      create
    });
    mockedGetPayloadClient.mockResolvedValue(payload);

    const result = await createBookingOnce(bookingRecord());

    expect(result.duplicate).toBe(true);
    expect(result.booking.idempotencyKey).toBe("booking-key-12345");
  });

  it("rejects bookings for missing or inactive tours", async () => {
    const payload = payloadMock({
      find: vi.fn(async ({ collection }) => {
        if (collection === "customers") {
          return { docs: [payloadCustomer()] };
        }

        return { docs: [] };
      }),
      create: vi.fn()
    });
    mockedGetPayloadClient.mockResolvedValue(payload);

    await expect(createBookingOnce(bookingRecord())).rejects.toThrow("Active tour not found");
    expect(payload.create).not.toHaveBeenCalled();
  });
});

function payloadMock(overrides: {
  find: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
}): Awaited<ReturnType<typeof getPayloadClient>> {
  return overrides as unknown as Awaited<ReturnType<typeof getPayloadClient>>;
}

function bookingRecord(): BookingRecord {
  const now = "2026-06-01T00:00:00.000Z";

  return {
    id: "draft-booking",
    customerName: "Jane Doe",
    email: "jane@example.test",
    phone: "+84901234567",
    tourSlug: "hoi-an-private-heritage-walk",
    numPax: 2,
    preferredDate: "2026-06-20",
    contactChannel: "whatsapp",
    specialRequest: "Vegan meal",
    source: "direct",
    status: "Pending",
    idempotencyKey: "booking-key-12345",
    statusHistory: [{ from: "New", to: "Pending", actor: "public", source: "server-action", createdAt: now }],
    createdAt: now,
    updatedAt: now
  };
}

function payloadCustomer(): Customer {
  return {
    id: 7,
    name: "Jane Doe",
    email: "jane@example.test",
    phone: "+84901234567",
    preferredContactChannel: "whatsapp",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}

function payloadTour(): Tour {
  return {
    id: 42,
    title: "Hoi An Private Heritage Walk",
    slug: "hoi-an-private-heritage-walk",
    destination: 3,
    operationType: "self-operated",
    tourType: "paid-private",
    status: "active",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}

function payloadBooking(): Booking {
  return {
    id: 99,
    customer: payloadCustomer(),
    tour: payloadTour(),
    numPax: 2,
    preferredDate: "2026-06-20",
    specialRequest: "Vegan meal",
    contactChannel: "whatsapp",
    status: "Pending",
    idempotencyKey: "booking-key-12345",
    source: "direct",
    statusHistory: [
      {
        from: "New",
        to: "Pending",
        actor: "public",
        source: "server-action",
        createdAt: "2026-06-01T00:00:00.000Z"
      }
    ],
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}
