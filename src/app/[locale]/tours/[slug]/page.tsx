import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { OtaWidget } from "@/components/ota-widget";
import { getSiteUrl } from "@/config/env";
import { getReviewsForTour, getSiteSettings, getTourBySlug } from "@/lib/cms";
import { getToursForDestinationList, getToursForList } from "@/lib/cms-list";
import { resolveOtaWidgets } from "@/lib/ota-providers";
import { lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, faqPageJsonLd, tourProductJsonLd } from "@/lib/structured-data";
import type { Customer, Media } from "@/payload-types";
import { GOOD_TO_KNOW_DATA } from "./good-to-know-data";
import { TourBookingAside } from "./tour-booking-aside";
import { badgesFor, destinationOf } from "./tour-detail-helpers";
import { TourExtensions } from "./tour-extensions";
import { TourGallery } from "./tour-gallery";
import { TourGoodToKnow } from "./tour-good-to-know";
import { TourInclusions } from "./tour-inclusions";
import { TourItinerary } from "./tour-itinerary";
import { TourMobileBottomCta, TourStickyTabs } from "./tour-mobile-cta";
import { TourOverview } from "./tour-overview";
import { TourPricingTable } from "./tour-pricing-table";
import { TourRelated } from "./tour-related";
import { TourReviews } from "./tour-reviews";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ locale: string; slug: string }[]> {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "tours",
      where: { status: { equals: "active" } },
      limit: 100,
      depth: 0
    });
    return routing.locales.flatMap((locale) => result.docs.map((doc) => ({ locale, slug: doc.slug })));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tour = await getTourBySlug(slug, locale);
  if (!tour) return { title: "Tour not found" };

  const siteUrl = getSiteUrl();
  const description = tour.seo?.metaDescription?.trim() || lexicalToPlainText(tour.description) || `Book ${tour.title} in Vietnam.`;
  const ogImage = resolveOgImage(tour.seo?.ogImage ?? tour.featuredImage, siteUrl);
  const path = `/tours/${tour.slug}`;

  return {
    title: tour.seo?.metaTitle ? { absolute: tour.seo.metaTitle } : tour.title,
    description,
    alternates: { canonical: localizedUrl(siteUrl, locale, path), languages: buildAlternates(siteUrl, path) },
    openGraph: {
      title: tour.seo?.metaTitle ?? tour.title,
      description,
      images: [{ url: ogImage }],
      type: "website",
      siteName: "TC Travel Vietnam",
      url: localizedUrl(siteUrl, locale, path)
    }
  };
}

export default async function TourDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tour = await getTourBySlug(slug, locale);
  if (!tour) notFound();

  const destination = destinationOf(tour);
  const [sameDestinationTours, fallbackTours, reviews, siteSettings] = await Promise.all([
    destination ? getToursForDestinationList(destination.id, 4, locale) : Promise.resolve([]),
    getToursForList({ limit: 8, locale }),
    getReviewsForTour(tour.id, 5),
    getSiteSettings(locale)
  ]);
  const otaWidgets = destination
    ? resolveOtaWidgets(siteSettings?.ota, "tour", destination.title)
    : [];
  const relatedTours = [...sameDestinationTours, ...fallbackTours]
    .filter((candidate, index, list) => candidate.id !== tour.id && list.findIndex((t) => t.id === candidate.id) === index)
    .slice(0, 3);

  const heroImage = resolveImage(tour.featuredImage, tour.title, { variant: "hero" });
  const gallery: Media[] = Array.isArray(tour.gallery)
    ? (tour.gallery.filter((entry) => entry && typeof entry === "object") as Media[])
    : [];
  const isFree = !tour.priceFrom || tour.priceFrom === 0;
  const badges = badgesFor(tour);
  const description = tour.seo?.metaDescription?.trim() || lexicalToPlainText(tour.description) || `Book ${tour.title} in Vietnam.`;
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const tourUrl = absoluteUrl(siteUrl, `/tours/${tour.slug}`);

  // Map approved reviews into Schema.org Review snippets and derive an
  // aggregate rating (prefer the curated field, fall back to live reviews).
  const reviewSchema = reviews
    .filter((r) => typeof r.rating === "number")
    .map((r) => {
      const customer = r.customer && typeof r.customer === "object" ? (r.customer as Customer) : null;
      return {
        author: customer?.name ?? "Verified traveller",
        rating: r.rating,
        body: r.comment ?? undefined,
        datePublished: r.createdAt ?? undefined
      };
    });
  const ratingValue =
    tour.ratingAverage && tour.ratingAverage > 0
      ? tour.ratingAverage
      : reviewSchema.length > 0
        ? reviewSchema.reduce((sum, r) => sum + r.rating, 0) / reviewSchema.length
        : null;
  const ratingCount =
    tour.ratingCount && tour.ratingCount > 0 ? tour.ratingCount : reviewSchema.length || null;

  const tourFaqs = (tour.faqs ?? [])
    .filter((f): f is { question: string; answer: string; id?: string | null } =>
      Boolean(f?.question && f?.answer)
    )
    .map((f) => ({ title: f.question, content: f.answer }));
  const faqItems = [...tourFaqs, ...GOOD_TO_KNOW_DATA].map((f) => ({
    question: f.title,
    answer: f.content
  }));

  const galleryImages = [
    { url: heroImage.url, alt: heroImage.alt, objectPosition: heroImage.objectPosition },
    ...gallery.map((media) => {
      const img = resolveImage(media, undefined, { variant: "hero" });
      return { url: img.url, alt: img.alt, objectPosition: img.objectPosition };
    })
  ];

  const duration = tour.durationText || (tour.durationDays ? `${tour.durationDays} day${tour.durationDays > 1 ? "s" : ""}` : null);

  return (
    <main className="bg-white pb-24 lg:pb-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Tours", url: absoluteUrl(siteUrl, "/tours") },
            { name: tour.title, url: tourUrl }
          ]),
          tourProductJsonLd({
            title: tour.title,
            url: tourUrl,
            description,
            image: heroImage.isFallback ? undefined : heroImage.url,
            priceFrom: tour.priceFrom,
            currency: tour.currency,
            tourType: tour.tourType,
            ratingValue,
            ratingCount,
            reviews: reviewSchema
          }),
          faqPageJsonLd(faqItems)
        ]}
      />

      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-page px-4 py-3">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Tours", href: "/tours" },
              ...(destination ? [{ label: destination.title, href: `/destinations/${destination.slug}` }] : []),
              { label: tour.title }
            ]}
          />
        </div>
      </div>

      {/* Title + meta */}
      <div className="border-b border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-page px-4">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-navy-950 md:text-3xl">
            {tour.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {duration && (
              <span className="rounded-md border border-[#00947d] px-3 py-1 text-sm font-bold text-[#00947d]">
                {duration}
              </span>
            )}
            <a
              href="#prices"
              className="rounded-md bg-[#00947d] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#007a67] transition-colors"
            >
              View Prices
            </a>
            {badges.length > 0 && badges.map((b) => (
              <span
                key={b}
                className="rounded-md bg-brand-gold/15 px-3 py-1 text-sm font-semibold text-navy-900"
              >
                {b}
              </span>
            ))}
            {tour.ratingAverage && tour.ratingAverage > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-brand-gold">{"★".repeat(Math.round(tour.ratingAverage))}</span>
                <span className="text-xs text-slate-400">({tour.ratingCount ?? 0} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky tabs */}
      <TourStickyTabs />

      {/* Main content grid */}
      <div className="mx-auto max-w-page px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left: main content */}
          <div className="min-w-0 space-y-8">
            {/* Gallery */}
            <TourGallery images={galleryImages} title={tour.title} />

            <div className="border-t border-slate-200" />

            {/* Overview */}
            <TourOverview tour={tour} destination={destination} />

            <div className="border-t border-slate-200" />

            {/* Itinerary */}
            <div id="itinerary" className="scroll-mt-20">
              {tour.itinerary ? <TourItinerary items={tour.itinerary} /> : null}
            </div>

            <div className="border-t border-slate-200" />

            {/* Pricing */}
            <TourPricingTable tour={tour} />

            <div className="border-t border-slate-200" />

            {/* Inclusions */}
            <TourInclusions
              inclusions={(tour.inclusions ?? []).map((i) => i.item)}
              exclusions={(tour.exclusions ?? []).map((e) => e.item)}
            />

            <div className="border-t border-slate-200" />

            {/* Extensions */}
            <TourExtensions />

            <div className="border-t border-slate-200" />

            {/* Reviews */}
            <div id="reviews" className="scroll-mt-20">
              <TourReviews reviews={reviews} tourUrl={tourUrl} tourTitle={tour.title} />
            </div>

            <div className="border-t border-slate-200" />

            {/* Good to know */}
            <TourGoodToKnow faqs={tourFaqs} />
          </div>

          {/* Right: sidebar (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-16">
              <TourBookingAside tour={tour} tourUrl={tourUrl} isFree={isFree} />
            </div>
          </div>
        </div>

        {/* Related tours */}
        {relatedTours.length > 0 && (
          <>
            <div className="border-t border-slate-200 my-8" />
            <TourRelated tours={relatedTours} destinationTitle={destination?.title} />
          </>
        )}

        {/* OTA widgets */}
        {destination && otaWidgets.length > 0 && (
          <>
            <div className="border-t border-slate-200 my-8" />
            <section>
              <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
                Similar experiences in {destination.title}
              </h2>
              <p className="mt-2 text-xs text-slate-500">From trusted travel partners — not booked through TC Travel.</p>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                {otaWidgets.map((widget) => (
                  <OtaWidget key={widget.key} widget={widget} city={destination.title} source={`/tours/${tour.slug}`} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Mobile bottom CTA */}
      <TourMobileBottomCta slug={tour.slug} isFree={isFree} priceFrom={tour.priceFrom} />
    </main>
  );
}
