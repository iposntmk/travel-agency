import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { getSiteUrl } from "@/config/env";
import { TourCard } from "@/components/tour-card";
import { getDestinations } from "@/lib/cms";
import { getToursForList } from "@/lib/cms-list";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" }
};

export default async function HomePage() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const [featuredTours, freeTours, destinations] = await Promise.all([
    getToursForList({ featuredOnly: true, limit: 3 }).then((tours) =>
      tours.length > 0 ? tours : getToursForList({ limit: 3 })
    ),
    getToursForList({ freeOnly: true, limit: 3 }),
    getDestinations(6)
  ]);

  return (
    <main>
      <JsonLd data={[organizationJsonLd(siteUrl), webSiteJsonLd(siteUrl)]} />
      <section className="bg-[linear-gradient(135deg,#fff7ed,#eff6ff_55%,#ffffff)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-16">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
              Central Vietnam Tours
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-brand-ink md:text-6xl">
              TC Travel Vietnam
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              Private, small group, and free walking tours in Hội An, Huế, and Đà Nẵng.
              Submit an inquiry now and pay later after the team confirms details.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/tours">Explore Tours</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/free-tours">Join Free Tours</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            {destinations.length === 0 ? (
              <p className="text-sm text-slate-500">Destinations coming soon.</p>
            ) : (
              destinations.slice(0, 3).map((destination) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.slug}`}
                  className="rounded-md bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <h2 className="font-semibold text-slate-900">{destination.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {destination.region === "central"
                      ? "Central Vietnam"
                      : destination.region === "north"
                        ? "Northern Vietnam"
                        : destination.region === "south"
                          ? "Southern Vietnam"
                          : "Vietnam"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Featured Tours</h2>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Hand-picked tours for the current season.
            </p>
          </div>
          <Link className="text-sm font-semibold text-brand-blue" href="/tours">
            View all
          </Link>
        </div>
        {featuredTours.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No tours published yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      {freeTours.length > 0 ? (
        <section className="bg-amber-50/60">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">Lead with experience</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Join Our Free Tours</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                  Free walking and cycling tours in Central Vietnam. Tips appreciated — registration uses
                  the same Book Now - Pay Later inquiry flow.
                </p>
              </div>
              <Link className="text-sm font-semibold text-brand-blue" href="/free-tours">
                View all
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {freeTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  ctaLabel="Register"
                  ctaHref={`/booking/${tour.slug}?source=free-tour-upsell`}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:py-12">
          {[
            { title: "Book Now, Pay Later", body: "Confirm details with our team, then pay when you meet your guide." },
            { title: "Local Specialists", body: "Run by guides who live in Hội An, Huế and Đà Nẵng." },
            { title: "Free Tours Welcome", body: "Walking and cycling tours to introduce the region — tips appreciated." }
          ].map((item) => (
            <div key={item.title} className="rounded-md border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
