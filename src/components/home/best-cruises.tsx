import { CruiseCard } from "@/components/cruise-card";
import { MobileScrollRow } from "@/components/mobile-scroll-row";
import { SectionBand, SectionHead } from "@/components/section";
import type { Cruise } from "@/payload-types";

interface BestCruisesProps {
  cruises: Cruise[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function BestCruises({ cruises, eyebrow, title, subtitle, actionLabel, actionHref }: BestCruisesProps) {
  if (cruises.length === 0) return null;

  return (
    <SectionBand>
      <SectionHead
        eyebrow={eyebrow ?? "On the water"}
        title={title ?? "Best Cruises"}
        subtitle={
          subtitle ??
          "Overnight bay and river cruises with cabins, meals, and onboard activities — Book Now · Pay Later."
        }
        actionHref={actionHref ?? "/cruises"}
        actionLabel={actionLabel ?? "View all cruises"}
      />
      <MobileScrollRow className="gap-5 pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {cruises.map((cruise) => (
          <div key={cruise.id} className="w-[82vw] shrink-0 sm:w-auto">
            <CruiseCard cruise={cruise} />
          </div>
        ))}
      </MobileScrollRow>
    </SectionBand>
  );
}
