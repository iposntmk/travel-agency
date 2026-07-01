import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Cruise, Destination } from "@/payload-types";
import { resolveImage } from "@/lib/media";

interface CruiseCardProps {
  cruise: Cruise;
}

export async function CruiseCard({ cruise }: CruiseCardProps) {
  const t = await getTranslations("card");
  const image = resolveImage(cruise.featuredImage, cruise.title, { variant: "card" });
  const destination =
    cruise.destination && typeof cruise.destination === "object"
      ? (cruise.destination as Destination).title
      : null;
  const href = `/cruises/${cruise.slug}`;

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
        {cruise.priceFrom ? (
          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-brand-green px-3 py-1 text-[11px] font-semibold text-white shadow-card">
            {t("from")} ${cruise.priceFrom}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">
          {t("cruise")}
          {cruise.nights ? ` · ${t("nights", { count: cruise.nights })}` : ""}
        </p>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-navy-950">
          <Link href={href} className="transition-colors hover:text-navy-700">
            {cruise.title}
          </Link>
        </h3>
        <div className="space-y-1 text-sm leading-6 text-slate-600">
          {cruise.routeSummary ? <p>{cruise.routeSummary}</p> : null}
          <p>
            {cruise.durationText ?? t("flexibleDeparture")}
            {cruise.ratingAverage && cruise.ratingCount
              ? ` · ${cruise.ratingAverage.toFixed(1)} (${cruise.ratingCount})`
              : ""}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-sm font-medium text-slate-600">{cruise.currency ?? "USD"} · {t("perPerson")}</span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            {t("viewDetails")}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
