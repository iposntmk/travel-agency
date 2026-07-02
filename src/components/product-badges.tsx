import { getTranslations } from "next-intl/server";
import { isActiveDeal } from "@/components/deal-price";

const NEW_WINDOW_DAYS = 30;

interface ProductBadgesProps {
  isFeatured?: boolean | null;
  isBestSeller?: boolean | null;
  createdAt?: string | null;
  priceFrom?: number | null;
  originalPrice?: number | null;
  dealEndsAt?: string | null;
  className?: string;
}

/**
 * GetYourGuide-style badges derived purely from the product doc:
 * Top pick (featured), Best seller, New (created within 30 days), Deal -N%.
 */
export async function ProductBadges({
  isFeatured,
  isBestSeller,
  createdAt,
  priceFrom,
  originalPrice,
  dealEndsAt,
  className
}: ProductBadgesProps) {
  const t = await getTranslations();
  const badges: { key: string; label: string; tone: "pick" | "seller" | "new" | "deal" }[] = [];

  if (isFeatured) badges.push({ key: "pick", label: t("badges.topPick"), tone: "pick" });
  if (isBestSeller) badges.push({ key: "seller", label: t("badges.bestSeller"), tone: "seller" });
  if (isNew(createdAt)) badges.push({ key: "new", label: t("badges.new"), tone: "new" });

  const dealPercent = dealPercentOff(priceFrom, originalPrice, dealEndsAt);
  if (dealPercent) {
    badges.push({ key: "deal", label: t("deals.percentOff", { percent: dealPercent }), tone: "deal" });
  }

  if (badges.length === 0) return null;

  return (
    <div className={className ?? "flex flex-wrap gap-1.5"}>
      {badges.map((badge) => (
        <span
          key={badge.key}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-card ${toneClass(badge.tone)}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

function isNew(createdAt?: string | null): boolean {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return false;
  return Date.now() - created < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function dealPercentOff(
  priceFrom?: number | null,
  originalPrice?: number | null,
  dealEndsAt?: string | null
): number | null {
  if (typeof priceFrom !== "number") return null;
  if (!isActiveDeal(priceFrom, originalPrice, dealEndsAt) || !originalPrice) return null;
  return Math.round(((originalPrice - priceFrom) / originalPrice) * 100);
}

function toneClass(tone: "pick" | "seller" | "new" | "deal"): string {
  switch (tone) {
    case "pick":
      return "bg-navy-900 text-white";
    case "seller":
      return "bg-amber-500 text-white";
    case "new":
      return "bg-brand-green text-white";
    case "deal":
      return "bg-[#C65A3A] text-white";
  }
}
