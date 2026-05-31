import type { Metadata } from "next";
import { HomeHero } from "@/components/home/home-hero";
import { HomeTeam } from "@/components/home/home-team";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import { SeasonalBanner } from "@/components/home/seasonal-banner";
import { Testimonials } from "@/components/home/testimonials";
import { WhyTcTravel } from "@/components/home/why-tc-travel";
import { DestinationCard } from "@/components/destination-card";
import { JsonLd } from "@/components/json-ld";
import { MobileScrollRow } from "@/components/mobile-scroll-row";
import { OtaWidget } from "@/components/ota-widget";
import { EmptyState, SectionBand, SectionHead } from "@/components/section";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { getDestinations, getFeaturedReviews, getSiteSettings, getTeamMembers } from "@/lib/cms";
import { getToursForList } from "@/lib/cms-list";
import { resolveOtaWidgets } from "@/lib/ota-providers";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data";

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" }
};

export default async function HomePage() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const [featuredTours, freeTours, destinations, reviews, siteSettings, team] = await Promise.all([
    getToursForList({ featuredOnly: true, limit: 3 }).then((tours) =>
      tours.length > 0 ? tours : getToursForList({ limit: 3 })
    ),
    getToursForList({ freeOnly: true, limit: 3 }),
    getDestinations(6),
    getFeaturedReviews(3),
    getSiteSettings(),
    getTeamMembers(4)
  ]);

  const hp = siteSettings?.homepage;
  const whyUsItems = (hp?.whyUs?.items ?? [])
    .filter((item) => Boolean(item?.title && item?.body))
    .map((item) => ({ icon: item.icon ?? undefined, title: item.title as string, body: item.body as string }));

  const heroExperiences = destinations
    .slice(0, 3)
    .flatMap((destination) =>
      resolveOtaWidgets(siteSettings?.ota, "home", destination.title).map((widget) => ({
        destination,
        widget
      }))
    );

  return (
    <main>
      <JsonLd data={[organizationJsonLd(siteUrl), webSiteJsonLd(siteUrl)]} />

      {hp?.hero?.enabled !== false ? <HomeHero destinations={destinations.slice(0, 3)} /> : null}

      {hp?.seasonalBanner?.enabled !== false ? <SeasonalBanner /> : null}

      {hp?.featuredTours?.enabled !== false ? (
        <SectionBand>
          <SectionHead
            eyebrow={text(hp?.featuredTours?.eyebrow, "Hand-picked")}
            title={text(hp?.featuredTours?.title, "Featured Tours")}
            subtitle={text(
              hp?.featuredTours?.subtitle,
              "Curated departures for the current season — private guides, small groups, and free walking tours."
            )}
            actionHref={text(hp?.featuredTours?.actionHref, "/tours")}
            actionLabel={text(hp?.featuredTours?.actionLabel, "View all tours")}
          />
          {featuredTours.length === 0 ? (
            <EmptyState>No tours published yet. Check back soon.</EmptyState>
          ) : (
            <MobileScrollRow className="gap-5 pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
              {featuredTours.map((tour) => (
                <div key={tour.id} className="w-[82vw] shrink-0 sm:w-auto">
                  <TourCard tour={tour} />
                </div>
              ))}
            </MobileScrollRow>
          )}
        </SectionBand>
      ) : null}

      {destinations.length > 0 && hp?.destinations?.enabled !== false ? (
        <SectionBand tone="soft">
          <SectionHead
            eyebrow={text(hp?.destinations?.eyebrow, "Where to go")}
            title={text(hp?.destinations?.title, "Popular Destinations")}
            subtitle={text(
              hp?.destinations?.subtitle,
              "Central Vietnam and beyond — explore tours, car transfers, guides, and things to do in each city hub."
            )}
            actionHref={text(hp?.destinations?.actionHref, "/destinations")}
            actionLabel={text(hp?.destinations?.actionLabel, "All destinations")}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </SectionBand>
      ) : null}

      {freeTours.length > 0 && hp?.freeTours?.sectionEnabled !== false ? (
        <SectionBand>
          <SectionHead
            eyebrow={text(hp?.freeTours?.eyebrow, "Lead with experience")}
            title={text(hp?.freeTours?.title, "Join Our Free Tours")}
            subtitle={text(
              hp?.freeTours?.subtitle,
              "Free walking and cycling tours in Central Vietnam. Tips appreciated — registration uses the same Book Now · Pay Later inquiry flow."
            )}
            actionHref={text(hp?.freeTours?.actionHref, "/free-tours")}
            actionLabel={text(hp?.freeTours?.actionLabel, "See free tours")}
          />
          <MobileScrollRow className="gap-5 pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {freeTours.map((tour) => (
              <div key={tour.id} className="w-[82vw] shrink-0 sm:w-auto">
                <TourCard
                  tour={tour}
                  ctaLabel="Register"
                  ctaHref={`/booking/${tour.slug}?source=free-tour-upsell`}
                />
              </div>
            ))}
          </MobileScrollRow>
        </SectionBand>
      ) : null}

      {heroExperiences.length > 0 && hp?.featuredExperiences?.enabled !== false ? (
        <SectionBand tone="soft">
          <SectionHead
            eyebrow={text(hp?.featuredExperiences?.eyebrow, "External partners")}
            title={text(hp?.featuredExperiences?.title, "Featured Experiences")}
            subtitle={text(
              hp?.featuredExperiences?.subtitle,
              "Day tours, tickets, and activities curated by trusted travel partners — booked externally, not through TC Travel."
            )}
          />
          <MobileScrollRow className="gap-5 pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {heroExperiences.map(({ destination, widget }) => (
              <div key={`${destination.id}-${widget.key}`} className="w-[82vw] shrink-0 sm:w-auto">
                <OtaWidget widget={widget} city={destination.title} source="/" />
              </div>
            ))}
          </MobileScrollRow>
        </SectionBand>
      ) : null}

      {hp?.testimonials?.enabled !== false ? (
        <Testimonials reviews={reviews} trust={siteSettings?.trust} />
      ) : null}

      {hp?.team?.enabled !== false ? <HomeTeam members={team} /> : null}

      {hp?.whyUs?.enabled !== false ? (
        <WhyTcTravel
          eyebrow={hp?.whyUs?.eyebrow ?? undefined}
          title={hp?.whyUs?.title ?? undefined}
          subtitle={hp?.whyUs?.subtitle ?? undefined}
          items={whyUsItems.length > 0 ? whyUsItems : undefined}
        />
      ) : null}

      {hp?.newsletter?.enabled !== false ? <NewsletterSignup /> : null}
    </main>
  );
}
