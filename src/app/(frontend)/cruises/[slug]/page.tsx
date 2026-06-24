import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/config/env";
import { getCruiseBySlug } from "@/lib/cms-cruises";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { getPayloadClient } from "@/lib/payload";
import { resolveImage, resolveOgImage } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/structured-data";
import type { Destination } from "@/payload-types";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "cruises",
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

function destinationOf(cruise: { destination: number | Destination }): Destination | null {
  return cruise.destination && typeof cruise.destination === "object" ? (cruise.destination as Destination) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cruise = await getCruiseBySlug(slug);
  if (!cruise) return { title: "Cruise not found" };

  const siteUrl = getSiteUrl();
  const description =
    cruise.seo?.metaDescription?.trim() || lexicalToPlainText(cruise.description) || `Book ${cruise.title} in Vietnam.`;
  const ogImage = resolveOgImage(cruise.seo?.ogImage ?? cruise.featuredImage, siteUrl);

  return {
    title: cruise.seo?.metaTitle ? { absolute: cruise.seo.metaTitle } : cruise.title,
    description,
    alternates: { canonical: `/cruises/${cruise.slug}` },
    openGraph: {
      title: cruise.seo?.metaTitle ?? cruise.title,
      description,
      images: [{ url: ogImage }],
      type: "website",
      siteName: "TC Travel Vietnam",
      locale: "en_US",
      url: `${siteUrl.replace(/\/$/, "")}/cruises/${cruise.slug}`
    }
  };
}

export default async function CruiseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cruise = await getCruiseBySlug(slug);
  if (!cruise) notFound();

  const destination = destinationOf(cruise);
  const heroImage = resolveImage(cruise.featuredImage, cruise.title, { variant: "hero" });
  const descriptionHtml = lexicalToHtml(cruise.description);
  const cabinTypes = Array.isArray(cruise.cabinTypes) ? cruise.cabinTypes : [];
  const itinerary = Array.isArray(cruise.itinerary) ? cruise.itinerary : [];
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const cruiseUrl = absoluteUrl(siteUrl, `/cruises/${cruise.slug}`);

  return (
    <main className="bg-mist pb-16">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl },
            { name: "Cruises", url: absoluteUrl(siteUrl, "/cruises") },
            { name: cruise.title, url: cruiseUrl }
          ])
        ]}
      />

      <div className="mx-auto max-w-page px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Cruises", href: "/cruises" },
            ...(destination ? [{ label: destination.title, href: `/destinations/${destination.slug}` }] : []),
            { label: cruise.title }
          ]}
        />

        <header className="mt-6 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
            Cruise
            {cruise.nights ? ` · ${cruise.nights} night${cruise.nights === 1 ? "" : "s"}` : ""}
            {destination ? ` · ${destination.title}` : ""}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-navy-950 md:text-5xl">
            {cruise.title}
          </h1>
          {cruise.routeSummary ? <p className="max-w-2xl text-base leading-7 text-slate-600">{cruise.routeSummary}</p> : null}
        </header>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
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

            {descriptionHtml ? (
              <section
                className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-navy-950 prose-a:text-navy-700 prose-strong:text-navy-900 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}

            {itinerary.length > 0 ? (
              <section className="space-y-4">
                <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Itinerary</h2>
                <ol className="space-y-4 border-l border-navy-100 pl-5">
                  {itinerary.map((item, index) => (
                    <li key={item.id ?? index} className="relative">
                      <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-brand-green" />
                      {item.time ? (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">{item.time}</p>
                      ) : null}
                      <div
                        className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: lexicalToHtml(item.activity) }}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">From</p>
              <p className="mt-1 text-3xl font-bold text-navy-950">
                {cruise.priceFrom ? `$${cruise.priceFrom}` : "On request"}
                <span className="ml-1 text-sm font-medium text-slate-500">{cruise.currency ?? "USD"} · per person</span>
              </p>

              {cabinTypes.length > 0 ? (
                <ul className="mt-4 space-y-2 border-t border-navy-100 pt-4 text-sm">
                  {cabinTypes.map((cabin, index) => (
                    <li key={cabin.id ?? index} className="flex items-center justify-between gap-3">
                      <span className="text-slate-700">{cabin.label}</span>
                      <span className="font-semibold text-navy-900">${cabin.price}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <Link
                href="/free-proposal"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
              >
                Plan this cruise
              </Link>
              <p className="mt-2 text-center text-xs text-slate-500">Book Now · Pay Later — no prepayment.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
