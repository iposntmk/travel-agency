import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tour, Destination } from "@/payload-types";
import { resolveImage } from "@/lib/media";
import { Price } from "@/components/currency/price";

interface TourListingCardProps {
  tour: Tour;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-300 text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 py-0.5">
      <span className="mt-0.5 shrink-0 text-base">{icon}</span>
      <div className="min-w-0 truncate text-[13px] leading-5 text-slate-500">
        <strong className="font-bold text-navy-900">{label} </strong>
        <span className={highlight ? "font-semibold text-brand-green" : ""}>{value}</span>
      </div>
    </div>
  );
}

export function TourListingCard({ tour }: TourListingCardProps) {
  const image = resolveImage(tour.featuredImage, tour.title, { variant: "card" });
  const destination =
    tour.destination && typeof tour.destination === "object"
      ? (tour.destination as Destination).title
      : null;
  const isFree = !tour.priceFrom || tour.priceFrom === 0;
  const href = `/tours/${tour.slug}`;

  const details = tour as Tour & {
    durationText?: string;
    routeSummary?: string;
    ratingAverage?: number;
    ratingCount?: number;
  };

  const tourTypeLabel = tour.tourType.replace(/-/g, " ");
  const operationLabel = tour.operationType?.replace(/-/g, " ") ?? "";

  return (
    <article className="group grid w-full max-w-full overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-card transition-all duration-300 hover:shadow-elevated sm:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr]">
      <Link
        href={href}
        className="relative block h-[260px] w-full overflow-hidden sm:h-full sm:min-h-[280px]"
      >
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 100vw, 380px"
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
        {destination ? (
          <span className="absolute left-0 top-0 z-[2] rounded-br-[5px] bg-brand-green px-2 py-1 text-[12px] font-bold uppercase text-white">
            {destination}
          </span>
        ) : null}
        {isFree ? (
          <span className="absolute right-0 top-0 z-[2] rounded-bl-[5px] bg-[#C65A3A] px-2 py-1 text-[12px] font-bold uppercase text-white">
            Free
          </span>
        ) : null}
      </Link>

      <div className="flex flex-col p-[18px] max-sm:p-4">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={href}
            className="line-clamp-2 text-[17px] font-bold leading-6 text-navy-900 transition-colors hover:text-brand-green max-sm:text-base max-sm:leading-[22px]"
          >
            {tour.title}
          </Link>
          {details.durationText ? (
            <span className="shrink-0 rounded-[5px] border border-brand-green px-2 py-0.5 text-[13px] font-bold text-brand-green">
              {details.durationText}
            </span>
          ) : null}
        </div>

        {details.ratingAverage && details.ratingCount ? (
          <div className="mt-2 mb-1 flex items-center gap-1">
            <StarRating rating={Math.round(details.ratingAverage)} />
            <span className="text-xs text-slate-400">
              ({String(details.ratingCount).padStart(2, "0")} Reviews)
            </span>
          </div>
        ) : null}

        {details.routeSummary ? (
          <InfoRow icon="📍" label="Route:" value={details.routeSummary} />
        ) : null}
        {operationLabel ? (
          <InfoRow icon="🗣️" label="Offered in:" value={operationLabel} />
        ) : null}
        <InfoRow icon="🗺️" label="Tour type:" value={tourTypeLabel} />
        {tour.season && tour.season !== "year-round" ? (
          <InfoRow
            icon="🌿"
            label="Season:"
            value={tour.season}
            highlight
          />
        ) : null}

        <div className="my-3 h-px bg-slate-100" />

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] text-brand-red">
              {isFree ? "Tips appreciated" : "From"}
            </span>
            {!isFree ? (
              <>
                <span className="text-lg font-bold leading-6 text-brand-red">
                  <Price base={tour.priceFrom ?? 0} />
                </span>
                <span className="text-[13px] text-slate-400">/pax</span>
              </>
            ) : null}
          </div>
          <Link
            href={href}
            className="inline-flex items-center rounded-[5px] bg-brand-green px-5 py-2 text-[13px] font-bold capitalize leading-5 text-white transition-colors hover:bg-brand-green-dark max-sm:min-h-[44px]"
          >
            View Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
