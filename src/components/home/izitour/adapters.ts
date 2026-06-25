import type { Cruise, Destination, Post, Review, SiteSetting, Tour } from "@/payload-types";
import { resolveImage } from "@/lib/media";
import type {
  CruiseFeatureItem,
  HeroSlide,
  HomeBlogItem,
  HomeDestinationItem,
  HomeReviewItem,
  HomeTourCardItem,
  SearchOption,
  WhyChooseItem
} from "./types";

export function toHeroSlides(destinations: Destination[], tours: Tour[]): HeroSlide[] {
  const sources = [
    ...destinations.map((item) => ({ id: `destination-${item.id}`, image: item.heroImage ?? item.featuredImage, alt: item.title })),
    ...tours.map((item) => ({ id: `tour-${item.id}`, image: item.featuredImage, alt: item.title }))
  ];
  return sources.slice(0, 7).map((item) => ({ id: item.id, image: toHomeImage(item.image, item.alt, "hero") }));
}

export function toSearchStarts(destinations: Destination[]): SearchOption[] {
  const list = destinations.length > 0 ? destinations : [];
  return list.map((destination) => ({ label: destination.title, value: destination.slug }));
}

export function toTourCards(tours: Tour[]): HomeTourCardItem[] {
  return tours.map((tour) => ({
    id: String(tour.id),
    title: tour.title,
    href: `/tours/${tour.slug}`,
    image: toHomeImage(tour.featuredImage, tour.title, "card"),
    duration: tour.durationText ?? "Flexible duration",
    rating: `${tour.ratingAverage?.toFixed(1) ?? "4.9"} rating`,
    reviewsCount: `${tour.ratingCount ?? 0} reviews`,
    price: tour.priceFrom ? `From ${formatCurrency(tour.priceFrom, tour.currency)}` : "Ask for price"
  }));
}

export function toDestinationItems(destinations: Destination[]): HomeDestinationItem[] {
  return destinations.map((destination) => ({
    id: String(destination.id),
    title: destination.title,
    href: `/destinations/${destination.slug}`,
    image: toHomeImage(destination.featuredImage ?? destination.heroImage, destination.title, "card")
  }));
}

export function toBlogItems(posts: Post[]): HomeBlogItem[] {
  return posts.map((post) => ({
    id: String(post.id),
    title: post.title,
    href: `/blog/${post.slug}`,
    image: toHomeImage(post.featuredImage, post.title, "card"),
    category: post.guideCategory?.replace(/-/g, " ") ?? "Travel guide",
    date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.updatedAt)),
    excerpt: post.seo?.metaDescription ?? `${post.readingTime ?? 3} min read`
  }));
}

export function toReviewItems(reviews: Review[]): HomeReviewItem[] {
  return reviews.map((review) => ({
    id: String(review.id),
    quote: review.comment ?? "Helpful local team and a smooth Vietnam trip.",
    rating: Math.max(1, Math.min(5, Math.round(review.rating))),
    author: customerName(review.customer),
    context: tourTitle(review.tour)
  }));
}

export function toCruiseItems(cruises: Cruise[]): CruiseFeatureItem[] {
  return cruises.map((cruise) => ({
    id: String(cruise.id),
    title: cruise.title,
    href: `/cruises/${cruise.slug}`,
    image: toHomeImage(cruise.featuredImage, cruise.title, "card"),
    summary: cruise.routeSummary ?? cruise.durationText ?? `${cruise.nights ?? 1} night cruise`
  }));
}

export function toWhyItems(settings: SiteSetting | null): WhyChooseItem[] {
  const items = settings?.homepage?.whyUs?.items?.filter((item) => item?.title && item?.body) ?? [];
  if (items.length > 0) {
    return items.slice(0, 4).map((item) => ({ title: item.title, body: item.body, icon: item.icon ?? undefined }));
  }
  return [
    { title: "Local Specialists", body: "Guides and trip planners based in Central Vietnam.", icon: "compass" },
    { title: "Trusted Local Operator", body: "Real WhatsApp follow-up before every departure.", icon: "shield" },
    { title: "Book Now, Pay Later", body: "Confirm details first, then pay when plans are clear.", icon: "wallet" },
    { title: "Authentic Experiences", body: "Private routes and small groups shaped around local life.", icon: "heart" }
  ];
}

export function heroCopy(settings: SiteSetting | null) {
  const hero = settings?.homepage?.hero;
  return {
    title: clean(hero?.title) ?? "Explore Vietnam With A Local Tour Operator",
    subtitle:
      clean(hero?.subtitle) ??
      clean(hero?.body) ??
      "Private tours, cruises, car transfers, and custom proposals across Vietnam. Designed by local specialists, backed by real human support."
  };
}

function toHomeImage(input: Parameters<typeof resolveImage>[0], fallbackAlt: string, variant: "card" | "hero") {
  const image = resolveImage(input, fallbackAlt, { variant });
  return { url: image.url, alt: image.alt, objectPosition: image.objectPosition };
}

function formatCurrency(value: number, currency?: string | null): string {
  return new Intl.NumberFormat("en", { style: "currency", currency: currency ?? "USD", maximumFractionDigits: 0 }).format(value);
}

function customerName(customer: Review["customer"]): string {
  if (typeof customer === "object" && customer !== null) return customer.name ?? "Verified traveller";
  return "Verified traveller";
}

function tourTitle(tour: Review["tour"]): string {
  if (typeof tour === "object" && tour !== null) return tour.title;
  return "TC Travel Vietnam";
}

function clean(value?: string | null): string | undefined {
  return value && value.trim().length > 0 ? value : undefined;
}
