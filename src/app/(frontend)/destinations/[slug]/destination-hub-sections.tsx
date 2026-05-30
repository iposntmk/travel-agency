import { BlogCard } from "@/components/blog-card";
import { CarRentalCard } from "@/components/car-rental-card";
import { MobileScrollRow } from "@/components/mobile-scroll-row";
import { SectionHead } from "@/components/section";
import type { DestinationHub } from "@/lib/cms";

interface Props {
  hub: DestinationHub;
}

export function DestinationHubSections({ hub }: Props) {
  const { destination, carRentals, guides, attractions } = hub;

  return (
    <>
      {carRentals.length > 0 ? (
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
      ) : null}

      {guides.length > 0 ? (
        <section className="mt-16">
          <SectionHead eyebrow="Travel guide" title={`${destination.title} guide`} actionHref="/blog" actionLabel="All guides" />
          <MobileScrollRow className="gap-5 pb-3 md:grid md:grid-cols-3 md:overflow-visible">
            {guides.slice(0, 3).map((post) => (
              <div key={post.id} className="w-[82vw] shrink-0 md:w-auto">
                <BlogCard post={post} />
              </div>
            ))}
          </MobileScrollRow>
        </section>
      ) : null}

      {attractions.length > 0 ? (
        <section className="mt-16">
          <SectionHead eyebrow="Highlights" title={`Attractions in ${destination.title}`} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attractions.map((attraction) => (
              <article key={attraction.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-950">{attraction.title}</h3>
                {attraction.summary ? <p className="mt-2 text-sm leading-6 text-slate-600">{attraction.summary}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
