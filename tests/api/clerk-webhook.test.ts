import { describe, expect, it, vi, beforeEach } from "vitest";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { getClerkWebhookEnv } from "@/config/env";
import { syncCustomerFromClerkUser } from "@/services/clerk-customer-sync";
import { POST } from "@/app/api/webhooks/clerk/route";

vi.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook: vi.fn()
}));

vi.mock("@/config/env", () => ({
  getClerkWebhookEnv: vi.fn()
}));

vi.mock("@/services/clerk-customer-sync", () => ({
  syncCustomerFromClerkUser: vi.fn()
}));

const mockedVerifyWebhook = vi.mocked(verifyWebhook);
const mockedGetClerkWebhookEnv = vi.mocked(getClerkWebhookEnv);
const mockedSyncCustomer = vi.mocked(syncCustomerFromClerkUser);

describe("Clerk webhook route", () => {
  beforeEach(() => {
    mockedVerifyWebhook.mockReset();
    mockedGetClerkWebhookEnv.mockReturnValue({ CLERK_WEBHOOK_SIGNING_SECRET: "whsec_test" });
    mockedSyncCustomer.mockReset();
  });

  it("verifies and syncs user created events", async () => {
    const user = clerkUserEventData();
    mockedVerifyWebhook.mockResolvedValue({ type: "user.created", data: user } as Awaited<
      ReturnType<typeof verifyWebhook>
    >);
    mockedSyncCustomer.mockResolvedValue({ status: "created", customerId: 7, email: "jane@example.test" });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mockedVerifyWebhook).toHaveBeenCalledWith(expect.any(Request), {
      signingSecret: "whsec_test"
    });
    expect(mockedSyncCustomer).toHaveBeenCalledWith(user);
    await expect(response.json()).resolves.toMatchObject({ ok: true, data: { status: "created" } });
  });

  it("ignores non-user events after verification", async () => {
    mockedVerifyWebhook.mockResolvedValue({ type: "session.created", data: {} } as Awaited<
      ReturnType<typeof verifyWebhook>
    >);

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mockedSyncCustomer).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ ok: true, ignored: true });
  });

  it("rejects invalid webhook signatures", async () => {
    mockedVerifyWebhook.mockRejectedValue(new Error("bad signature"));

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(mockedSyncCustomer).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ ok: false, error: "Invalid Clerk webhook" });
  });
});

function request(): Parameters<typeof POST>[0] {
  return new Request("https://example.test/api/webhooks/clerk", { method: "POST", body: "{}" }) as Parameters<
    typeof POST
  >[0];
}

function clerkUserEventData() {
  return {
    id: "user_123",
    first_name: "Jane",
    last_name: "Doe",
    username: null,
    primary_email_address_id: "email_123",
    email_addresses: [{ id: "email_123", email_address: "jane@example.test" }]
  };
}
