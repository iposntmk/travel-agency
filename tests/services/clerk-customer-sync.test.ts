import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPayloadClient } from "@/lib/payload";
import { syncCustomerFromClerkUser, type ClerkUserData } from "@/services/clerk-customer-sync";
import type { Customer } from "@/payload-types";

vi.mock("@/lib/payload", () => ({
  getPayloadClient: vi.fn()
}));

const mockedGetPayloadClient = vi.mocked(getPayloadClient);

describe("Clerk customer sync", () => {
  beforeEach(() => {
    mockedGetPayloadClient.mockReset();
  });

  it("creates a customer for a new Clerk user", async () => {
    const payload = payloadMock({
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn().mockResolvedValue(customer({ clerkUserId: "user_123" })),
      update: vi.fn()
    });
    mockedGetPayloadClient.mockResolvedValue(payload);

    const result = await syncCustomerFromClerkUser(clerkUser());

    expect(result).toMatchObject({ status: "created", customerId: 7, email: "jane@example.test" });
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "customers",
        overrideAccess: true,
        data: {
          name: "Jane Doe",
          email: "jane@example.test",
          clerkUserId: "user_123"
        }
      })
    );
  });

  it("links an existing booking customer by email", async () => {
    const payload = payloadMock({
      find: vi.fn().mockResolvedValueOnce({ docs: [] }).mockResolvedValueOnce({ docs: [customer()] }),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(customer({ clerkUserId: "user_123" }))
    });
    mockedGetPayloadClient.mockResolvedValue(payload);

    const result = await syncCustomerFromClerkUser(clerkUser());

    expect(result).toMatchObject({ status: "updated", customerId: 7 });
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "customers",
        id: 7,
        overrideAccess: true,
        data: { clerkUserId: "user_123" }
      })
    );
    expect(payload.create).not.toHaveBeenCalled();
  });

  it("does not steal an email already linked to a different Clerk user", async () => {
    const payload = payloadMock({
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [customer({ clerkUserId: "user_other" })] }),
      create: vi.fn(),
      update: vi.fn()
    });
    mockedGetPayloadClient.mockResolvedValue(payload);

    const result = await syncCustomerFromClerkUser(clerkUser());

    expect(result).toEqual({ status: "skipped", reason: "email-already-linked" });
    expect(payload.update).not.toHaveBeenCalled();
    expect(payload.create).not.toHaveBeenCalled();
  });

  it("skips Clerk users without an email address", async () => {
    const result = await syncCustomerFromClerkUser(clerkUser({ email_addresses: [] }));

    expect(result).toEqual({ status: "skipped", reason: "missing-email" });
    expect(mockedGetPayloadClient).not.toHaveBeenCalled();
  });
});

function payloadMock(overrides: {
  find: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}): Awaited<ReturnType<typeof getPayloadClient>> {
  return overrides as unknown as Awaited<ReturnType<typeof getPayloadClient>>;
}

function clerkUser(overrides: Partial<ClerkUserData> = {}): ClerkUserData {
  return {
    id: "user_123",
    first_name: "Jane",
    last_name: "Doe",
    username: null,
    primary_email_address_id: "email_123",
    email_addresses: [{ id: "email_123", email_address: "jane@example.test" }],
    ...overrides
  };
}

function customer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 7,
    name: "Jane Doe",
    email: "jane@example.test",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides
  };
}
