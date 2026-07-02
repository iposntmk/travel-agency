import { getTranslations } from "next-intl/server";
import { getActivePublicPromotions } from "@/lib/cms-promotions";
import { PromoCountdown } from "@/components/promo-countdown";

interface PromoBannerProps {
  locale: string;
}

/**
 * Site-wide sale banner fed by the first active public promotion. Server
 * component (ISR-cached); the client countdown hides itself after expiry to
 * cover cache staleness. Renders nothing when no promotion is active.
 */
export async function PromoBanner({ locale }: PromoBannerProps) {
  const promotions = await getActivePublicPromotions(locale);
  const promo = promotions[0];
  if (!promo) return null;

  const t = await getTranslations("promo");
  const discountLabel =
    promo.discountType === "percentage" ? `-${promo.discountValue}%` : undefined;

  return (
    <div className="bg-navy-950 px-4 py-2 text-center text-sm font-medium text-white">
      <span>
        {promo.bannerText ?? promo.name}
        {discountLabel ? ` · ${discountLabel}` : ""}
      </span>{" "}
      <span className="font-bold text-amber-300">{promo.code}</span>
      {promo.showCountdown ? (
        <>
          {" · "}
          <span className="text-white/80">{t("endsIn")}</span>{" "}
          <PromoCountdown endsAt={promo.endDate} className="font-mono font-semibold tabular-nums" />
        </>
      ) : null}
    </div>
  );
}
