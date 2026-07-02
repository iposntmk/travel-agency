import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Tour, Destination } from "@/payload-types";
import { resolveImage } from "@/lib/media";
import { DealPrice } from "@/components/deal-price";
import { ProductBadges } from "@/components/product-badges";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductMeta } from "@/components/product-meta";

interface TourCardProps {
  tour: Tour;
  ctaHref?: string;
  ctaLabel?: string;
}

export async function TourCard({ tour, ctaHref, ctaLabel }: TourCardProps) {
  const t = await getTranslations("card");
  const image = resolveImage(tour.featuredImage, tour.title, { variant: "card" });
  const destination =
    tour.destination && typeof tour.destination === "object"
      ? (tour.destination as Destination).title
      : null;
  const isFree = !tour.priceFrom || tour.priceFrom === 0;

  const href = ctaHref ?? `/tours/${tour.slug}`;
  const label = ctaLabel ?? (isFree ? t("register") : t("viewDetails"));
  const details = tour as Tour & {
    durationText?: string;
    routeSummary?: string;
    ratingAverage?: number;
    ratingCount?: number;
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-elevated">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-navy-50">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/30 via-navy-950/0 to-navy-950/0" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {destination ? (
            <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-900 shadow-card backdrop-blur">
              {destination}
            </span>
          ) : null}
          <ProductBadges
            isFeatured={tour.isFeatured}
            isBestSeller={tour.isBestSeller}
            createdAt={tour.createdAt}
            priceFrom={tour.priceFrom}
            originalPrice={tour.deal?.originalPrice}
            dealEndsAt={tour.deal?.dealEndsAt}
          />
        </div>
      </Link>
      <WishlistButton type="tour" slug={tour.slug} className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-card backdrop-blur transition hover:scale-105" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
          {tour.tourType.replace(/-/g, " ")}
          {tour.season && tour.season !== "year-round" ? ` · ${tour.season}` : ""}
        </p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-navy-950">
          <Link href={href} className="transition-colors hover:text-navy-700">
            {tour.title}
          </Link>
        </h3>
        <div className="space-y-1 text-sm leading-6 text-slate-600">
          {details.routeSummary ? <p>{details.routeSummary}</p> : null}
          <ProductMeta
            durationText={details.durationText ?? t("flexibleTiming")}
            pickupAvailable={tour.pickupAvailable}
            privateOption={tour.privateOption}
            groupSizeMax={tour.groupSizeMax}
          />
          {details.ratingAverage && details.ratingCount ? (
            <p>{`${details.ratingAverage.toFixed(1)} (${details.ratingCount})`}</p>
          ) : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-sm font-medium text-slate-600">
            {isFree ? (
              t("tipsAppreciated")
            ) : (
              <DealPrice
                priceFrom={tour.priceFrom ?? 0}
                originalPrice={tour.deal?.originalPrice}
                dealEndsAt={tour.deal?.dealEndsAt}
              />
            )}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            {label}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
