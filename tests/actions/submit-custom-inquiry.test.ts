import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitCustomInquiry } from "@/app/actions/submit-custom-inquiry";
import { sendCustomInquiryEmails } from "@/services/custom-inquiry-emails";
import { createCustomInquiryOnce, type CustomInquiryRecord } from "@/services/custom-inquiry-repository";
import { resetRateLimit } from "@/services/rate-limit";

vi.mock("@/services/custom-inquiry-repository", () => ({
  createCustomInquiryOnce: vi.fn()
}));

vi.mock("@/services/custom-inquiry-emails", () => ({
  sendCustomInquiryEmails: vi.fn()
}));

const mockedCreateCustomInquiryOnce = vi.mocked(createCustomInquiryOnce);
const mockedSendCustomInquiryEmails = vi.mocked(sendCustomInquiryEmails);

const validInput = {
  name: "Jane Doe",
  email: "jane@example.test",
  phone: "+84901234567",
  adults: 2,
  children: 0,
  exactDatesKnown: false,
  departureMonth: "April 2027",
  estimatedDays: 8,
  selectedDestinations: ["hoi-an"],
  accommodationLevels: ["Comfort"],
  themes: ["Food"],
  whatsappOptIn: true,
  source: "free-proposal",
  idempotencyKey: "custom-inquiry-key-123"
};

describe("submitCustomInquiry action", () => {
  beforeEach(() => {
    resetRateLimit();
    mockedCreateCustomInquiryOnce.mockReset();
    mockedSendCustomInquiryEmails.mockReset();
    mockedCreateCustomInquiryOnce.mockImplementation(async (input) => ({
      inquiry: inquiryRecord(input.idempotencyKey),
      duplicate: false
    }));
    mockedSendCustomInquiryEmails.mockResolvedValue(undefined);
  });

  it("creates a new custom inquiry for valid input", async () => {
    const result = await submitCustomInquiry(validInput, "custom-user");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.inquiry.status).toBe("new");
      expect(result.data.duplicate).toBe(false);
    }
    expect(mockedSendCustomInquiryEmails).toHaveBeenCalledTimes(1);
  });

  it("does not send emails for duplicate idempotency keys", async () => {
    mockedCreateCustomInquiryOnce
      .mockResolvedValueOnce({ inquiry: inquiryRecord("custom-inquiry-key-123"), duplicate: false })
      .mockResolvedValueOnce({ inquiry: inquiryRecord("custom-inquiry-key-123"), duplicate: true });

    await submitCustomInquiry(validInput, "duplicate-custom-user");
    const second = await submitCustomInquiry(validInput, "duplicate-custom-user");

    expect(second.ok).toBe(true);
    if (second.ok) expect(second.data.duplicate).toBe(true);
    expect(mockedSendCustomInquiryEmails).toHaveBeenCalledTimes(1);
  });

  it("returns validation errors for bad input", async () => {
    const result = await submitCustomInquiry({ ...validInput, selectedDestinations: [] }, "custom-user");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe("validation");
  });

  it("rate limits repeated submits", async () => {
    for (let index = 0; index < 5; index += 1) {
      await submitCustomInquiry({ ...validInput, idempotencyKey: `custom-key-${index}` }, "limited-custom-user");
    }

    const blocked = await submitCustomInquiry(
      { ...validInput, idempotencyKey: "custom-key-blocked" },
      "limited-custom-user"
    );

    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.type).toBe("rate-limit");
  });
});

function inquiryRecord(idempotencyKey: string): CustomInquiryRecord {
  return {
    id: "inquiry-1",
    customerName: validInput.name,
    email: validInput.email,
    selectedDestinations: validInput.selectedDestinations,
    status: "new",
    idempotencyKey
  };
}
