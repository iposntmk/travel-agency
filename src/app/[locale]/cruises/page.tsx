import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { CruiseCard } from "@/components/cruise-card";
import { JsonLd } from "@/components/json-ld";
import { EmptyState, PageHero } from "@/components/section";
import { getSiteUrl } from "@/config/env";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { getCruisesForList } from "@/lib/cms-cruises";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/structured-data";

export const revalidate = 300;

type SearchParamValue = string | string[] | undefined;

function readParam(value: SearchParamValue): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function readPositiveNumber(value: SearchParamValue): number | undefined {
  const raw = readParam(value);
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : undefined;
}

interface CruisesPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    destination?: SearchParamValue;
    nights?: SearchParamValue;
  }>;
}

export async function generateMetadata({ params, searchParams }: CruisesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const hasFilters = Boolean(readParam(sp.destination) || readParam(sp.nights));

  return {
    title: "Cruises",
    description: "Overnight bay and river cruises in Vietnam — cabins, meals, and onboard activities with Book Now · Pay Later.",
    alternates: { canonical: localizedUrl(getSiteUrl(), locale, "/cruises"), languages: buildAlternates(getSiteUrl(), "/cruises") },
    robots: hasFilters ? { index: false, follow: true } : undefined
  };
}

export default async function CruisesPage({ params, searchParams }: CruisesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = (await searchParams) ?? {};
  const cruises = await getCruisesForList({
    destinationSlug: readParam(sp.destination),
    nights: readPositiveNumber(sp.nights),
    limit: 48,
    locale
  });
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: localizedUrl(siteUrl, locale, "/") },
            { name: "Cruises", url: localizedUrl(siteUrl, locale, "/cruises") }
          ]),
          itemListJsonLd(cruises.map((cruise) => ({ name: cruise.title, url: localizedUrl(siteUrl, locale, `/cruises/${cruise.slug}`) })))
        ]}
      />
      <PageHero
        eyebrow="On the water"
        title="Cruises"
        subtitle="Overnight bay and river cruises with cabins, meals, and onboard activities — curated by our local team."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Cruises" }
            ]}
          />
        </div>
      </PageHero>

      <section className="bg-mist py-12 md:py-16">
        <div className="mx-auto max-w-page px-4">
          {cruises.length === 0 ? (
            <EmptyState>No cruises published yet.</EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cruises.map((cruise) => (
                <CruiseCard key={cruise.id} cruise={cruise} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
