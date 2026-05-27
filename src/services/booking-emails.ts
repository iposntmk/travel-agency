import "server-only";

import { getBookingEmailEnv, type BookingEmailEnv } from "@/config/env";
import type { BookingRecord } from "@/types/domain";

type EmailMessage = {
  from: string;
  to: string;
  reply_to?: string;
  subject: string;
  text: string;
  html: string;
};

type EmailOptions = {
  env?: BookingEmailEnv;
  fetcher?: typeof fetch;
};

type ResendResponse = {
  id?: string;
  error?: {
    message?: string;
  };
};

export async function sendBookingInquiryEmails(booking: BookingRecord, options: EmailOptions = {}): Promise<void> {
  const env = options.env ?? getBookingEmailEnv();
  const fetcher = options.fetcher ?? fetch;

  await Promise.all([
    sendResendEmail(customerEmail(booking, env), env, fetcher),
    sendResendEmail(internalEmail(booking, env), env, fetcher)
  ]);
}

async function sendResendEmail(
  message: EmailMessage,
  env: BookingEmailEnv,
  fetcher: typeof fetch
): Promise<void> {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  const body = (await response.json().catch(() => ({}))) as ResendResponse;
  if (!response.ok || body.error) {
    throw new Error(body.error?.message ?? "Resend booking email failed");
  }
}

function customerEmail(booking: BookingRecord, env: BookingEmailEnv): EmailMessage {
  const subject = "We received your tour inquiry";
  const text = [
    `Hi ${booking.customerName},`,
    "",
    "Thanks for your inquiry. Our team will contact you within 24 hours to confirm availability, final pricing, and pickup details.",
    "",
    "Booking summary:",
    `Tour: ${booking.tourSlug}`,
    `Preferred date: ${booking.preferredDate}`,
    `Guests: ${booking.numPax}`,
    `Preferred contact: ${booking.contactChannel}`,
    "",
    "No online payment is required now. You can pay later after our team confirms the booking.",
    "",
    "An's Travel Agency"
  ].join("\n");

  return {
    from: env.RESEND_FROM_EMAIL,
    to: booking.email,
    reply_to: env.BOOKING_SALES_EMAIL,
    subject,
    text,
    html: paragraphs(text)
  };
}

function internalEmail(booking: BookingRecord, env: BookingEmailEnv): EmailMessage {
  const subject = `New booking inquiry: ${booking.customerName}`;
  const text = [
    "A new booking inquiry was submitted.",
    "",
    `Booking ID: ${booking.id}`,
    `Idempotency key: ${booking.idempotencyKey}`,
    `Customer: ${booking.customerName}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone}`,
    `Tour: ${booking.tourSlug}`,
    `Preferred date: ${booking.preferredDate}`,
    `Guests: ${booking.numPax}`,
    `Preferred contact: ${booking.contactChannel}`,
    `Source: ${booking.source}`,
    booking.specialRequest ? `Special request: ${booking.specialRequest}` : "Special request: none"
  ].join("\n");

  return {
    from: env.RESEND_FROM_EMAIL,
    to: env.BOOKING_SALES_EMAIL,
    reply_to: booking.email,
    subject,
    text,
    html: paragraphs(text)
  };
}

function paragraphs(text: string): string {
  return text
    .split("\n\n")
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
