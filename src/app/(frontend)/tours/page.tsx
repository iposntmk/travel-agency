import type { Metadata } from "next";
import Link from "next/link";
import { tours } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Tours",
  description: "Browse paid and free tours in Hoi An, Hue, and Da Nang."
};

export default async function ToursPage({
  searchParams
}: {
  searchParams?: Promise<{ destination?: string; type?: string }>;
}) {
  const params = await searchParams;
  const destination = params?.destination?.toLowerCase();
  const type = params?.type?.toLowerCase();
  const filtered = tours.filter((tour) => {
    const destinationMatch = !destination || tour.destination.toLowerCase() === destination;
    const typeMatch = !type || tour.tourType.toLowerCase() === type;
    return destinationMatch && typeMatch;
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-950">Tours</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Filter-ready listing for paid private tours, group tours, partner tours, and free tours.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {["Hoi An", "Hue", "Da Nang"].map((item) => (
          <Link
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700"
            href={`/tours?destination=${encodeURIComponent(item)}`}
            key={item}
          >
            {item}
          </Link>
        ))}
        <Link className="rounded-md border border-slate-300 px-3 py-2 text-slate-700" href="/tours">
          Clear
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {filtered.map((tour) => (
          <article key={tour.slug} className="rounded-md border border-slate-200 p-5">
            <p className="text-sm font-medium text-brand-red">{tour.destination}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{tour.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{tour.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">
                {tour.priceFrom === 0 ? "Free to join" : `From $${tour.priceFrom}`}
              </span>
              <Link className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white" href="/booking/confirmation">
                Request
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
