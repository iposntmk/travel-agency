import { TourCard } from "@/components/tour-card";
import type { Tour } from "@/payload-types";

interface Props {
  tours: Tour[];
  destinationTitle?: string;
}

export function TourRelated({ tours, destinationTitle }: Props) {
  if (tours.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">
        {destinationTitle ? `Also in ${destinationTitle}` : "Related tours"}
      </h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((t) => (
          <TourCard key={t.id} tour={t} />
        ))}
      </div>
    </section>
  );
}
