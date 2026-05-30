import Image from "next/image";
import Link from "next/link";
import type { PublicCarRental } from "@/lib/cms";
import { resolveImage } from "@/lib/media";

interface Props {
  rental: PublicCarRental;
}

export function CarRentalCard({ rental }: Props) {
  const image = resolveImage(rental.featuredImage as Parameters<typeof resolveImage>[0], rental.title, { variant: "card" });
  const route = [rental.routeFrom, rental.routeTo].filter(Boolean).join(" to ");

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
      <Link href={`/car-rentals/${rental.slug}`} className="relative block aspect-[4/3] bg-slate-100">
        <Image src={image.url} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
      </Link>
      <div className="space-y-3 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {rental.vehicleType?.replace(/-/g, " ") ?? "Private car"}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          <Link href={`/car-rentals/${rental.slug}`}>{rental.title}</Link>
        </h3>
        <p className="text-sm leading-6 text-slate-600">{route || "Flexible private transfer"}</p>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-sm font-semibold text-slate-900">
            {rental.priceFrom ? `From ${rental.currency ?? "USD"} ${rental.priceFrom}` : "Quote on request"}
          </span>
          <Link
            href={`/car-rentals/${rental.slug}`}
            className="rounded-full bg-[#047857] px-4 py-2 text-sm font-semibold text-white"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
