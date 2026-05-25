import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDestinations } from "@/lib/cms";
import { lexicalToPlainText } from "@/lib/lexical";
import { resolveImage } from "@/lib/media";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Destinations",
  description: "Hội An, Huế, Đà Nẵng and more — Central Vietnam destinations covered by TC Travel Vietnam."
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">Destinations</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Explore our routes across Central Vietnam — from imperial Huế to lantern-lit Hội An and coastal Đà Nẵng.
      </p>

      <section className="mt-8">
        {destinations.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No destinations published yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => {
              const image = resolveImage(destination.featuredImage, destination.title);
              const summary = lexicalToPlainText(destination.description, 140);
              return (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.slug}`}
                  className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h2 className="text-lg font-semibold text-slate-950">{destination.title}</h2>
                    {summary ? <p className="text-sm leading-6 text-slate-600">{summary}</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
