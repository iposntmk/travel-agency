import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { JsonLd } from "@/components/json-ld";
import {
  BestCruises,
  Destinations,
  Testimonials,
  WhoWeAre,
  WhyChooseUs
} from "@/components/home/content-sections";
import { BlogSection, TourCards } from "@/components/home/card-sections";
import { TcTravelHeroSlider } from "@/components/home/hero-slider";
import { TcTravelSearchForm } from "@/components/home/search-form";
import {
  heroCopy,
  toBlogItems,
  toCruiseItems,
  toDestinationItems,
  toHeroSlides,
  toReviewItems,
  toSearchConfig,
  toSearchStarts,
  toSectionCopy,
  toTourCards,
  toWhyItems
} from "@/components/home/adapters";
import { getSiteUrl } from "@/config/env";
import { getDestinations, getFeaturedReviews, getPublishedPosts, getSiteSettings } from "@/lib/cms";
import { getCruisesForList } from "@/lib/cms-cruises";
import { getToursForList } from "@/lib/cms-list";
import type { WhyChooseItem } from "@/components/home/types";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data";

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: { canonical: localizedUrl(getSiteUrl(), locale, "/"), languages: buildAlternates(getSiteUrl(), "/") }
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const [featuredTours, cruises, destinations, reviews, posts, siteSettings] = await Promise.all([
    getToursForList({ featuredOnly: true, limit: 6, locale }).then((tours) =>
      tours.length > 0 ? tours : getToursForList({ limit: 6, locale })
    ),
    getCruisesForList({ featuredOnly: true, limit: 4, locale }).then((items) =>
      items.length > 0 ? items : getCruisesForList({ limit: 4, locale })
    ),
    getDestinations(9, locale),
    getFeaturedReviews(3),
    getPublishedPosts(6, locale),
    getSiteSettings(locale)
  ]);

  const t = await getTranslations("home");
  const hp = siteSettings?.homepage;
  const copy = heroCopy(siteSettings, { title: t("heroTitle"), subtitle: t("heroSubtitle") });
  const whyFallback: WhyChooseItem[] = [
    { title: t("whyItem1Title"), body: t("whyItem1Body"), icon: "compass" },
    { title: t("whyItem2Title"), body: t("whyItem2Body"), icon: "shield" },
    { title: t("whyItem3Title"), body: t("whyItem3Body"), icon: "wallet" },
    { title: t("whyItem4Title"), body: t("whyItem4Body"), icon: "heart" }
  ];

  const sameAs = (siteSettings?.social ?? [])
    .map((s) => s?.url)
    .filter((url): url is string => typeof url === "string" && /^https?:\/\//.test(url));
  const orgJsonLd = organizationJsonLd(siteUrl, {
    logo: `${siteUrl}/logo.png`,
    sameAs,
    telephone: siteSettings?.hotline ?? null,
    email: siteSettings?.salesEmail ?? null,
    address: siteSettings?.footer?.address ?? null,
    ratingValue: siteSettings?.trust?.reviewAverage ?? null,
    ratingCount: siteSettings?.trust?.reviewCount ?? null
  });
  const tourCards = toTourCards(featuredTours);
  const destinationItems = toDestinationItems(destinations);
  const blogItems = toBlogItems(posts);
  const cruiseItems = toCruiseItems(cruises);

  return (
    <main className="bg-white">
      <JsonLd data={[orgJsonLd, webSiteJsonLd(siteUrl)]} />

      {hp?.hero?.enabled !== false ? (
        <TcTravelHeroSlider slides={toHeroSlides(destinations, featuredTours)} title={copy.title} subtitle={copy.subtitle} />
      ) : null}

      {hp?.search?.enabled !== false ? (
        <TcTravelSearchForm starts={toSearchStarts(destinations)} config={toSearchConfig(siteSettings)} />
      ) : null}

      {hp?.whoWeAre?.enabled !== false ? (
        <WhoWeAre
          heading={text(hp?.whoWeAre?.heading, t("whoWeAreHeading"))}
          title={text(hp?.whoWeAre?.title ?? hp?.hero?.body, t("whoWeAreTitle"))}
          body={text(hp?.whoWeAre?.body ?? hp?.search?.subtitle, t("whoWeAreBody"))}
          actionLabel={text(hp?.whoWeAre?.actionLabel, t("meetTeam"))}
          actionHref={text(hp?.whoWeAre?.actionHref, "/about-us")}
        />
      ) : null}

      {hp?.whyUs?.enabled !== false ? <WhyChooseUs items={toWhyItems(siteSettings, whyFallback)} copy={toSectionCopy(hp?.whyUs)} /> : null}

      {hp?.featuredTours?.enabled !== false && tourCards.length > 0 ? (
        <TourCards items={tourCards} copy={toSectionCopy(hp?.featuredTours)} tabLabel={text(hp?.featuredTours?.tabLabel, t("privateToursTab"))} />
      ) : null}

      {hp?.testimonials?.enabled !== false ? (
        <Testimonials
          reviews={toReviewItems(reviews)}
          title={text(hp?.testimonials?.title, t("testimonialsTitle"))}
          summary={
            hp?.testimonials?.subtitle ??
            siteSettings?.trust?.summary ??
            t("reviewsSummary", {
              average: siteSettings?.trust?.reviewAverage ?? 4.9,
              count: siteSettings?.trust?.reviewCount ?? 120
            })
          }
        />
      ) : null}

      {hp?.cruises?.enabled !== false && cruiseItems.length > 0 ? <BestCruises items={cruiseItems} copy={toSectionCopy(hp?.cruises)} /> : null}

      {hp?.destinations?.enabled !== false && destinationItems.length > 0 ? <Destinations items={destinationItems} copy={toSectionCopy(hp?.destinations)} /> : null}

      {hp?.blog?.enabled !== false && blogItems.length > 0 ? <BlogSection items={blogItems} copy={toSectionCopy(hp?.blog)} /> : null}
    </main>
  );
}
