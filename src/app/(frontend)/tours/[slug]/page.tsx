import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { OtaWidget } from "@/components/ota-widget";
import { SectionHead } from "@/components/section";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { getReviewsForTour, getSiteSettings, getTourBySlug } from "@/lib/cms";
import { getToursForDestinationList, getToursForList } from "@/lib/cms-list";
import { resolveOtaWidgets } from "@/lib/ota-providers";
import { getPayloadClient } from "@/lib/payload";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, tourProductJsonLd } from "@/lib/structured-data";
import type { Media, Partner } from "@/payload-types";
import { TourAddOns } from "./tour-addons";
import { TourBookingAside } from "./tour-booking-aside";
import { badgesFor, destinationOf } from "./tour-detail-helpers";
import { TourItinerary } from "./tour-itinerary";
import { TourMap } from "./tour-map";
import { TourMobileBottomCta, TourMobileTabs } from "./tour-mobile-cta";
import { TourReviews } from "./tour-reviews";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "tours",
      where: { status: { equals: "active" } },
      limit: 100,
      depth: 0
    });
    return result.docs.map((doc) => ({ slug: doc.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };

  const siteUrl = getSiteUrl();
  const description = tour.seo?.metaDescription?.trim() || lexicalToPlainText(tour.description) || `Book ${tour.title} in Central Vietnam.`;
  const ogImage = resolveOgImage(tour.seo?.ogImage ?? tour.featuredImage, siteUrl);

  return {
    title: tour.seo?.metaTitle ? { absolute: tour.seo.metaTitle } : tour.title,
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.seo?.metaTitle ?? tour.title,
      description,
      images: [{ url: ogImage }],
      type: "website",
      siteName: "TC Travel Vietnam",
      locale: "en_US",
      url: `${siteUrl.replace(/\/$/, "")}/tours/${tour.slug}`
    }
  };
}

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const destination = destinationOf(tour);
  const [sameDestinationTours, fallbackTours, reviews, siteSettings] = await Promise.all([
    destination ? getToursForDestinationList(destination.id, 4) : Promise.resolve([]),
    getToursForList({ limit: 8 }),
    getReviewsForTour(tour.id, 5),
    getSiteSettings()
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
  const addOns: Partner[] = Array.isArray(tour.addOns)
    ? (tour.addOns.filter((entry) => entry && typeof entry === "object") as Partner[])
    : [];
  const isFree = !tour.priceFrom || tour.priceFrom === 0;
  const badges = badgesFor(tour);
  const descriptionHtml = lexicalToHtml(tour.description);
  const description = tour.seo?.metaDescription?.trim() || lexicalToPlainText(tour.description) || `Book ${tour.title} in Central Vietnam.`;
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const tourUrl = absoluteUrl(siteUrl, `/tours/${tour.slug}`);

  return (
    <main className="bg-mist pb-24">
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
            tourType: tour.tourType
          })
        ]}
      />

      <div className="mx-auto max-w-page px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tours", href: "/tours" },
            ...(destination ? [{ label: destination.title, href: `/destinations/${destination.slug}` }] : []),
            { label: tour.title }
          ]}
        />

        <header className="mt-6 space-y-4">
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center rounded-full bg-brand-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-900"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
            {tour.tourType.replace(/-/g, " ")}
            {tour.season && tour.season !== "year-round" ? ` · ${tour.season}` : ""}
            {destination ? ` · ${destination.title}` : ""}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-navy-950 md:text-5xl">
            {tour.title}
          </h1>
        </header>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
            <TourMobileTabs />
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-navy-50 shadow-card">
              <Image
                src={heroImage.url}
                alt={heroImage.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
                style={heroImage.objectPosition ? { objectPosition: heroImage.objectPosition } : undefined}
              />
            </div>

            {gallery.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {gallery.slice(0, 6).map((media) => {
                  const img = resolveImage(media, undefined, { variant: "thumb" });
                  return (
                    <div
                      key={media.id}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-navy-50"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        sizes="20vw"
                        className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.06]"
                        style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}

            {descriptionHtml ? (
              <section
                id="overview"
                className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-950 prose-a:text-navy-700 prose-strong:text-navy-900 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}

            <div id="itinerary">{tour.itinerary ? <TourItinerary items={tour.itinerary} /> : null}</div>

            {destination ? (
              <TourMap query={`${destination.title}, Vietnam`} label={`${destination.title}, Central Vietnam`} />
            ) : null}

            <TourAddOns addOns={addOns} tourSlug={tour.slug} />

            <TourReviews reviews={reviews} />
          </div>

          <div id="price">
            <TourBookingAside tour={tour} tourUrl={tourUrl} isFree={isFree} />
          </div>
        </div>
        {relatedTours.length > 0 ? (
          <section className="mt-16">
            <SectionHead
              eyebrow="More tours"
              title={destination ? `Also in ${destination.title}` : "More tours"}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTours.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          </section>
        ) : null}

        {destination && otaWidgets.length > 0 ? (
          <section className="mt-16">
            <SectionHead
              eyebrow="External partners"
              title={`Similar experiences in ${destination.title}`}
              subtitle="From trusted travel partners — not booked through TC Travel."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {otaWidgets.map((widget) => (
                <OtaWidget key={widget.key} widget={widget} city={destination.title} source={`/tours/${tour.slug}`} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <TourMobileBottomCta slug={tour.slug} isFree={isFree} currency={tour.currency} priceFrom={tour.priceFrom} />
    </main>
  );
}
