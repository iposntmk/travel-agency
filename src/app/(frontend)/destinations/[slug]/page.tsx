import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TourCard } from "@/components/tour-card";
import { getSiteUrl } from "@/config/env";
import {
  getDestinationBySlug,
  getDestinations,
  getToursForDestination
} from "@/lib/cms";
import { lexicalToHtml, lexicalToPlainText } from "@/lib/lexical";
import { resolveImage, resolveOgImage } from "@/lib/media";

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
    title: destination.seo?.metaTitle ?? destination.title,
    description,
    openGraph: {
      title: destination.seo?.metaTitle ?? destination.title,
      description,
      images: [{ url: ogImage }],
      url: `${siteUrl.replace(/\/$/, "")}/destinations/${destination.slug}`
    }
  };
}

const REGION_BEST_SEASON: Record<string, string> = {
  central: "February to August — dry season is best for beaches and old town walks. Heaviest rain falls from October to early December.",
  north: "October to April — cooler, drier months ideal for trekking and city exploration.",
  south: "December to April — dry season; rest of the year sees afternoon showers."
};

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const tours = await getToursForDestination(destination.id, 6);
  const image = resolveImage(destination.featuredImage, destination.title, { variant: "hero" });
  const html = lexicalToHtml(destination.description);
  const bestSeason = destination.region ? REGION_BEST_SEASON[destination.region] : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <nav className="text-sm text-slate-500">
        <Link className="hover:underline" href="/destinations">Destinations</Link>
      </nav>

      <header className="mt-4 space-y-3">
        <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">{destination.title}</h1>
        {destination.region ? (
          <p className="text-sm text-slate-500">
            {destination.region === "central"
              ? "Central Vietnam"
              : destination.region === "north"
                ? "Northern Vietnam"
                : "Southern Vietnam"}
          </p>
        ) : null}
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-slate-100">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
          {html ? (
            <section
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : null}
        </div>

        {bestSeason ? (
          <aside className="self-start rounded-md border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">Best Time to Visit</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{bestSeason}</p>
            <Link
              href={`/tours?destination=${destination.slug}`}
              className="mt-4 inline-flex rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              See tours
            </Link>
          </aside>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-950">Tours in {destination.title}</h2>
        {tours.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No tours published yet for this destination.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
