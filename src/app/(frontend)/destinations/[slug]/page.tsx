import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { OtaWidget } from "@/components/ota-widget";
import { SectionHead } from "@/components/section";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { getDestinationBySlug, getDestinationHub, getDestinations, getSiteSettings } from "@/lib/cms";
import { resolveOtaWidgets } from "@/lib/ota-providers";
import { destinationRegionBestSeason, destinationRegionLabel } from "@/lib/destination-regions";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, touristDestinationJsonLd } from "@/lib/structured-data";
import { DestinationHubSections } from "./destination-hub-sections";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const destinations = await getDestinations(50);
  return destinations.map((d) => ({ slug: d.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return { title: "Destination not found" };

  const siteUrl = getSiteUrl();
  const description =
    destination.seo?.metaDescription?.trim() ||
    lexicalToPlainText(destination.description) ||
    `Tours in ${destination.title}.`;
  const ogImage = resolveOgImage(destination.seo?.ogImage ?? destination.featuredImage, siteUrl);

  return {
    title: destination.seo?.metaTitle ? { absolute: destination.seo.metaTitle } : destination.title,
    description,
    alternates: { canonical: `/destinations/${destination.slug}` },
    openGraph: {
      title: destination.seo?.metaTitle ?? destination.title,
      description,
      images: [{ url: ogImage }],
      type: "website",
      siteName: "TC Travel Vietnam",
      locale: "en_US",
      url: `${siteUrl.replace(/\/$/, "")}/destinations/${destination.slug}`
    }
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [hub, siteSettings] = await Promise.all([getDestinationHub(slug), getSiteSettings()]);
  if (!hub) notFound();
  const { destination, tours } = hub;
  const otaWidgets = resolveOtaWidgets(siteSettings?.ota, "destination", destination.title);
  const details = destination as typeof destination & {
    summary?: string;
    bestTimeToVisit?: string;
    hubIntro?: unknown;
    heroImage?: unknown;
  };

  const image = resolveImage(
    (details.heroImage ?? destination.featuredImage) as Parameters<typeof resolveImage>[0],
    destination.title,
    { variant: "hero" }
  );
  const html = lexicalToHtml((details.hubIntro ?? destination.description) as typeof destination.description);
  const description =
    destination.seo?.metaDescription?.trim() ||
    lexicalToPlainText(destination.description) ||
    `Tours in ${destination.title}.`;
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const destinationUrl = absoluteUrl(siteUrl, `/destinations/${destination.slug}`);
  const bestSeason = details.bestTimeToVisit || destinationRegionBestSeason(destination.region);
  const regionLabel = destinationRegionLabel(destination.region);

  return (
    <main className="bg-mist pb-20">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Destinations", url: absoluteUrl(siteUrl, "/destinations") },
            { name: destination.title, url: destinationUrl }
          ]),
          touristDestinationJsonLd({
            title: destination.title,
            url: destinationUrl,
            description,
            image: image.isFallback ? undefined : image.url
          })
        ]}
      />

      <div className="mx-auto max-w-page px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations" },
            { label: destination.title }
          ]}
        />

        <header className="mt-5 space-y-3">
          {regionLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">{regionLabel}</p>
          ) : null}
          <h1 className="font-display text-4xl font-bold tracking-tight text-navy-950 md:text-5xl">
            {destination.title}
          </h1>
        </header>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-navy-50 shadow-card">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
                style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
              />
            </div>
            {html ? (
              <section
                className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-950 prose-a:text-navy-700 prose-strong:text-navy-900"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : null}
            {details.summary ? <p className="text-lg leading-8 text-slate-700">{details.summary}</p> : null}
          </div>

          {bestSeason ? (
            <aside className="self-start rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
                Best Time to Visit
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{bestSeason}</p>
              <Link
                href={`/tours?destination=${destination.slug}`}
                className="mt-5 inline-flex items-center gap-1 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
              >
                See tours
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </aside>
          ) : null}
        </div>

        <section className="mt-16">
          <SectionHead
            eyebrow="Tour catalogue"
            title={`Tours in ${destination.title}`}
            actionHref={`/tours?destination=${destination.slug}`}
            actionLabel="See all"
          />
          {tours.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-navy-100 bg-white p-8 text-center text-sm text-slate-500">
              No tours published yet for this destination.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </section>

        <DestinationHubSections hub={hub} />

        {otaWidgets.length > 0 ? (
          <section className="mt-16">
            <SectionHead
              eyebrow="External partners"
              title={`Top things to do in ${destination.title}`}
              subtitle="From trusted travel partners — booked externally, not through TC Travel."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {otaWidgets.map((widget) => (
                <OtaWidget
                  key={widget.key}
                  widget={widget}
                  city={destination.title}
                  source={`/destinations/${destination.slug}`}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
