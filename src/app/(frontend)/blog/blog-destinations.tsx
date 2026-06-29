import Image from "next/image";
import Link from "next/link";
import { SectionHead } from "@/components/section";
import { resolveImage } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Destination } from "@/payload-types";

interface BlogDestinationsProps {
  destinations: Destination[];
}

export function BlogDestinations({ destinations }: BlogDestinationsProps) {
  if (destinations.length === 0) return null;
  const tiles = destinations.slice(0, 7);

  return (
    <section className="bg-mist py-12 md:py-16">
      <div className="mx-auto max-w-page px-4">
        <SectionHead
          eyebrow="Place to go"
          title="Explore Central Vietnam by destination"
          subtitle="Pick a base city and dig into the guides, food, and attractions around it."
          actionHref="/destinations"
          actionLabel="All destinations"
        />
        <div className="grid auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[180px] lg:grid-cols-4">
          {tiles.map((destination, index) => {
            const image = resolveImage(destination.featuredImage, destination.title, { variant: "card" });
            const isLead = index === 0;
            return (
              <Link
                key={destination.id}
                href={`/destinations/${destination.slug}`}
                className={cn(
                  "group relative block overflow-hidden rounded-2xl bg-navy-50 shadow-card",
                  isLead ? "col-span-2 row-span-2" : ""
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes={isLead ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.06]"
                  style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent" />
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 p-4 font-display font-bold text-white drop-shadow-sm",
                    isLead ? "text-2xl md:text-3xl" : "text-lg"
                  )}
                >
                  {destination.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
