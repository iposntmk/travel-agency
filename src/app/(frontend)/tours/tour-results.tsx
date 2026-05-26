import Link from "next/link";
import { TourCard } from "@/components/tour-card";
import { getTours } from "@/lib/cms";
import type { ToursPageQuery } from "./query";

export async function TourResults({ query }: { query: ToursPageQuery }) {
  const tours = await getTours({
    destinationSlug: query.destination,
    tourType: query.type,
    season: query.season,
    operationType: query.operation,
    priceMax: query.priceMax,
    limit: 48
  });

  return (
    <section className="mt-6">
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
