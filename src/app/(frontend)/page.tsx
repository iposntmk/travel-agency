import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import {
  BestCruises,
  Destinations,
  Testimonials,
  WhoWeAre,
  WhyChooseUs
} from "@/components/home/izitour/content-sections";
import { BlogSection, TourCards } from "@/components/home/izitour/card-sections";
import { IzitourHeroSlider } from "@/components/home/izitour/hero-slider";
import { IzitourSearchForm } from "@/components/home/izitour/search-form";
import {
  heroCopy,
  toBlogItems,
  toCruiseItems,
  toDestinationItems,
  toHeroSlides,
  toReviewItems,
  toSearchStarts,
  toTourCards,
  toWhyItems
} from "@/components/home/izitour/adapters";
import { getSiteUrl } from "@/config/env";
import { getDestinations, getFeaturedReviews, getPublishedPosts, getSiteSettings } from "@/lib/cms";
import { getCruisesForList } from "@/lib/cms-cruises";
import { getToursForList } from "@/lib/cms-list";
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
  const [featuredTours, cruises, destinations, reviews, posts, siteSettings] = await Promise.all([
    getToursForList({ featuredOnly: true, limit: 6 }).then((tours) =>
      tours.length > 0 ? tours : getToursForList({ limit: 6 })
    ),
    getCruisesForList({ featuredOnly: true, limit: 4 }).then((items) =>
      items.length > 0 ? items : getCruisesForList({ limit: 4 })
    ),
    getDestinations(9),
    getFeaturedReviews(3),
    getPublishedPosts(6),
    getSiteSettings()
  ]);

  const hp = siteSettings?.homepage;
  const copy = heroCopy(siteSettings);
  const tourCards = toTourCards(featuredTours);
  const destinationItems = toDestinationItems(destinations);
  const blogItems = toBlogItems(posts);
  const cruiseItems = toCruiseItems(cruises);

  return (
    <main className="bg-white">
      <JsonLd data={[organizationJsonLd(siteUrl), webSiteJsonLd(siteUrl)]} />

      {hp?.hero?.enabled !== false ? (
        <IzitourHeroSlider slides={toHeroSlides(destinations, featuredTours)} title={copy.title} subtitle={copy.subtitle} />
      ) : null}

      {hp?.search?.enabled !== false ? (
        <IzitourSearchForm starts={toSearchStarts(destinations)} />
      ) : null}

      <WhoWeAre
        title={text(hp?.hero?.body, "A Vietnam travel agency built around local knowledge.")}
        body={text(
          hp?.search?.subtitle,
          "TC Travel Vietnam designs private tours, small-group experiences, car transfers, cruises, and custom proposals with direct support from local specialists."
        )}
      />

      {hp?.whyUs?.enabled !== false ? <WhyChooseUs items={toWhyItems(siteSettings)} /> : null}

      {hp?.featuredTours?.enabled !== false && tourCards.length > 0 ? <TourCards items={tourCards} /> : null}

      {hp?.testimonials?.enabled !== false ? (
        <Testimonials
          reviews={toReviewItems(reviews)}
          summary={siteSettings?.trust?.summary ?? `${siteSettings?.trust?.reviewAverage ?? 4.9}/5 from ${siteSettings?.trust?.reviewCount ?? 120}+ traveller reviews.`}
        />
      ) : null}

      {hp?.cruises?.enabled !== false && cruiseItems.length > 0 ? <BestCruises items={cruiseItems} /> : null}

      {hp?.destinations?.enabled !== false && destinationItems.length > 0 ? <Destinations items={destinationItems} /> : null}

      {hp?.blog?.enabled !== false && blogItems.length > 0 ? <BlogSection items={blogItems} /> : null}
    </main>
  );
}
