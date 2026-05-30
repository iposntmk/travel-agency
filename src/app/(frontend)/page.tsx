import type { Metadata } from "next";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { SeasonalBanner } from "@/components/home/seasonal-banner";
import { Testimonials } from "@/components/home/testimonials";
import { WhyTcTravel } from "@/components/home/why-tc-travel";
import { DestinationCard } from "@/components/destination-card";
import { JsonLd } from "@/components/json-ld";
import { OtaWidget } from "@/components/ota-widget";
import { EmptyState, SectionBand, SectionHead } from "@/components/section";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { getDestinations, getFeaturedReviews, getSiteSettings } from "@/lib/cms";
import { getToursForList } from "@/lib/cms-list";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" }
};

export default async function HomePage() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const [featuredTours, freeTours, destinations, reviews, siteSettings] = await Promise.all([
    getToursForList({ featuredOnly: true, limit: 3 }).then((tours) =>
      tours.length > 0 ? tours : getToursForList({ limit: 3 })
    ),
    getToursForList({ freeOnly: true, limit: 3 }),
    getDestinations(6),
    getFeaturedReviews(3),
    getSiteSettings()
  ]);

  return (
    <main>
      <JsonLd data={[organizationJsonLd(siteUrl), webSiteJsonLd(siteUrl)]} />

      <HomeHero destinations={destinations.slice(0, 3)} />

      <SeasonalBanner />

      <SectionBand>
        <SectionHead
          eyebrow="Hand-picked"
          title="Featured Tours"
          subtitle="Curated departures for the current season — private guides, small groups, and free walking tours."
          actionHref="/tours"
          actionLabel="View all tours"
        />
        {featuredTours.length === 0 ? (
          <EmptyState>No tours published yet. Check back soon.</EmptyState>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {featuredTours.map((tour) => (
              <div key={tour.id} className="w-[82vw] shrink-0 sm:w-auto">
                <TourCard tour={tour} />
              </div>
            ))}
          </div>
        )}
      </SectionBand>

      {destinations.length > 0 ? (
        <SectionBand tone="soft">
          <SectionHead
            eyebrow="Where to go"
            title="Popular Destinations"
            subtitle="Central Vietnam and beyond — explore tours, car transfers, guides, and things to do in each city hub."
            actionHref="/destinations"
            actionLabel="All destinations"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </SectionBand>
      ) : null}

      {freeTours.length > 0 ? (
        <SectionBand>
          <SectionHead
            eyebrow="Lead with experience"
            title="Join Our Free Tours"
            subtitle="Free walking and cycling tours in Central Vietnam. Tips appreciated — registration uses the same Book Now · Pay Later inquiry flow."
            actionHref="/free-tours"
            actionLabel="See free tours"
          />
          <div className="flex gap-5 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {freeTours.map((tour) => (
              <div key={tour.id} className="w-[82vw] shrink-0 sm:w-auto">
                <TourCard
                  tour={tour}
                  ctaLabel="Register"
                  ctaHref={`/booking/${tour.slug}?source=free-tour-upsell`}
                />
              </div>
            ))}
          </div>
        </SectionBand>
      ) : null}

      {destinations.length > 0 ? (
        <SectionBand tone="soft">
          <SectionHead
            eyebrow="External partners"
            title="Featured Experiences"
            subtitle="Day tours, tickets, and activities curated by trusted travel partners — booked externally, not through TC Travel."
          />
          <div className="flex gap-5 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {destinations.slice(0, 3).map((destination) => (
              <div key={destination.id} className="w-[82vw] shrink-0 sm:w-auto">
                <OtaWidget
                  provider="getyourguide"
                  city={destination.title}
                  source="/"
                />
              </div>
            ))}
          </div>
        </SectionBand>
      ) : null}

      <Testimonials reviews={reviews} trust={siteSettings?.trust} />

      <WhyTcTravel />

      <NewsletterSignup />
    </main>
  );
}
