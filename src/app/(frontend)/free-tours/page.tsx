import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { EmptyState, PageHero } from "@/components/section";
import { TourCard } from "@/components/tour-card";
import { getToursForList } from "@/lib/cms-list";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Free Tours",
  description:
    "Join our free walking and cycling tours in Hội An, Huế, and Đà Nẵng. Registration uses the same Book Now - Pay Later inquiry flow.",
  alternates: { canonical: "/free-tours" }
};

export default async function FreeToursPage() {
  const freeTours = await getToursForList({ freeOnly: true, limit: 24 });

  return (
    <main>
      <PageHero
        eyebrow="Tips appreciated"
        title="Free Tours"
        subtitle="Free walking and cycling tours led by locals. Registration uses the same Book Now · Pay Later inquiry — tagged separately for sales follow-up."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Free Tours" }
            ]}
          />
        </div>
      </PageHero>

      <section className="bg-mist py-12 md:py-16">
        <div className="mx-auto max-w-page px-4">
          {freeTours.length === 0 ? (
            <EmptyState>No free tours scheduled right now. Check back soon.</EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {freeTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  ctaLabel="Register"
                  ctaHref={`/booking/${tour.slug}?source=free-tour-upsell`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
