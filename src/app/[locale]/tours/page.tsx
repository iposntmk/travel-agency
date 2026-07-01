import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero } from "@/components/section";
import { getSiteUrl } from "@/config/env";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
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

export async function generateMetadata({ params, searchParams }: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const hasFilters = hasSearchParams(sp);

  return {
    title: "Tours",
    description: "Browse paid and free tours in Hội An, Huế, and Đà Nẵng. Filter by destination, type, season, and price.",
    alternates: { canonical: localizedUrl(getSiteUrl(), locale, "/tours"), languages: buildAlternates(getSiteUrl(), "/tours") },
    robots: hasFilters ? { index: false, follow: true } : undefined
  };
}

interface ToursPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    q?: SearchParamValue;
    destination?: SearchParamValue;
    category?: SearchParamValue;
    type?: SearchParamValue;
    season?: SearchParamValue;
    operation?: SearchParamValue;
    priceMax?: SearchParamValue;
    duration?: SearchParamValue;
    durationMin?: SearchParamValue;
    groupSize?: SearchParamValue;
    rating?: SearchParamValue;
    sort?: SearchParamValue;
  }>;
}

export default async function ToursPage({ params, searchParams }: ToursPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = (await searchParams) ?? {};
  const query: ToursPageQuery = {
    q: readParam(sp.q),
    destination: readParam(sp.destination),
    category: readParam(sp.category),
    type: readParam(sp.type),
    season: readParam(sp.season),
    operation: readParam(sp.operation),
    priceMax: readPriceMax(sp.priceMax),
    duration: readPositiveNumber(sp.duration),
    durationMin: readPositiveNumber(sp.durationMin),
    groupSize: readPositiveNumber(sp.groupSize),
    rating: readPositiveNumber(sp.rating),
    sort: readParam(sp.sort)
  };
  const [destinations, t] = await Promise.all([
    getDestinations(undefined, locale),
    getTranslations()
  ]);

  return (
    <main>
      <PageHero
        eyebrow={t("tours.heroEyebrow")}
        title={t("tours.heroTitle")}
        subtitle={t("tours.heroSubtitle")}
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: t("common.home"), href: "/" },
              { label: t("tours.heroTitle") }
            ]}
          />
        </div>
      </PageHero>

      <section className="bg-white py-10 md:py-14">
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
