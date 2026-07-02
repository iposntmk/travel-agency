import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "@/lib/payload";
import type { Config, Promotion } from "@/payload-types";

const asLocale = (locale?: string): Config["locale"] | undefined => locale as Config["locale"] | undefined;

const DEFAULT_LOCALE = "en";

/**
 * Storefront-safe projection of a public promotion. Never expose markets,
 * applicable tours/trigger internals, or voucher config — the collection stays
 * staffOnly and this getter (local API bypasses access) is the only public path.
 */
export type PublicPromotion = {
  id: number | string;
  name: string;
  code: string;
  bannerText?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  showCountdown: boolean;
};

function toPublicPromotion(doc: Promotion): PublicPromotion {
  return {
    id: doc.id,
    name: doc.name,
    code: doc.code,
    bannerText: doc.bannerText ?? undefined,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    startDate: doc.startDate,
    endDate: doc.endDate,
    showCountdown: doc.showCountdown === true
  };
}

// Cache stores ALL isPublic promotions; the date window is filtered at render
// time (a `now` inside the cached query would go stale for the tag lifetime).
async function fetchPublicPromotions(locale?: string): Promise<PublicPromotion[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "promotions",
    where: { isPublic: { equals: true } },
    limit: 20,
    depth: 0,
    sort: "-endDate",
    locale: asLocale(locale),
    overrideAccess: true
  });
  return (result.docs as Promotion[]).map(toPublicPromotion);
}

const getPublicPromotionsCached = cache((locale: string) =>
  unstable_cache(() => fetchPublicPromotions(locale), ["cms", "public-promotions", locale], {
    tags: ["promotions"]
  })()
);

/** Public promotions whose date window contains `now` (evaluated per render). */
export async function getActivePublicPromotions(locale?: string): Promise<PublicPromotion[]> {
  const all = await getPublicPromotionsCached(locale ?? DEFAULT_LOCALE);
  const now = Date.now();
  return all.filter(
    (promo) => Date.parse(promo.startDate) <= now && Date.parse(promo.endDate) >= now
  );
}
