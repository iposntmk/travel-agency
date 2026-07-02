import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { SectionHead } from "@/components/section";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";
import { getDestinationBySlug } from "@/lib/cms";
import { getAttractionBySlug, getAttractionSitemapEntries, getToursForAttraction } from "@/lib/cms-attractions";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, touristAttractionJsonLd } from "@/lib/structured-data";

export const revalidate = 300;
export const dynamicParams = true;

// Prerender only the top attractions per locale (Netlify Free build minutes);
// the long tail renders on-demand via ISR.
const PRERENDER_LIMIT = 24;

export async function generateStaticParams(): Promise<{ locale: string; slug: string; attractionSlug: string }[]> {
  const entries = await getAttractionSitemapEntries(PRERENDER_LIMIT);
  return routing.locales.flatMap((locale) =>
    entries.map((entry) => ({ locale, slug: entry.destinationSlug, attractionSlug: entry.slug }))
  );
}

interface PageProps {
  params: Promise<{ locale: string; slug: string; attractionSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug, attractionSlug } = await params;
  const attraction = await getAttractionBySlug(slug, attractionSlug, locale);
  if (!attraction) return { title: "Attraction not found" };

  const siteUrl = getSiteUrl();
  const path = `/destinations/${slug}/attractions/${attractionSlug}`;
  const description =
    attraction.seo?.metaDescription?.trim() ||
    attraction.summary?.trim() ||
    lexicalToPlainText(attraction.content) ||
    attraction.title;
  const ogImage = resolveOgImage(attraction.seo?.ogImage ?? attraction.featuredImage, siteUrl);

  return {
    title: attraction.seo?.metaTitle ? { absolute: attraction.seo.metaTitle } : attraction.title,
    description,
    alternates: { canonical: localizedUrl(siteUrl, locale, path), languages: buildAlternates(siteUrl, path) },
    openGraph: {
      title: attraction.seo?.metaTitle ?? attraction.title,
      description,
      images: [{ url: ogImage }],
      type: "website",
      siteName: "TC Travel Vietnam",
      url: localizedUrl(siteUrl, locale, path)
    }
  };
}

export default async function AttractionDetailPage({ params }: PageProps) {
  const { locale, slug, attractionSlug } = await params;
  setRequestLocale(locale);

  const [attraction, destination, t] = await Promise.all([
    getAttractionBySlug(slug, attractionSlug, locale),
    getDestinationBySlug(slug, locale),
    getTranslations("hub")
  ]);
  if (!attraction || !destination) notFound();

  const tours = await getToursForAttraction(attraction.id, 6, locale);
  const image = resolveImage(attraction.featuredImage, attraction.title, { variant: "hero" });
  const html = lexicalToHtml(attraction.content);
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const path = `/destinations/${slug}/attractions/${attractionSlug}`;
  const url = absoluteUrl(siteUrl, path);
  const practical = attraction.practicalInfo;
  const faqs = (attraction.faqs ?? []).filter((faq) => faq.question && faq.answer);
  const description =
    attraction.seo?.metaDescription?.trim() || attraction.summary?.trim() || lexicalToPlainText(attraction.content);

  return (
    <main className="bg-mist pb-20">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Destinations", url: absoluteUrl(siteUrl, "/destinations") },
            { name: destination.title, url: absoluteUrl(siteUrl, `/destinations/${slug}`) },
            { name: attraction.title, url }
          ]),
          touristAttractionJsonLd({
            title: attraction.title,
            url,
            description,
            image: image.isFallback ? undefined : image.url,
            latitude: practical?.latitude ?? undefined,
            longitude: practical?.longitude ?? undefined,
            address: practical?.address ?? undefined,
            openingHours: practical?.openingHours ?? undefined,
            containedInPlaceName: destination.title,
            containedInPlaceUrl: absoluteUrl(siteUrl, `/destinations/${slug}`)
          })
        ]}
      />

      <div className="mx-auto max-w-page px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations" },
            { label: destination.title, href: `/destinations/${slug}` },
            { label: attraction.title }
          ]}
        />

        <header className="mt-5 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">{destination.title}</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-navy-950 md:text-5xl">
            {attraction.title}
          </h1>
          {attraction.summary ? <p className="max-w-3xl text-lg leading-8 text-slate-700">{attraction.summary}</p> : null}
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
                className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-950"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : null}

            {(attraction.highlights ?? []).length > 0 ? (
              <section>
                <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">{t("highlights")}</h2>
                <ul className="mt-4 space-y-3">
                  {(attraction.highlights ?? []).map((highlight) => (
                    <li key={highlight.id ?? highlight.title} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="font-semibold text-navy-950">{highlight.title}</p>
                      {highlight.description ? (
                        <p className="mt-1 text-sm leading-6 text-slate-600">{highlight.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {faqs.length > 0 ? (
              <section>
                <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
                  {t("faqTitle", { destination: attraction.title })}
                </h2>
                <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
                  {faqs.map((faq) => (
                    <details key={faq.id ?? faq.question} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-base font-semibold text-navy-950">
                        {faq.question}
                        <span className="text-slate-400 transition-transform group-open:rotate-45" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {practical && (practical.address || practical.openingHours || practical.priceRange) ? (
            <aside className="self-start rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
                {t("practicalInfo")}
              </p>
              <dl className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {practical.address ? (
                  <div>
                    <dt className="font-semibold text-navy-950">{t("address")}</dt>
                    <dd>{practical.address}</dd>
                  </div>
                ) : null}
                {practical.openingHours ? (
                  <div>
                    <dt className="font-semibold text-navy-950">{t("openingHours")}</dt>
                    <dd>{practical.openingHours}</dd>
                  </div>
                ) : null}
                {practical.priceRange ? (
                  <div>
                    <dt className="font-semibold text-navy-950">{t("priceRange")}</dt>
                    <dd>{practical.priceRange}</dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          ) : null}
        </div>

        {tours.length > 0 ? (
          <section className="mt-16">
            <SectionHead
              eyebrow={t("toursEyebrow")}
              title={t("toursVisiting", { attraction: attraction.title })}
              actionHref={`/tours?destination=${slug}`}
              actionLabel={t("allTours")}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
