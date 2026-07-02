import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { PublicCarRental } from "@/lib/cms";
import { resolveImage } from "@/lib/media";
import { DealPrice } from "@/components/deal-price";
import { ProductBadges } from "@/components/product-badges";
import { WishlistButton } from "@/components/wishlist-button";

interface Props {
  rental: PublicCarRental;
}

export async function CarRentalCard({ rental }: Props) {
  const t = await getTranslations("card");
  const image = resolveImage(rental.featuredImage as Parameters<typeof resolveImage>[0], rental.title, { variant: "card" });
  const route = [rental.routeFrom, rental.routeTo].filter(Boolean).join(` ${t("routeJoin")} `);

  return (
    <article className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
      <Link href={`/car-rentals/${rental.slug}`} className="relative block aspect-[4/3] bg-slate-100">
        <Image src={image.url} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        <ProductBadges
          isBestSeller={rental.isBestSeller}
          createdAt={rental.createdAt}
          priceFrom={rental.priceFrom}
          originalPrice={rental.deal?.originalPrice}
          dealEndsAt={rental.deal?.dealEndsAt}
          className="absolute left-3 top-3 flex flex-wrap gap-1.5"
        />
      </Link>
      <WishlistButton type="car-rental" slug={rental.slug} className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-card backdrop-blur transition hover:scale-105" />
      <div className="space-y-3 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green">
          {rental.vehicleType?.replace(/-/g, " ") ?? t("privateCar")}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          <Link href={`/car-rentals/${rental.slug}`}>{rental.title}</Link>
        </h3>
        <p className="text-sm leading-6 text-slate-600">{route || t("flexiblePrivateTransfer")}</p>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-sm font-semibold text-slate-900">
            {rental.priceFrom ? (
              <DealPrice
                priceFrom={rental.priceFrom}
                originalPrice={rental.deal?.originalPrice}
                dealEndsAt={rental.deal?.dealEndsAt}
              />
            ) : (
              t("quoteOnRequest")
            )}
          </span>
          <Link
            href={`/car-rentals/${rental.slug}`}
            className="rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white"
          >
            {t("details")}
          </Link>
        </div>
      </div>
    </article>
  );
}
