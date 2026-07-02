import "server-only";

import { randomBytes } from "node:crypto";
import type { Payload } from "payload";
import type { Booking, Promotion, Voucher } from "@/payload-types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

type PolyRef = { relationTo: string; value: number | string | { id: number | string } };

function generateVoucherCode(): string {
  const bytes = randomBytes(8);
  const chars = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]);
  return `TC-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

function refId(value: PolyRef["value"]): string {
  return String(typeof value === "object" && value !== null ? value.id : value);
}

/** Product references of a booking: legacy `tour` + polymorphic `product`. */
function bookingProductRefs(booking: Booking): { relationTo: string; id: string }[] {
  const refs: { relationTo: string; id: string }[] = [];
  if (booking.tour) {
    refs.push({ relationTo: "tours", id: refId(booking.tour as PolyRef["value"]) });
  }
  const product = (booking as { product?: PolyRef | null }).product;
  if (product?.relationTo && product.value !== undefined && product.value !== null) {
    refs.push({ relationTo: product.relationTo, id: refId(product.value) });
  }
  return refs;
}

function promotionMatchesBooking(promotion: Promotion, booking: Booking): boolean {
  const triggers = ((promotion as { triggerProducts?: PolyRef[] | null }).triggerProducts ?? []).map((trigger) => ({
    relationTo: trigger.relationTo,
    id: refId(trigger.value)
  }));
  if (triggers.length === 0) return false;
  const products = bookingProductRefs(booking);
  return products.some((product) =>
    triggers.some((trigger) => trigger.relationTo === product.relationTo && trigger.id === product.id)
  );
}

function isWithinWindow(promotion: Promotion, now = Date.now()): boolean {
  return Date.parse(promotion.startDate) <= now && Date.parse(promotion.endDate) >= now;
}

async function customerEmailOf(payload: Payload, booking: Booking): Promise<string | null> {
  if (booking.customer && typeof booking.customer === "object" && booking.customer.email) {
    return booking.customer.email;
  }
  if (typeof booking.customer === "number" || typeof booking.customer === "string") {
    const customer = await payload.findByID({
      collection: "customers",
      id: booking.customer,
      depth: 0,
      overrideAccess: true
    });
    return customer?.email ?? null;
  }
  return null;
}

export type IssuedVoucher = {
  code: string;
  promotionName: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiresAt?: string;
  customerEmail: string;
};

/**
 * Issues vouchers for every active autoIssueVoucher promotion whose
 * triggerProducts contain the booking's product. Idempotent per
 * (promotion, sourceBooking). Returns the created vouchers for notification.
 */
export async function issueVouchersForBooking(payload: Payload, booking: Booking): Promise<IssuedVoucher[]> {
  const promotions = await payload.find({
    collection: "promotions",
    where: { autoIssueVoucher: { equals: true } },
    limit: 50,
    depth: 0,
    overrideAccess: true
  });

  const matching = (promotions.docs as Promotion[]).filter(
    (promotion) => isWithinWindow(promotion) && promotionMatchesBooking(promotion, booking)
  );
  if (matching.length === 0) return [];

  const email = await customerEmailOf(payload, booking);
  if (!email) return [];

  const issued: IssuedVoucher[] = [];
  for (const promotion of matching) {
    const existing = await payload.find({
      collection: "vouchers",
      where: {
        and: [{ promotion: { equals: promotion.id } }, { sourceBooking: { equals: booking.id } }]
      },
      limit: 1,
      depth: 0,
      overrideAccess: true
    });
    if (existing.docs[0]) continue;

    const expiresAt = promotion.voucherValidityDays
      ? new Date(Date.now() + promotion.voucherValidityDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const voucher = (await payload.create({
      collection: "vouchers",
      overrideAccess: true,
      data: {
        code: generateVoucherCode(),
        promotion: promotion.id,
        customerEmail: email,
        customer:
          booking.customer && typeof booking.customer === "object" ? booking.customer.id : booking.customer,
        sourceBooking: booking.id,
        status: "issued",
        expiresAt,
        issuedAt: new Date().toISOString()
      }
    })) as unknown as Voucher;

    issued.push({
      code: voucher.code,
      promotionName: promotion.name,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      expiresAt,
      customerEmail: email
    });
  }

  return issued;
}

export type VoucherValidation =
  | { valid: true; voucherId: number | string; discountType: "percentage" | "fixed"; discountValue: number; promotionName: string }
  | { valid: false; reason: "not-found" | "expired" | "used" | "not-applicable" };

/**
 * Validates a voucher code against the product being booked. Product must be
 * listed in the promotion's rewardApplicableTo (tours or experiences).
 */
export async function validateVoucher(
  payload: Payload,
  code: string,
  product: { relationTo: "tours" | "experiences"; id: number | string }
): Promise<VoucherValidation> {
  const result = await payload.find({
    collection: "vouchers",
    where: { code: { equals: code.trim().toUpperCase() } },
    limit: 1,
    depth: 1,
    overrideAccess: true
  });
  const voucher = result.docs[0] as Voucher | undefined;
  if (!voucher) return { valid: false, reason: "not-found" };
  if (voucher.status === "redeemed" || voucher.status === "void") return { valid: false, reason: "used" };
  if (voucher.status === "expired" || (voucher.expiresAt && Date.parse(voucher.expiresAt) < Date.now())) {
    return { valid: false, reason: "expired" };
  }

  const promotion =
    voucher.promotion && typeof voucher.promotion === "object"
      ? (voucher.promotion as Promotion)
      : ((await payload.findByID({
          collection: "promotions",
          id: voucher.promotion as number,
          depth: 0,
          overrideAccess: true
        })) as Promotion);

  const rewards = ((promotion as { rewardApplicableTo?: PolyRef[] | null }).rewardApplicableTo ?? []).map(
    (reward) => ({ relationTo: reward.relationTo, id: refId(reward.value) })
  );
  const applicable = rewards.some(
    (reward) => reward.relationTo === product.relationTo && reward.id === String(product.id)
  );
  if (!applicable) return { valid: false, reason: "not-applicable" };

  return {
    valid: true,
    voucherId: voucher.id,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    promotionName: promotion.name
  };
}

/**
 * Marks a voucher redeemed by a confirmed booking. Called from the booking
 * afterChange hook when a booking carrying appliedVoucher reaches a Confirmed
 * status — abandoned inquiries never burn codes.
 */
export async function redeemVoucher(
  payload: Payload,
  voucherId: number | string,
  redeemedBookingId: number | string
): Promise<void> {
  const voucher = (await payload.findByID({
    collection: "vouchers",
    id: Number(voucherId),
    depth: 0,
    overrideAccess: true
  })) as unknown as Voucher | null;
  if (!voucher || voucher.status !== "issued") return;

  await payload.update({
    collection: "vouchers",
    id: Number(voucherId),
    overrideAccess: true,
    data: { status: "redeemed", redeemedBooking: Number(redeemedBookingId) }
  });
}
