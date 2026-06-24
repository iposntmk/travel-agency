import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { getToursForList } from "@/lib/cms-list";
import { absoluteUrl, breadcrumbJsonLd, itemListJsonLd } from "@/lib/structured-data";
import type { ToursPageQuery } from "./query";

export async function TourResults({ query }: { query: ToursPageQuery }) {
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
    groupSize: query.groupSize,
    ratingMin: query.rating,
    sort: query.sort,
    limit: 48
  });

  return (
    <section className="mt-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Tours", url: absoluteUrl(siteUrl, "/tours") }
          ]),
          itemListJsonLd(tours.map((tour) => ({ name: tour.title, url: absoluteUrl(siteUrl, `/tours/${tour.slug}`) })))
        ]}
      />
      {tours.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-100 bg-white p-8 text-center text-sm text-slate-500">
          No tours match these filters.{" "}
          <Link className="font-semibold text-navy-700 underline-offset-2 hover:underline" href="/tours">
            Clear filters
          </Link>
          .
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-navy-500">
            {tours.length} tour{tours.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
