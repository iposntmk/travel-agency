import { describe, expect, it } from "vitest";
import { customInquirySchema } from "@/schemas/custom-inquiry";

const validInput = {
  name: "Jane Doe",
  email: "jane@example.test",
  phone: "+84901234567",
  adults: 2,
  children: 1,
  exactDatesKnown: false,
  departureMonth: "March 2027",
  estimatedDays: 10,
  selectedDestinations: ["hoi-an", "hue"],
  accommodationLevels: ["Comfort"],
  themes: ["Food", "Culture"],
  budgetPerPerson: 900,
  maxBudget: 3000,
  message: "We prefer a calm route.",
  idempotencyKey: "custom-inquiry-key-123"
};

describe("custom inquiry schema", () => {
  it("accepts a valid tailor-made trip request", () => {
    const parsed = customInquirySchema.safeParse(validInput);
    expect(parsed.success).toBe(true);
  });

  it("requires at least one selected destination", () => {
    const parsed = customInquirySchema.safeParse({ ...validInput, selectedDestinations: [] });
    expect(parsed.success).toBe(false);
  });

  it("validates participant and budget bounds", () => {
    const parsed = customInquirySchema.safeParse({ ...validInput, adults: 0, budgetPerPerson: -1 });
    expect(parsed.success).toBe(false);
  });

  it("requires exact dates when the traveler says they know them", () => {
    const parsed = customInquirySchema.safeParse({
      ...validInput,
      exactDatesKnown: true,
      departureDate: "",
      returnDate: ""
    });
    expect(parsed.success).toBe(false);
  });
});
