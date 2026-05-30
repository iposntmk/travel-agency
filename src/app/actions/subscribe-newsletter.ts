"use server";

import { newsletterSubscribeSchema, type NewsletterSubscribeInput } from "@/schemas/newsletter";
import { NewsletterNotConfiguredError, subscribeToNewsletter } from "@/services/newsletter";
import { checkRateLimit } from "@/services/rate-limit";
import { requestIp } from "./request-ip";
import type { ActionResult } from "./submit-booking";

export async function subscribeNewsletter(
  input: NewsletterSubscribeInput,
  rateLimitKey?: string
): Promise<ActionResult<{ subscribed: true }>> {
  const parsed = newsletterSubscribeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        type: "validation",
        message: "Please enter a valid email address.",
        fieldErrors: parsed.error.flatten().fieldErrors
      }
    };
  }

  const requester = rateLimitKey ?? (await requestIp()) ?? "anonymous";
  if (!(await checkRateLimit(`${requester}:${parsed.data.email}`, { keyPrefix: "newsletter", limit: 5, windowMs: 60_000 }))) {
    return {
      ok: false,
      error: { type: "rate-limit", message: "Too many attempts. Please try again shortly." }
    };
  }

  try {
    await subscribeToNewsletter(parsed.data);
    return { ok: true, data: { subscribed: true } };
  } catch (err) {
    if (err instanceof NewsletterNotConfiguredError) {
      return {
        ok: false,
        error: { type: "system", message: "Newsletter sign-up isn’t available just yet — please check back soon." }
      };
    }
    return {
      ok: false,
      error: { type: "system", message: "We couldn’t complete your sign-up. Please try again later." }
    };
  }
}
