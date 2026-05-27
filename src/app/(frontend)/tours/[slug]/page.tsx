import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { OtaWidget } from "@/components/ota-widget";
import { ShareButtons } from "@/components/share-buttons";
import { TourCard } from "@/components/tour-card";
import { TrackedLink } from "@/components/tracked-link";
import { getSiteUrl } from "@/config/env";
import { getPayloadClient } from "@/lib/payload";
import { getTourBySlug } from "@/lib/cms";
import { getToursForDestinationList } from "@/lib/cms-list";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, tourProductJsonLd } from "@/lib/structured-data";
import type { Destination, Media, Partner, Tour } from "@/payload-types";

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
  const description =
    tour.seo?.metaDescription?.trim() || lexicalToPlainText(tour.description) ||
    `Book ${tour.title} in Central Vietnam.`;
  const ogImage = resolveOgImage(tour.seo?.ogImage ?? tour.featuredImage, siteUrl);

  return {
    title: tour.seo?.metaTitle ?? tour.title,
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.seo?.metaTitle ?? tour.title,
      description,
      images: [{ url: ogImage }],
      type: "website",
      url: `${siteUrl.replace(/\/$/, "")}/tours/${tour.slug}`
    }
  };
}

function destinationOf(tour: Tour): Destination | null {
  return tour.destination && typeof tour.destination === "object"
    ? (tour.destination as Destination)
    : null;
}

function badgesFor(tour: Tour): string[] {
  const badges: string[] = [];
  if (tour.minPax && tour.currentPax && tour.currentPax >= tour.minPax) badges.push("Guaranteed Departure");
  if (tour.operationType === "partner") badges.push("Partner operated");
  if (tour.operationType === "hybrid") badges.push("Hybrid operation");
  if (tour.isFeaturedInSeason) badges.push("Seasonal pick");
  return badges;
}

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const destination = destinationOf(tour);
  const related = destination ? await getToursForDestinationList(destination.id, 4) : [];
  const relatedTours = related.filter((t) => t.id !== tour.id).slice(0, 3);

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
  const description =
    tour.seo?.metaDescription?.trim() || lexicalToPlainText(tour.description) || `Book ${tour.title} in Central Vietnam.`;
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const tourUrl = absoluteUrl(siteUrl, `/tours/${tour.slug}`);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-10">
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
      <nav className="text-sm text-slate-500">
        <Link className="hover:underline" href="/tours">Tours</Link>
        {destination ? (
          <>
            <span className="mx-2">›</span>
            <Link className="hover:underline" href={`/destinations/${destination.slug}`}>
              {destination.title}
            </Link>
          </>
        ) : null}
      </nav>

      <header className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-brand-ink">
              {b}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold leading-tight text-slate-950 md:text-4xl">{tour.title}</h1>
        <p className="text-sm text-slate-500">
          {tour.tourType.replace(/-/g, " ")}
          {tour.season && tour.season !== "year-round" ? ` · ${tour.season}` : ""}
          {destination ? ` · ${destination.title}` : ""}
        </p>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-slate-100">
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              fill
              priority
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
              style={heroImage.objectPosition ? { objectPosition: heroImage.objectPosition } : undefined}
            />
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {gallery.slice(0, 6).map((media) => {
                const img = resolveImage(media, undefined, { variant: "thumb" });
                return (
                  <div key={media.id} className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="20vw"
                      className="object-cover"
                      style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}

          {descriptionHtml ? (
            <section
              className="prose prose-slate max-w-none prose-headings:text-slate-950"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : null}

          {tour.itinerary && tour.itinerary.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-slate-950">Itinerary</h2>
              <ol className="mt-3 space-y-3">
                {tour.itinerary.map((item, index) => {
                  const html = lexicalToHtml(item.activity);
                  return (
                    <li key={item.id ?? index} className="rounded-md border border-slate-200 p-3">
                      {item.time ? (
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">{item.time}</p>
                      ) : null}
                      {html ? (
                        <div className="prose prose-sm mt-1 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {addOns.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-slate-950">Add-on services</h2>
              <p className="mt-1 text-xs text-slate-500">
                External partners — clicking opens the partner&rsquo;s site in a new tab.
              </p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {addOns.map((addOn) => {
                  const url = addOn.inquiryFormUrl?.trim();
                  const body = (
                    <>
                      <p className="font-semibold text-slate-900">{addOn.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{addOn.partnerType}</p>
                      {addOn.description ? (
                        <p className="mt-2 text-sm text-slate-600">{addOn.description}</p>
                      ) : null}
                    </>
                  );
                  return (
                    <li key={addOn.id} className="rounded-md border border-slate-200 p-3">
                      {url ? (
                        <TrackedLink
                          href={url}
                          targetType="addon"
                          targetId={String(addOn.id)}
                          source={`/tours/${tour.slug}`}
                          className="block"
                        >
                          {body}
                          <p className="mt-2 text-xs font-semibold text-brand-blue">View on partner site →</p>
                        </TrackedLink>
                      ) : (
                        body
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 self-start rounded-md border border-slate-200 bg-white p-5 md:sticky md:top-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {isFree ? "Free to join" : `From $${tour.priceFrom} ${tour.currency ?? "USD"}`}
            </p>
            {!isFree ? <p className="text-xs text-slate-500">Pay later — confirm with the team first.</p> : null}
          </div>

          {tour.pricingTiers && tour.pricingTiers.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing tiers</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {tour.pricingTiers.map((tier) => (
                  <li key={tier.id ?? tier.label} className="flex justify-between gap-2">
                    <span>{tier.label}</span>
                    <span className="font-semibold">${tier.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            href={`/booking/${tour.slug}`}
            className="block w-full rounded-md bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
          >
            {isFree ? "Register" : "Request this tour"}
          </Link>

          <div className="border-t border-slate-100 pt-4">
            <ShareButtons url={tourUrl} title={tour.title} medium="tour" campaignId={tour.slug} />
          </div>

          {tour.availableDates && tour.availableDates.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming dates</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {tour.availableDates.slice(0, 4).map((d) => (
                  <li key={d.id ?? d.date}>{new Date(d.date).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {relatedTours.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-950">More tours{destination ? ` in ${destination.title}` : ""}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {relatedTours.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        </section>
      ) : null}

      {destination ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-950">
            Similar experiences in {destination.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            From external partners — not booked through TC Travel.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <OtaWidget provider="getyourguide" city={destination.title} source={`/tours/${tour.slug}`} />
            <OtaWidget provider="viator" city={destination.title} source={`/tours/${tour.slug}`} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
