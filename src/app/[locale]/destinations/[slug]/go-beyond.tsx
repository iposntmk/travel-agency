import { getTranslations } from "next-intl/server";
import { DestinationCard } from "@/components/destination-card";
import { MobileScrollRow } from "@/components/mobile-scroll-row";
import { SectionHead } from "@/components/section";
import type { Destination } from "@/payload-types";

interface GoBeyondProps {
  destinationTitle: string;
  nearby: Destination[];
}

/** "Go beyond X" nearby-destination cross-sell (Destinations.nearbyDestinations). */
export async function GoBeyond({ destinationTitle, nearby }: GoBeyondProps) {
  if (nearby.length === 0) return null;
  const t = await getTranslations("hub");

  return (
    <section className="mt-16">
      <SectionHead
        eyebrow={t("goBeyondEyebrow")}
        title={t("goBeyondTitle", { destination: destinationTitle })}
        actionHref="/destinations"
        actionLabel={t("allDestinations")}
      />
      <MobileScrollRow className="gap-5 pb-3 md:grid md:grid-cols-3 md:overflow-visible">
        {nearby.slice(0, 3).map((destination) => (
          <div key={destination.id} className="w-[82vw] shrink-0 md:w-auto">
            <DestinationCard destination={destination} />
          </div>
        ))}
      </MobileScrollRow>
    </section>
  );
}
