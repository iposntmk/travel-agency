import Image from "next/image";
import Link from "next/link";
import type { Tour, Destination } from "@/payload-types";
import { resolveImage } from "@/lib/media";

interface TourCardProps {
  tour: Tour;
  ctaHref?: string;
  ctaLabel?: string;
}

export function TourCard({ tour, ctaHref, ctaLabel }: TourCardProps) {
  const image = resolveImage(tour.featuredImage, tour.title, { variant: "card" });
  const destination =
    tour.destination && typeof tour.destination === "object"
      ? (tour.destination as Destination).title
      : "Vietnam";
  const isFree = !tour.priceFrom || tour.priceFrom === 0;

  const href = ctaHref ?? `/tours/${tour.slug}`;
  const label = ctaLabel ?? (isFree ? "Register" : "View details");

  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white">
      <Link href={href} className="relative block aspect-[16/10] bg-slate-100">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">{destination}</p>
        <h3 className="text-lg font-semibold leading-tight text-slate-950">
          <Link href={href}>{tour.title}</Link>
        </h3>
        <p className="text-sm text-slate-500">
          {tour.tourType.replace(/-/g, " ")}
          {tour.season && tour.season !== "year-round" ? ` · ${tour.season}` : ""}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-semibold text-slate-900">
            {isFree ? "Free to join" : `From $${tour.priceFrom} ${tour.currency ?? "USD"}`}
          </span>
          <Link
            className="rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            href={href}
          >
            {label}
          </Link>
        </div>
      </div>
    </article>
  );
}
