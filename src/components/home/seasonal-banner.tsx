import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSeasonalCampaign } from "@/lib/seasonality";

export function SeasonalBanner() {
  const campaign = getSeasonalCampaign();

  return (
    <section className="bg-navy-950 text-white">
      <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:py-7">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
            {campaign.eyebrow}
          </p>
          <p className="mt-1 font-display text-lg font-semibold tracking-tight md:text-xl">
            {campaign.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-navy-100">{campaign.subtitle}</p>
        </div>
        <Link
          href={campaign.ctaHref}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 text-sm font-semibold text-navy-950 shadow-elevated transition hover:bg-navy-50"
        >
          {campaign.ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
