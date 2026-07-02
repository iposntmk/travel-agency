import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { DestinationCard } from "@/components/destination-card";
import { EmptyState, PageHero } from "@/components/section";
import { getSiteUrl } from "@/config/env";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { getDestinations } from "@/lib/cms";

export const revalidate = 300;

// No searchParams: this page has no filters, and reading searchParams forces
// dynamic rendering (disables ISR). The canonical URL covers stray
// query-string variants for SEO.
interface DestinationsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DestinationsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Destinations",
    description: "Hội An, Huế, Đà Nẵng and more — Central Vietnam destinations covered by TC Travel Vietnam.",
    alternates: {
      canonical: localizedUrl(getSiteUrl(), locale, "/destinations"),
      languages: buildAlternates(getSiteUrl(), "/destinations")
    }
  };
}

export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const destinations = await getDestinations(undefined, locale);

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
