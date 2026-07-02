import { getTranslations } from "next-intl/server";
import { Price } from "@/components/currency/price";

interface DealPriceProps {
  /** Current "from" price in base currency (USD). */
  priceFrom: number;
  /** Original pre-deal price in base currency. Deal shows only when this exceeds priceFrom. */
  originalPrice?: number | null;
  /** ISO date the deal ends; when in the past the deal is suppressed. */
  dealEndsAt?: string | null;
  className?: string;
}

/**
 * Strike-through deal pricing: "From $X · Was $Y · Save $Z (-N%)".
 * Every money value flows through <Price> so it converts to the visitor's
 * currency; the percent badge is currency-independent (ratio of base amounts),
 * so it is computed once here. Renders the plain price when no valid deal.
 */
export async function DealPrice({ priceFrom, originalPrice, dealEndsAt, className }: DealPriceProps) {
  const t = await getTranslations();
  const hasDeal = isActiveDeal(priceFrom, originalPrice, dealEndsAt);

  if (!hasDeal || !originalPrice) {
    return (
      <span className={className}>
        {t("card.from")} <Price base={priceFrom} />
      </span>
    );
  }

  const saveAmount = originalPrice - priceFrom;
  const percentOff = Math.round((saveAmount / originalPrice) * 100);

  return (
    <span className={className}>
      <span>
        {t("card.from")} <Price base={priceFrom} />
      </span>{" "}
      <span className="text-slate-400 line-through">
        {t("deals.was")} <Price base={originalPrice} />
      </span>{" "}
      <span className="font-semibold text-[#C65A3A]">
        {t("deals.save")} <Price base={saveAmount} /> ({t("deals.percentOff", { percent: percentOff })})
      </span>
    </span>
  );
}

/** True when originalPrice beats priceFrom and the deal window (if any) is still open. */
export function isActiveDeal(
  priceFrom: number,
  originalPrice?: number | null,
  dealEndsAt?: string | null
): boolean {
  if (!originalPrice || originalPrice <= priceFrom) return false;
  if (dealEndsAt && Date.parse(dealEndsAt) < Date.now()) return false;
  return true;
}
