import "server-only";

import { getNewsletterEnv, type NewsletterEnv } from "@/config/env";
import type { NewsletterSubscribeInput } from "@/schemas/newsletter";

/**
 * Thrown when no Resend Audience is configured. The Server Action maps this to
 * a user-facing "not available yet" message instead of a generic system error.
 */
export class NewsletterNotConfiguredError extends Error {
  constructor() {
    super("Newsletter audience is not configured");
    this.name = "NewsletterNotConfiguredError";
  }
}

type SubscribeOptions = {
  env?: NewsletterEnv;
  fetcher?: typeof fetch;
};

type ResendContactResponse = {
  id?: string;
  error?: { message?: string };
};

export async function subscribeToNewsletter(
  input: NewsletterSubscribeInput,
  options: SubscribeOptions = {}
): Promise<void> {
  const env = options.env ?? getNewsletterEnv();
  if (!env.RESEND_AUDIENCE_ID) {
    throw new NewsletterNotConfiguredError();
  }
  const fetcher = options.fetcher ?? fetch;

  const response = await fetcher(
    `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: input.email, unsubscribed: false })
    }
  );

  // Resend returns 201 for a new contact. A contact that already exists is a
  // successful re-subscribe from the visitor's perspective — don't surface it
  // as an error.
  if (response.status === 409) return;

  const body = (await response.json().catch(() => ({}))) as ResendContactResponse;
  if (!response.ok || body.error) {
    if (/already exists/i.test(body.error?.message ?? "")) return;
    throw new Error(body.error?.message ?? "Resend newsletter subscribe failed");
  }
}
