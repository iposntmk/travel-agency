import { Link } from "@/i18n/navigation";
import { ShareButtons } from "@/components/share-buttons";
import type { Tour } from "@/payload-types";
import { ActiveCurrencyCode, Price } from "@/components/currency/price";

interface Props {
  tour: Tour;
  tourUrl: string;
  isFree: boolean;
}

export function TourBookingAside({ tour, tourUrl, isFree }: Props) {
  const duration = tour.durationText || (tour.durationDays ? `${tour.durationDays} day${tour.durationDays > 1 ? "s" : ""}` : null);
  const tiers = tour.pricingTiers ?? [];

  return (
    <aside className="self-start space-y-4">
      {/* Price card */}
      <div className="rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-navy-950">Select Date and Travelers</h3>
        <input
          type="date"
          className="mb-4 w-full rounded border border-slate-200 px-3 py-2 text-sm text-navy-900"
        />

        <p className="mb-3 text-sm font-bold text-navy-950">Price per pax in <ActiveCurrencyCode fallback="USD" /></p>
        {tiers.length > 0 ? (
          <div className="mb-4 space-y-3">
            {tiers.slice(0, 2).map((tier) => (
              <div key={tier.id ?? tier.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{tier.label}</span>
                <span className="text-base font-bold text-brand-red"><Price base={tier.price} /></span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Adult</span>
              <span className="text-base font-bold text-brand-red">{isFree ? "Free" : <Price base={tour.priceFrom ?? 0} />}</span>
            </div>
          </div>
        )}

        <Link
          href={`/booking/${tour.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded bg-[#fb6a00] px-4 py-3 text-sm font-bold text-white shadow-card transition hover:bg-[#e05e00]"
        >
          View Prices
        </Link>

        <p className="mt-3 text-center text-xs text-slate-400">Free cancellation up to 48 hours before departure</p>
      </div>

      {/* Quick info */}
      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="mb-3 text-sm font-bold text-navy-950">Quick Info</h3>
        <div className="space-y-2 text-sm">
          {duration && (
            <div className="flex justify-between">
              <span className="text-slate-400">Duration</span>
              <span className="font-semibold text-navy-900">{duration}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Tour type</span>
            <span className="font-semibold text-navy-900">{tour.tourType.replace(/-/g, " ")}</span>
          </div>
          {tour.season && tour.season !== "year-round" && (
            <div className="flex justify-between">
              <span className="text-slate-400">Season</span>
              <span className="font-semibold text-navy-900">{tour.season}</span>
            </div>
          )}
          {tour.groupSizeMax && (
            <div className="flex justify-between">
              <span className="text-slate-400">Max group</span>
              <span className="font-semibold text-navy-900">{tour.groupSizeMax} people</span>
            </div>
          )}
          {tour.ratingAverage && tour.ratingAverage > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Rating</span>
              <span className="font-semibold text-navy-900">
                {"★".repeat(Math.round(tour.ratingAverage))} {tour.ratingAverage.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp help */}
      <div className="rounded-xl border border-slate-200 p-5 text-center">
        <p className="mb-2 text-sm text-slate-600">Need help planning your trip?</p>
        <a
          href="https://web.whatsapp.com/send?phone=+84382536266"
          target="_blank"
          rel="nofollow"
          className="inline-block rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1da851] transition-colors"
        >
          WhatsApp Us
        </a>
      </div>

      {/* Share */}
      <div className="rounded-xl border border-slate-200 p-5">
        <ShareButtons url={tourUrl} title={tour.title} medium="tour" campaignId={tour.slug} />
      </div>
    </aside>
  );
}
