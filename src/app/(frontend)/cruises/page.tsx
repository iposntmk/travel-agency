import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { CruiseCard } from "@/components/cruise-card";
import { JsonLd } from "@/components/json-ld";
import { EmptyState, PageHero } from "@/components/section";
import { getSiteUrl } from "@/config/env";
import { getCruisesForList } from "@/lib/cms-cruises";
import { absoluteUrl, breadcrumbJsonLd, itemListJsonLd } from "@/lib/structured-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cruises",
  description: "Overnight bay and river cruises in Vietnam — cabins, meals, and onboard activities with Book Now · Pay Later.",
  alternates: { canonical: "/cruises" }
};

export default async function CruisesPage() {
  const cruises = await getCruisesForList({ limit: 48 });
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Cruises", url: absoluteUrl(siteUrl, "/cruises") }
          ]),
          itemListJsonLd(cruises.map((cruise) => ({ name: cruise.title, url: absoluteUrl(siteUrl, `/cruises/${cruise.slug}`) })))
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
