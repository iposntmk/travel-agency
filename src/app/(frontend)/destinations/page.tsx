import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { DestinationCard } from "@/components/destination-card";
import { EmptyState, PageHero } from "@/components/section";
import { getDestinations } from "@/lib/cms";
import { hasSearchParams, type SearchParamValue } from "../tours/query";

export const revalidate = 300;

interface DestinationsPageProps {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}

export async function generateMetadata({ searchParams }: DestinationsPageProps): Promise<Metadata> {
  const params = (await searchParams) ?? {};
  const hasParams = hasSearchParams(params);

  return {
    title: "Destinations",
    description: "Hội An, Huế, Đà Nẵng and more — Central Vietnam destinations covered by TC Travel Vietnam.",
    alternates: { canonical: "/destinations" },
    robots: hasParams ? { index: false, follow: true } : undefined
  };
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <main>
      <PageHero
        eyebrow="Plan your route"
        title="Destinations"
        subtitle="From imperial Huế to lantern-lit Hội An and coastal Đà Nẵng — every region with a guide who lives there."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations" }
            ]}
          />
        </div>
      </PageHero>

      <section className="bg-mist py-12 md:py-16">
        <div className="mx-auto max-w-page px-4">
          {destinations.length === 0 ? (
            <EmptyState>No destinations published yet.</EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
