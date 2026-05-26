import type { Metadata } from "next";
import { Suspense } from "react";
import { getDestinations } from "@/lib/cms";
import {
  hasSearchParams,
  readParam,
  readPriceMax,
  resultsKey,
  type SearchParamValue,
  type ToursPageQuery
} from "./query";
import { TourFilterPanel } from "./tour-filter-panel";
import { TourResults } from "./tour-results";
import { TourResultsSkeleton } from "./tour-results-skeleton";

export const revalidate = 300;

export async function generateMetadata({ searchParams }: ToursPageProps): Promise<Metadata> {
  const params = (await searchParams) ?? {};
  const hasFilters = hasSearchParams(params);

  return {
    title: "Tours",
    description: "Browse paid and free tours in Hội An, Huế, and Đà Nẵng. Filter by destination, type, season, and price.",
    alternates: { canonical: "/tours" },
    robots: hasFilters ? { index: false, follow: true } : undefined
  };
}

interface ToursPageProps {
  searchParams?: Promise<{
    destination?: SearchParamValue;
    type?: SearchParamValue;
    season?: SearchParamValue;
    operation?: SearchParamValue;
    priceMax?: SearchParamValue;
  }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = (await searchParams) ?? {};
  const query: ToursPageQuery = {
    destination: readParam(params.destination),
    type: readParam(params.type),
    season: readParam(params.season),
    operation: readParam(params.operation),
    priceMax: readPriceMax(params.priceMax)
  };
  const destinations = await getDestinations();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">Tours</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Private, small group, partner, and free tours across Central Vietnam.
      </p>

      <TourFilterPanel destinations={destinations} query={query} />
      <Suspense key={resultsKey(query)} fallback={<TourResultsSkeleton />}>
        <TourResults query={query} />
      </Suspense>
    </main>
  );
}
