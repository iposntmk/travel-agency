import { describe, expect, it, vi } from "vitest";
import { NewsletterNotConfiguredError, subscribeToNewsletter } from "@/services/newsletter";
import type { NewsletterEnv } from "@/config/env";

const env: NewsletterEnv = { RESEND_API_KEY: "re_test", RESEND_AUDIENCE_ID: "aud_123" };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("subscribeToNewsletter", () => {
  it("throws NewsletterNotConfiguredError when no audience is set", async () => {
    await expect(
      subscribeToNewsletter({ email: "a@b.com" }, { env: { RESEND_API_KEY: "re_test" }, fetcher: vi.fn() })
    ).rejects.toBeInstanceOf(NewsletterNotConfiguredError);
  });

  it("posts the contact to the configured audience", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(201, { id: "c_1" }));
    await subscribeToNewsletter({ email: "traveller@example.com" }, { env, fetcher });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.resend.com/audiences/aud_123/contacts",
      expect.objectContaining({ method: "POST" })
    );
    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: "Bearer re_test" });
    expect(JSON.parse(init.body as string)).toMatchObject({ email: "traveller@example.com", unsubscribed: false });
  });

  it("treats an already-existing contact as success", async () => {
    const conflict = vi.fn().mockResolvedValue(jsonResponse(409, {}));
    await expect(subscribeToNewsletter({ email: "dup@example.com" }, { env, fetcher: conflict })).resolves.toBeUndefined();

    const existsMsg = vi.fn().mockResolvedValue(jsonResponse(422, { error: { message: "Contact already exists" } }));
    await expect(subscribeToNewsletter({ email: "dup@example.com" }, { env, fetcher: existsMsg })).resolves.toBeUndefined();
  });

  it("throws on a genuine Resend error", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(500, { error: { message: "Internal error" } }));
    await expect(subscribeToNewsletter({ email: "x@y.com" }, { env, fetcher })).rejects.toThrow("Internal error");
  });
});
