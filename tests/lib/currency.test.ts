import { describe, expect, it } from "vitest";
import {
  convertFromBase,
  defaultCurrency,
  findCurrency,
  formatPrice,
  type CurrencyOption
} from "@/lib/currency";

const USD: CurrencyOption = {
  code: "USD",
  name: "US Dollar",
  symbol: "$",
  rateToBase: 1,
  decimals: 2,
  symbolPosition: "before",
  isDefault: true
};

const GBP: CurrencyOption = {
  code: "GBP",
  name: "British Pound",
  symbol: "£",
  rateToBase: 0.79,
  decimals: 2,
  symbolPosition: "before",
  isDefault: false
};

const VND: CurrencyOption = {
  code: "VND",
  name: "Vietnamese Dong",
  symbol: "₫",
  rateToBase: 25000,
  decimals: 0,
  symbolPosition: "after",
  isDefault: false
};

describe("convertFromBase", () => {
  it("multiplies the base amount by the rate", () => {
    expect(convertFromBase(1000, USD)).toBe(1000);
    expect(convertFromBase(1000, GBP)).toBe(790);
    expect(convertFromBase(2, VND)).toBe(50000);
  });
});

describe("formatPrice", () => {
  it("places the symbol before with thousands separators", () => {
    expect(formatPrice(15000, USD)).toBe("$15,000.00");
    expect(formatPrice(15000, GBP, { round: true })).toBe("£11,850");
  });

  it("places the symbol after for trailing-symbol currencies", () => {
    const formatted = formatPrice(2, VND);
    expect(formatted.startsWith("50,000")).toBe(true);
    expect(formatted.endsWith("₫")).toBe(true);
  });

  it("rounds to whole numbers when asked (from-price feel)", () => {
    // 1499 * 0.79 = 1184.21 -> rounded
    expect(formatPrice(1499, GBP, { round: true })).toBe("£1,184");
  });

  it("shows currency decimals by default", () => {
    expect(formatPrice(1499, GBP)).toBe("£1,184.21");
    expect(formatPrice(100, USD)).toBe("$100.00");
  });

  it("uses currency decimals of zero without fractional digits", () => {
    const formatted = formatPrice(1.5, VND);
    expect(formatted.startsWith("37,500")).toBe(true);
    expect(formatted.endsWith("₫")).toBe(true);
  });
});

describe("defaultCurrency", () => {
  it("returns the flagged default", () => {
    expect(defaultCurrency([GBP, USD, VND])).toBe(USD);
  });

  it("falls back to the first when none flagged", () => {
    expect(defaultCurrency([GBP, VND])).toBe(GBP);
  });

  it("returns null for an empty list", () => {
    expect(defaultCurrency([])).toBeNull();
  });
});

describe("findCurrency", () => {
  const list = [USD, GBP, VND];

  it("finds by code", () => {
    expect(findCurrency(list, "GBP")).toBe(GBP);
  });

  it("falls back to the default for unknown or missing codes", () => {
    expect(findCurrency(list, "ZZZ")).toBe(USD);
    expect(findCurrency(list, null)).toBe(USD);
  });
});
