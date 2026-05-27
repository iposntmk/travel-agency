import Link from "next/link";
import { ShareButtons } from "@/components/share-buttons";
import type { Tour } from "@/payload-types";

interface Props {
  tour: Tour;
  tourUrl: string;
  isFree: boolean;
}

export function TourBookingAside({ tour, tourUrl, isFree }: Props) {
  return (
    <aside className="self-start rounded-2xl border border-navy-100 bg-white p-6 shadow-card md:sticky md:top-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">From</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-navy-950">
        {isFree ? "Free to join" : `$${tour.priceFrom}`}
        {!isFree ? (
          <span className="ml-2 text-sm font-medium text-slate-500">{tour.currency ?? "USD"}</span>
        ) : null}
      </p>
      {!isFree ? (
        <p className="mt-1 text-xs text-slate-500">Pay when you meet your guide — confirm details first.</p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">Tips appreciated, never required.</p>
      )}

      {tour.pricingTiers && tour.pricingTiers.length > 0 ? (
        <div className="mt-5 border-t border-navy-100 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
            Pricing tiers
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
            {tour.pricingTiers.map((tier) => (
              <li key={tier.id ?? tier.label} className="flex justify-between gap-2">
                <span>{tier.label}</span>
                <span className="font-semibold text-navy-900">${tier.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href={`/booking/${tour.slug}`}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-navy-800"
      >
        {isFree ? "Register" : "Request this tour"}
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {tour.availableDates && tour.availableDates.length > 0 ? (
        <div className="mt-6 border-t border-navy-100 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
            Upcoming dates
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
            {tour.availableDates.slice(0, 4).map((d) => (
              <li key={d.id ?? d.date}>{new Date(d.date).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 border-t border-navy-100 pt-5">
        <ShareButtons url={tourUrl} title={tour.title} medium="tour" campaignId={tour.slug} />
      </div>
    </aside>
  );
}
