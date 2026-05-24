import Link from "next/link";
import { destinations, tours } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const featuredTours = tours.slice(0, 3);

  return (
    <main>
      <section className="bg-[linear-gradient(135deg,#fff7ed,#eff6ff_55%,#ffffff)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
              Central Vietnam Tours
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-brand-ink md:text-6xl">
              TC Travel Vietnam
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Private, small group, and free walking tours in Hoi An, Hue, and Da Nang.
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
            {destinations.map((destination) => (
              <div key={destination.slug} className="rounded-md bg-slate-50 p-4">
                <h2 className="font-semibold text-slate-900">{destination.name}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{destination.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Featured Tours</h2>
            <p className="mt-2 text-slate-600">Static seed data now, ready to replace with Payload reads.</p>
          </div>
          <Link className="text-sm font-semibold text-brand-blue" href="/tours">
            View all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredTours.map((tour) => (
            <article key={tour.slug} className="rounded-md border border-slate-200 p-5">
              <p className="text-sm font-medium text-brand-red">{tour.destination}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{tour.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{tour.description}</p>
              <p className="mt-4 font-semibold text-slate-900">
                {tour.priceFrom === 0 ? "Free to join" : `From $${tour.priceFrom}`}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
