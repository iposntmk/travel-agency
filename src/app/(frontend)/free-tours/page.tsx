import type { Metadata } from "next";
import Link from "next/link";
import { tours } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Free Tours",
  description: "Free walking and cycling tour registrations using the shared inquiry flow."
};

export default function FreeToursPage() {
  const freeTours = tours.filter((tour) => tour.priceFrom === 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-950">Free Tours</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Free to join, tips appreciated. Registration uses the same Book Now - Pay Later
        inquiry engine and is tagged separately for sales follow-up.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {freeTours.map((tour) => (
          <article key={tour.slug} className="rounded-md border border-slate-200 p-5">
            <p className="text-sm font-medium text-brand-red">{tour.destination}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{tour.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{tour.description}</p>
            <Link
              className="mt-5 inline-flex rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
              href="/booking/confirmation"
            >
              Register
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
