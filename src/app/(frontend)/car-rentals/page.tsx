import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { CarRentalCard } from "@/components/car-rental-card";
import { MobileScrollRow } from "@/components/mobile-scroll-row";
import { PageHero } from "@/components/section";
import { getCarRentalsForList, getDestinations } from "@/lib/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Car Rentals",
  description: "Private car transfers and day rentals across Central Vietnam.",
  alternates: { canonical: "/car-rentals" }
};

interface PageProps {
  searchParams?: Promise<{ destination?: string; vehicle?: string; route?: string }>;
}

export default async function CarRentalsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const [rentals, destinations] = await Promise.all([
    getCarRentalsForList({
      destinationSlug: params.destination,
      vehicleType: params.vehicle,
      route: params.route,
      limit: 48
    }),
    getDestinations(12)
  ]);

  return (
    <main>
      <PageHero
        eyebrow="Private transfers"
        title="Car Rentals"
        subtitle="Point-to-point transfers, airport pickups, and private day cars with trusted local partners."
      >
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Car Rentals" }
            ]}
          />
        </div>
      </PageHero>
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-page px-4">
          <MobileScrollRow className="mb-6 gap-2 pb-2">
            <Link className="shrink-0 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white" href="/car-rentals">
              All routes
            </Link>
            {destinations.map((destination) => (
              <Link
                key={destination.id}
                className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                href={`/car-rentals?destination=${destination.slug}`}
              >
                {destination.title}
              </Link>
            ))}
          </MobileScrollRow>
          {rentals.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No car rentals match these filters.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rentals.map((rental) => (
                <CarRentalCard key={rental.id} rental={rental} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
