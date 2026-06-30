import Link from "next/link";
import type { Tour } from "@/payload-types";
import { Price } from "@/components/currency/price";

interface Props {
  tour: Tour;
}

export function TourPricingTable({ tour }: Props) {
  const tiers = tour.pricingTiers ?? [];
  const hasPricing = tiers.length > 0;

  return (
    <section id="prices" className="scroll-mt-20">
      <h2 className="font-display text-2xl font-bold tracking-tight text-navy-950">Prices</h2>

      {hasPricing ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          {/* Header */}
          <div className="grid grid-cols-4 bg-white p-3 text-sm font-bold text-[#00947d] border-b border-slate-200">
            <div>Group size</div>
            <div className="text-center">Sharing Twin/Double Room</div>
            <div className="text-center">Private Single Room</div>
            <div></div>
          </div>
          {/* Rows */}
          {tiers.map((tier, i) => (
            <div
              key={tier.id ?? i}
              className={`grid grid-cols-4 p-3 items-center text-sm ${i < tiers.length - 1 ? "border-b border-dashed border-slate-200" : ""}`}
            >
              <div className="text-navy-900">{tier.label}</div>
              <div className="text-center font-bold text-brand-red"><Price base={tier.price} /> /pax</div>
              <div className="text-center font-bold text-brand-red"><Price base={tier.price} /> /pax</div>
              <div className="flex justify-center">
                <Link
                  href={`/booking/${tour.slug}`}
                  className="inline-block rounded bg-brand-red px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                >
                  Send Inquiry
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 p-6 text-center">
          <p className="mb-3 text-sm text-slate-500">Prices vary by group size. Contact us for a personalized quote.</p>
          <Link
            href={`/booking/${tour.slug}`}
            className="inline-block rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          >
            Get a Quote
          </Link>
        </div>
      )}

      {/* Group Size 9+ note */}
      {hasPricing && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-base">👥</span>
            <span className="text-sm text-[#00947d]">
              Traveling with more than 8 people? You can select a different group size in the next step.
            </span>
          </div>
          <Link
            href={`/booking/${tour.slug}`}
            className="ml-4 shrink-0 rounded border border-[#00947d] px-4 py-2 text-sm font-bold text-[#00947d] hover:bg-[#00947d] hover:text-white transition-colors"
          >
            Group Size 9+
          </Link>
        </div>
      )}
    </section>
  );
}
