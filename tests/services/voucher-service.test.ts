import { describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";
import type { Booking, Promotion, Voucher } from "@/payload-types";
import { issueVouchersForBooking, redeemVoucher, validateVoucher } from "@/services/voucher-service";

function promotion(overrides: Partial<Promotion> = {}): Promotion {
  const now = Date.now();
  return {
    id: 1,
    name: "Car → Show cross-sell",
    code: "CARSHOW",
    discountType: "percentage",
    discountValue: 10,
    startDate: new Date(now - 86_400_000).toISOString(),
    endDate: new Date(now + 86_400_000).toISOString(),
    autoIssueVoucher: true,
    voucherValidityDays: 30,
    triggerProducts: [{ relationTo: "car-rentals", value: 55 }],
    rewardApplicableTo: [{ relationTo: "experiences", value: 77 }],
    updatedAt: "",
    createdAt: "",
    ...overrides
  } as unknown as Promotion;
}

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 500,
    numPax: 2,
    preferredDate: new Date().toISOString(),
    status: "Confirmed - Pay Later",
    idempotencyKey: "key-1",
    customer: { id: 9, name: "Jane", email: "jane@example.test", updatedAt: "", createdAt: "" },
    product: { relationTo: "car-rentals", value: 55 },
    updatedAt: "",
    createdAt: "",
    ...overrides
  } as unknown as Booking;
}

function payloadMock(overrides: Partial<Record<"find" | "create" | "update" | "findByID", unknown>> = {}): Payload {
  return {
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create: vi.fn().mockResolvedValue({ id: 1000, code: "TC-AAAA-BBBB" }),
    update: vi.fn().mockResolvedValue({}),
    findByID: vi.fn().mockResolvedValue(null),
    ...overrides
  } as unknown as Payload;
}

describe("voucher-service issuance", () => {
  it("issues a voucher when the booked product matches a trigger", async () => {
    const payload = payloadMock({
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === "promotions") return { docs: [promotion()] };
        return { docs: [] }; // no existing voucher
      })
    });

    const issued = await issueVouchersForBooking(payload, booking());

    expect(issued).toHaveLength(1);
    expect(issued[0].customerEmail).toBe("jane@example.test");
    expect(issued[0].discountValue).toBe(10);
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "vouchers",
        data: expect.objectContaining({
          promotion: 1,
          sourceBooking: 500,
          status: "issued",
          code: expect.stringMatching(/^TC-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
        })
      })
    );
  });

  it("matches legacy tour bookings through the tour field", async () => {
    const payload = payloadMock({
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === "promotions") {
          return { docs: [promotion({ triggerProducts: [{ relationTo: "tours", value: 12 }] } as never)] };
        }
        return { docs: [] };
      })
    });

    const issued = await issueVouchersForBooking(payload, booking({ tour: 12, product: undefined } as never));

    expect(issued).toHaveLength(1);
  });

  it("is idempotent per promotion + source booking", async () => {
    const payload = payloadMock({
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === "promotions") return { docs: [promotion()] };
        return { docs: [{ id: 777 }] }; // voucher already exists
      })
    });

    const issued = await issueVouchersForBooking(payload, booking());

    expect(issued).toHaveLength(0);
    expect(payload.create).not.toHaveBeenCalled();
  });

  it("skips promotions outside their date window", async () => {
    const expired = promotion({
      startDate: new Date(Date.now() - 2 * 86_400_000).toISOString(),
      endDate: new Date(Date.now() - 86_400_000).toISOString()
    } as never);
    const payload = payloadMock({
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === "promotions") return { docs: [expired] };
        return { docs: [] };
      })
    });

    const issued = await issueVouchersForBooking(payload, booking());

    expect(issued).toHaveLength(0);
  });

  it("skips non-matching products", async () => {
    const payload = payloadMock({
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === "promotions") return { docs: [promotion()] };
        return { docs: [] };
      })
    });

    const issued = await issueVouchersForBooking(
      payload,
      booking({ product: { relationTo: "cruises", value: 3 } } as never)
    );

    expect(issued).toHaveLength(0);
  });
});

function voucher(overrides: Partial<Voucher> = {}): Voucher {
  return {
    id: 42,
    code: "TC-AAAA-BBBB",
    promotion: promotion(),
    customerEmail: "jane@example.test",
    sourceBooking: 500,
    status: "issued",
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    updatedAt: "",
    createdAt: "",
    ...overrides
  } as unknown as Voucher;
}

describe("voucher-service validation", () => {
  it("accepts an issued voucher for an applicable product", async () => {
    const payload = payloadMock({ find: vi.fn().mockResolvedValue({ docs: [voucher()] }) });

    const result = await validateVoucher(payload, "tc-aaaa-bbbb", { relationTo: "experiences", id: 77 });

    expect(result).toMatchObject({ valid: true, discountType: "percentage", discountValue: 10 });
  });

  it("rejects unknown, used, expired, and non-applicable codes", async () => {
    const cases: { doc: Voucher | undefined; product: { relationTo: "tours" | "experiences"; id: number }; reason: string }[] = [
      { doc: undefined, product: { relationTo: "experiences", id: 77 }, reason: "not-found" },
      { doc: voucher({ status: "redeemed" } as never), product: { relationTo: "experiences", id: 77 }, reason: "used" },
      {
        doc: voucher({ expiresAt: new Date(Date.now() - 1000).toISOString() } as never),
        product: { relationTo: "experiences", id: 77 },
        reason: "expired"
      },
      { doc: voucher(), product: { relationTo: "tours", id: 77 }, reason: "not-applicable" }
    ];

    for (const testCase of cases) {
      const payload = payloadMock({
        find: vi.fn().mockResolvedValue({ docs: testCase.doc ? [testCase.doc] : [] })
      });
      const result = await validateVoucher(payload, "TC-AAAA-BBBB", testCase.product);
      expect(result).toMatchObject({ valid: false, reason: testCase.reason });
    }
  });
});

describe("voucher-service redemption", () => {
  it("marks an issued voucher redeemed with the redeeming booking", async () => {
    const payload = payloadMock({ findByID: vi.fn().mockResolvedValue(voucher()) });

    await redeemVoucher(payload, 42, 600);

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "vouchers",
        id: 42,
        data: { status: "redeemed", redeemedBooking: 600 }
      })
    );
  });

  it("never re-redeems a non-issued voucher", async () => {
    const payload = payloadMock({ findByID: vi.fn().mockResolvedValue(voucher({ status: "redeemed" } as never)) });

    await redeemVoucher(payload, 42, 600);

    expect(payload.update).not.toHaveBeenCalled();
  });
});
