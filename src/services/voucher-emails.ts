import "server-only";

import { getBookingEmailEnv } from "@/config/env";
import type { IssuedVoucher } from "@/services/voucher-service";

/**
 * "You unlocked 10% off Ky Uc Hoi An — code TC-XXXX" notification, sent right
 * after a trigger booking is confirmed. Uses the same Resend setup as booking
 * emails; one email per voucher (promotions rarely overlap, no fan-out risk).
 */
export async function sendVoucherIssuedEmail(voucher: IssuedVoucher, fetcher: typeof fetch = fetch): Promise<void> {
  const env = getBookingEmailEnv();

  const discountLabel =
    voucher.discountType === "percentage" ? `${voucher.discountValue}% off` : `$${voucher.discountValue} off`;
  const expiryLine = voucher.expiresAt
    ? `Valid until ${new Date(voucher.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    : "No expiry date.";

  const subject = `You unlocked ${discountLabel} — ${voucher.promotionName}`;
  const text = [
    "Great news!",
    "",
    `Your confirmed booking unlocked a reward: ${discountLabel} with "${voucher.promotionName}".`,
    "",
    `Your voucher code: ${voucher.code}`,
    expiryLine,
    "",
    "Quote this code when you book the eligible experience or tour — via the booking form, WhatsApp, or email — and the discount is applied on confirmation.",
    "",
    "TC Travel Vietnam"
  ].join("\n");

  const html = text
    .split("\n")
    .map((line) => (line === "" ? "<br/>" : `<p style="margin:0 0 4px">${line.replace(voucher.code, `<strong>${voucher.code}</strong>`)}</p>`))
    .join("");

  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: voucher.customerEmail,
      reply_to: env.BOOKING_SALES_EMAIL,
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "Resend voucher email failed");
  }
}
