import Link from "next/link";
import { MobileScrollRow } from "@/components/mobile-scroll-row";

interface Props {
  slug: string;
  isFree: boolean;
  currency?: string | null;
  priceFrom?: number | null;
}

export function TourMobileTabs() {
  return (
    <MobileScrollRow
      as="nav"
      className="sticky top-[65px] z-20 -mx-4 gap-4 border-y border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur md:hidden"
    >
      <a href="#overview">Overview</a>
      <a href="#itinerary">Itinerary</a>
      <a href="#price">Price</a>
      <a href="#reviews">Reviews</a>
    </MobileScrollRow>
  );
}

export function TourMobileBottomCta({ slug, isFree, currency, priceFrom }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-elevated md:hidden">
      <div className="mx-auto flex max-w-page items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">From</p>
          <p className="font-semibold text-slate-950">{isFree ? "Free" : `${currency ?? "USD"} ${priceFrom ?? ""}`}</p>
        </div>
        <Link href={`/booking/${slug}`} className="rounded-full bg-[#047857] px-5 py-3 text-sm font-semibold text-white">
          Request this tour
        </Link>
      </div>
    </div>
  );
}
