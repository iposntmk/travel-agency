import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { TourListingCard } from "@/components/tour-listing-card";
import { getSiteUrl } from "@/config/env";
import { getToursForList } from "@/lib/cms-list";
import { localizedUrl } from "@/lib/locale-path";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/structured-data";
import type { ToursPageQuery } from "./query";

export async function TourResults({ query }: { query: ToursPageQuery }) {
  const locale = await getLocale();
  const t = await getTranslations();
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const tours = await getToursForList({
    q: query.q,
    destinationSlug: query.destination,
    categorySlug: query.category,
    attractionSlug: query.attraction,
    tourType: query.type,
    season: query.season,
    operationType: query.operation,
    priceMax: query.priceMax,
    durationDays: query.duration,
    durationMin: query.durationMin,
    groupSize: query.groupSize,
    ratingMin: query.rating,
    sort: query.sort,
    limit: 48,
    locale
  });

  return (
    <section className="mt-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: t("common.home"), url: localizedUrl(siteUrl, locale, "/") },
            { name: t("tours.heroTitle"), url: localizedUrl(siteUrl, locale, "/tours") }
          ]),
          itemListJsonLd(tours.map((tour) => ({ name: tour.title, url: localizedUrl(siteUrl, locale, `/tours/${tour.slug}`) })))
        ]}
      />
      {tours.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-100 bg-white p-8 text-center text-sm text-slate-500">
          {t("tours.noResults")}{" "}
          <Link className="font-semibold text-navy-700 underline-offset-2 hover:underline" href="/tours">
            {t("tours.clearFilters")}
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-base font-bold text-brand-red">
              {t("tours.found", { count: tours.length })}
            </p>
          </div>
          <div className="flex flex-col gap-5">
            {tours.map((tour) => (
              <TourListingCard key={tour.id} tour={tour} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
