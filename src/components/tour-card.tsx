import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      : null;
  const isFree = !tour.priceFrom || tour.priceFrom === 0;

  const href = ctaHref ?? `/tours/${tour.slug}`;
  const label = ctaLabel ?? (isFree ? "Register" : "View details");
  const details = tour as Tour & {
    durationText?: string;
    routeSummary?: string;
    ratingAverage?: number;
    ratingCount?: number;
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card transition-all duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-elevated">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-navy-50">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/30 via-navy-950/0 to-navy-950/0" />
        {destination ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy-900 shadow-card backdrop-blur">
            {destination}
          </span>
        ) : null}
        <span
          className={
            isFree
              ? "absolute right-3 top-3 inline-flex items-center rounded-full bg-[#C65A3A] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-card"
              : "absolute right-3 top-3 inline-flex items-center rounded-full bg-brand-green px-3 py-1 text-[11px] font-semibold text-white shadow-card"
          }
        >
          {isFree ? "Free" : `From $${tour.priceFrom}`}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
          {tour.tourType.replace(/-/g, " ")}
          {tour.season && tour.season !== "year-round" ? ` · ${tour.season}` : ""}
        </p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-navy-950">
          <Link href={href} className="transition-colors hover:text-navy-700">
            {tour.title}
          </Link>
        </h3>
        <div className="space-y-1 text-sm leading-6 text-slate-600">
          {details.routeSummary ? <p>{details.routeSummary}</p> : null}
          <p>
            {details.durationText ?? "Flexible timing"}
            {details.ratingAverage && details.ratingCount
              ? ` · ${details.ratingAverage.toFixed(1)} (${details.ratingCount})`
              : ""}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-sm font-medium text-slate-600">
            {isFree ? "Tips appreciated" : `${tour.currency ?? "USD"} · per person`}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            {label}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
