// Pure currency conversion + formatting. No I/O, no React — safe to unit test
// and to import from both server and client code.
//
// Pricing model: every tour `priceFrom` (and tier price) is denominated in the
// single base currency — the one flagged `isDefault` in the Currencies
// collection. A target currency carries `rateToBase` = how many units of that
// currency equal one unit of the base. Converting is therefore a multiply.

export type SymbolPosition = "before" | "after";

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  /** Units of THIS currency per 1 unit of the base currency. Base itself = 1. */
  rateToBase: number;
  /** Fraction digits to display (0 for JPY/VND). */
  decimals: number;
  symbolPosition: SymbolPosition;
  isDefault: boolean;
}

export interface FormatPriceOptions {
  /** Round to a whole number with no fraction digits — for tidy "from" prices. */
  round?: boolean;
}

/** Convert an amount expressed in the base currency into `currency`. */
export function convertFromBase(
  baseAmount: number,
  currency: Pick<CurrencyOption, "rateToBase">
): number {
  return baseAmount * currency.rateToBase;
}

/**
 * Format a base-currency amount as a localized string in the target currency,
 * e.g. `$1,500`, `£11,850`, `1.500.000 ₫`. Thousands separators come from
 * Intl.NumberFormat; the symbol is placed per `symbolPosition`.
 */
export function formatPrice(
  baseAmount: number,
  currency: CurrencyOption,
  options: FormatPriceOptions = {}
): string {
  const converted = convertFromBase(baseAmount, currency);
  const fractionDigits = options.round ? 0 : Math.max(0, currency.decimals);
  const amount = options.round ? Math.round(converted) : converted;
  const number = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(amount);

  // Non-breaking space keeps the symbol attached to the amount on wrap.
  return currency.symbolPosition === "after"
    ? `${number} ${currency.symbol}`
    : `${currency.symbol}${number}`;
}

/** Pick the base/default currency from a list, falling back to the first. */
export function defaultCurrency(currencies: readonly CurrencyOption[]): CurrencyOption | null {
  return currencies.find((c) => c.isDefault) ?? currencies[0] ?? null;
}

/** Find a currency by code, falling back to the base currency. */
export function findCurrency(
  currencies: readonly CurrencyOption[],
  code: string | null | undefined
): CurrencyOption | null {
  if (code) {
    const match = currencies.find((c) => c.code === code);
    if (match) return match;
  }
  return defaultCurrency(currencies);
}
