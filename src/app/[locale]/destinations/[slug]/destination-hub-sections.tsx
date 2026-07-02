import { CarRentalCard } from "@/components/car-rental-card";
import { MobileScrollRow } from "@/components/mobile-scroll-row";
import { SectionHead } from "@/components/section";
import type { DestinationHub } from "@/lib/cms";

interface Props {
  hub: DestinationHub;
}

// Guides and attractions moved to dedicated hub sections (hub-guides.tsx,
// attraction-card.tsx grid in page.tsx); this now only renders transfers.
export function DestinationHubSections({ hub }: Props) {
  const { destination, carRentals } = hub;

  if (carRentals.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow="Private transfers"
        title={`Car rentals in ${destination.title}`}
        actionHref={`/car-rentals?destination=${destination.slug}`}
        actionLabel="View routes"
      />
      <MobileScrollRow className="gap-5 pb-3 md:grid md:grid-cols-3 md:overflow-visible">
        {carRentals.slice(0, 3).map((rental) => (
          <div key={rental.id} className="w-[82vw] shrink-0 md:w-auto">
            <CarRentalCard rental={rental} />
          </div>
        ))}
      </MobileScrollRow>
    </section>
  );
}
