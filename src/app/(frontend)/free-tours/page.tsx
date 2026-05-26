import type { Metadata } from "next";
import { TourCard } from "@/components/tour-card";
import { getToursForList } from "@/lib/cms-list";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Free Tours",
  description:
    "Join our free walking and cycling tours in Hội An, Huế, and Đà Nẵng. Registration uses the same Book Now - Pay Later inquiry flow.",
  alternates: { canonical: "/free-tours" }
};

export default async function FreeToursPage() {
  const freeTours = await getToursForList({ freeOnly: true, limit: 24 });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">Free Tours</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Free to join, tips appreciated. Registration uses the same Book Now - Pay Later
        inquiry engine and is tagged separately for sales follow-up.
      </p>

      <section className="mt-8">
        {freeTours.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No free tours scheduled right now. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {freeTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} ctaLabel="Register" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
