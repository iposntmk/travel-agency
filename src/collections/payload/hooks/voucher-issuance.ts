import type { CollectionAfterChangeHook } from "payload";
import type { Booking } from "@/payload-types";

const CONFIRMED_STATUSES = new Set(["Confirmed - Pay Later", "Confirmed - Paid"]);

/**
 * Thin hook: when a booking transitions INTO a confirmed status, (1) issue
 * cross-sell vouchers for matching promotions and email them to the customer,
 * and (2) mark the booking's own appliedVoucher as redeemed. Business logic
 * lives in services/voucher-service.ts; failures are logged, never thrown —
 * a voucher problem must not block the booking save.
 */
export const issueVouchersAfterBookingChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const booking = doc as Booking;
  const previousStatus = (previousDoc as Booking | undefined)?.status;
  const becameConfirmed = CONFIRMED_STATUSES.has(booking.status) && !CONFIRMED_STATUSES.has(previousStatus ?? "");
  if (!becameConfirmed) return doc;

  try {
    const [{ issueVouchersForBooking, redeemVoucher }, { sendVoucherIssuedEmail }] = await Promise.all([
      import("@/services/voucher-service"),
      import("@/services/voucher-emails")
    ]);

    const issued = await issueVouchersForBooking(req.payload, booking);
    for (const voucher of issued) {
      await sendVoucherIssuedEmail(voucher).catch((error: unknown) => {
        req.payload.logger.error({ err: error, code: voucher.code }, "voucher email failed");
      });
    }

    const appliedVoucher = (booking as { appliedVoucher?: number | string | { id: number | string } | null })
      .appliedVoucher;
    if (appliedVoucher) {
      const voucherId = typeof appliedVoucher === "object" ? appliedVoucher.id : appliedVoucher;
      await redeemVoucher(req.payload, voucherId, booking.id);
    }
  } catch (error: unknown) {
    req.payload.logger.error({ err: error, bookingId: booking.id }, "voucher issuance failed");
  }

  return doc;
};
