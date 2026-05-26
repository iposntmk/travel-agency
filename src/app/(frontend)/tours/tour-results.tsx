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
    destinationSlug: query.destination,
    tourType: query.type,
    season: query.season,
    operationType: query.operation,
    priceMax: query.priceMax,
    limit: 48
  });

  return (
    <section className="mt-6">
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
        <div className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          No tours match these filters.{" "}
          <Link className="text-brand-blue underline" href="/tours">
            Clear filters
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </section>
  );
}
