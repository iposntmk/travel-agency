"use server";

import { headers } from "next/headers";
import { bookingSubmitSchema, type BookingSubmitInput } from "@/schemas/booking";
import { sanitizeOptionalPlainText } from "@/lib/sanitize";
import { createInitialStatusHistory } from "@/services/booking-transitions";
import { createBookingOnce } from "@/services/booking-repository";
import { sendBookingInquiryEmails } from "@/services/booking-emails";
import { checkRateLimit } from "@/services/rate-limit";
import type { BookingRecord } from "@/types/domain";

type ActionErrorType = "validation" | "business" | "rate-limit" | "system";

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        type: ActionErrorType;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

export async function submitBooking(
  input: BookingSubmitInput,
  rateLimitKey?: string
): Promise<ActionResult<{ booking: BookingRecord; duplicate: boolean }>> {
  const parsed = bookingSubmitSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        type: "validation",
        message: "Please check the booking details.",
        fieldErrors: parsed.error.flatten().fieldErrors
      }
    };
  }

  if (!(await checkRateLimit(await bookingRateLimitKey(parsed.data, rateLimitKey)))) {
    return {
      ok: false,
      error: {
        type: "rate-limit",
        message: "Too many booking attempts. Please try again shortly."
      }
    };
  }

  try {
    const now = new Date().toISOString();
    const booking: BookingRecord = {
      id: crypto.randomUUID(),
      customerName: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      tourSlug: parsed.data.tourSlug,
      numPax: parsed.data.numPax,
      preferredDate: parsed.data.preferredDate,
      contactChannel: parsed.data.contactChannel,
      specialRequest: sanitizeOptionalPlainText(parsed.data.specialRequest),
      source: parsed.data.source,
      status: "Pending",
      idempotencyKey: parsed.data.idempotencyKey,
      statusHistory: createInitialStatusHistory("public"),
      createdAt: now,
      updatedAt: now
    };

    const result = await createBookingOnce(booking);
    if (!result.duplicate) {
      await sendBookingInquiryEmails(result.booking).catch(() => undefined);
    }

    return { ok: true, data: result };
  } catch {
    return {
      ok: false,
      error: {
        type: "system",
        message: "Booking could not be submitted. Please contact our team directly."
      }
    };
  }
}

async function bookingRateLimitKey(input: BookingSubmitInput, explicitKey?: string): Promise<string> {
  const requester = explicitKey ?? (await requestIp()) ?? "anonymous";
  return `${requester}:${input.email}`;
}

async function requestIp(): Promise<string | undefined> {
  try {
    const requestHeaders = await headers();
    return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || undefined;
  } catch {
    return undefined;
  }
}
