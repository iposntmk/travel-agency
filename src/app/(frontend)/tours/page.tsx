import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero } from "@/components/section";
import { getDestinations } from "@/lib/cms";
import {
  hasSearchParams,
  readParam,
  readPriceMax,
  readPositiveNumber,
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
    duration?: SearchParamValue;
    groupSize?: SearchParamValue;
    rating?: SearchParamValue;
    sort?: SearchParamValue;
  }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = (await searchParams) ?? {};
  const query: ToursPageQuery = {
    destination: readParam(params.destination),
    type: readParam(params.type),
    season: readParam(params.season),
    operation: readParam(params.operation),
    priceMax: readPriceMax(params.priceMax),
    duration: readPositiveNumber(params.duration),
    groupSize: readPositiveNumber(params.groupSize),
    rating: readPositiveNumber(params.rating),
    sort: readParam(params.sort)
  };
  const destinations = await getDestinations();

  return (
    <main>
      <PageHero
        eyebrow="Central Vietnam"
        title="Tours"
        subtitle="Private, small group, partner, and free tours across Central Vietnam. Curated by local guides."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Tours" }
            ]}
          />
        </div>
      </PageHero>

      <section className="bg-mist py-12 md:py-16">
        <div className="mx-auto max-w-page px-4">
          <TourFilterPanel destinations={destinations} query={query} />
          <Suspense key={resultsKey(query)} fallback={<TourResultsSkeleton />}>
            <TourResults query={query} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
