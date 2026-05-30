import "server-only";

import { getBookingEmailEnv, type BookingEmailEnv } from "@/config/env";
import type { CustomInquiryRecord } from "./custom-inquiry-repository";

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

export async function sendCustomInquiryEmails(
  inquiry: CustomInquiryRecord,
  options: EmailOptions = {}
): Promise<void> {
  const env = options.env ?? getBookingEmailEnv();
  const fetcher = options.fetcher ?? fetch;

  await Promise.all([
    sendResendEmail(customerEmail(inquiry, env), env, fetcher),
    sendResendEmail(internalEmail(inquiry, env), env, fetcher)
  ]);
}

async function sendResendEmail(message: EmailMessage, env: BookingEmailEnv, fetcher: typeof fetch): Promise<void> {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    throw new Error("Resend custom inquiry email failed");
  }
}

function customerEmail(inquiry: CustomInquiryRecord, env: BookingEmailEnv): EmailMessage {
  const text = [
    `Hi ${inquiry.customerName},`,
    "",
    "Thanks for starting your Vietnam travel project with us. Our team will review your ideas and reply with the next steps within 24 hours.",
    "",
    `Destinations: ${inquiry.selectedDestinations.join(", ")}`,
    "",
    "No online payment is required now. You can pay later after the itinerary and services are confirmed.",
    "",
    "TC Travel Vietnam"
  ].join("\n");

  return {
    from: env.RESEND_FROM_EMAIL,
    to: inquiry.email,
    reply_to: env.BOOKING_SALES_EMAIL,
    subject: "We received your travel project",
    text,
    html: paragraphs(text)
  };
}

function internalEmail(inquiry: CustomInquiryRecord, env: BookingEmailEnv): EmailMessage {
  const text = [
    "A new custom travel inquiry was submitted.",
    "",
    `Inquiry ID: ${inquiry.id}`,
    `Idempotency key: ${inquiry.idempotencyKey}`,
    `Customer: ${inquiry.customerName}`,
    `Email: ${inquiry.email}`,
    `Destinations: ${inquiry.selectedDestinations.join(", ")}`,
    `Status: ${inquiry.status}`
  ].join("\n");

  return {
    from: env.RESEND_FROM_EMAIL,
    to: env.BOOKING_SALES_EMAIL,
    reply_to: inquiry.email,
    subject: `New custom inquiry: ${inquiry.customerName}`,
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
