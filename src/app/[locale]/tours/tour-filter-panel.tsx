import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Destination } from "@/payload-types";
import { queryString, SEASONS, TOUR_TYPES, type ToursPageQuery } from "./query";

interface TourFilterPanelProps {
  destinations: Destination[];
  query: ToursPageQuery;
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={
        active
          ? "inline-flex items-center rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-card"
          : "inline-flex items-center rounded-full border border-navy-100 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-900"
      }
    >
      {label}
    </Link>
  );
}

function FilterGroup({ label, children, collapsible = false }: {
  label: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  if (collapsible) {
    return (
      <details className="group">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500 select-none hover:text-navy-700">
          {label}
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">{children}</div>
      </details>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-500">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const DURATION_VALUES = ["1", "3", "7"] as const;
const GROUP_SIZE_VALUES = ["2", "4", "8"] as const;
const SORT_VALUES = ["featured", "price", "rating", "duration"] as const;

export async function TourFilterPanel({ destinations, query }: TourFilterPanelProps) {
  const [t, tCommon] = await Promise.all([getTranslations("tours"), getTranslations("common")]);
  const hasFilters = Boolean(query.q || query.destination || query.type || query.season || query.operation || query.priceMax || query.duration || query.groupSize || query.rating || query.sort);

  return (
    <section
      aria-label={t("filterAria")}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:p-6"
    >
      <form action="/tours" method="get" className="flex flex-wrap items-center gap-2">
        {query.destination ? <input type="hidden" name="destination" value={query.destination} /> : null}
        {query.type ? <input type="hidden" name="type" value={query.type} /> : null}
        {query.season ? <input type="hidden" name="season" value={query.season} /> : null}
        {query.sort ? <input type="hidden" name="sort" value={query.sort} /> : null}
        <input
          type="text"
          name="q"
          defaultValue={query.q ?? ""}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-10 flex-1 rounded-full border border-navy-100 bg-white px-4 text-sm text-navy-900 outline-none transition focus:border-navy-300 focus:ring-2 focus:ring-navy-200"
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-full bg-brand-green px-5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
        >
          {tCommon("search")}
        </button>
      </form>

      <FilterGroup label={t("group.destination")}>
        <Chip
          href={`/tours${queryString(query, { destination: undefined })}`}
          label={t("all")}
          active={!query.destination}
        />
        {destinations.map((d) => (
          <Chip
            key={d.id}
            href={`/tours${queryString(query, { destination: d.slug })}`}
            label={d.title}
            active={query.destination === d.slug}
          />
        ))}
      </FilterGroup>

      <FilterGroup label={t("group.tourType")}>
        <Chip
          href={`/tours${queryString(query, { type: undefined })}`}
          label={t("all")}
          active={!query.type}
        />
        {TOUR_TYPES.map((item) => (
          <Chip
            key={item.value}
            href={`/tours${queryString(query, { type: item.value })}`}
            label={t(`type.${item.value}`)}
            active={query.type === item.value}
          />
        ))}
      </FilterGroup>

      <FilterGroup label={t("group.season")}>
        <Chip
          href={`/tours${queryString(query, { season: undefined })}`}
          label={t("all")}
          active={!query.season}
        />
        {SEASONS.map((s) => (
          <Chip
            key={s.value}
            href={`/tours${queryString(query, { season: s.value })}`}
            label={t(`season.${s.value}`)}
            active={query.season === s.value}
          />
        ))}
      </FilterGroup>

      <FilterGroup label={t("group.duration")} collapsible>
        <Chip href={`/tours${queryString(query, { duration: undefined })}`} label={t("any")} active={!query.duration} />
        {DURATION_VALUES.map((value) => (
          <Chip
            key={value}
            href={`/tours${queryString(query, { duration: value })}`}
            label={t(`durationOpt.${value}`)}
            active={query.duration === Number(value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label={t("group.groupSize")} collapsible>
        <Chip href={`/tours${queryString(query, { groupSize: undefined })}`} label={t("any")} active={!query.groupSize} />
        {GROUP_SIZE_VALUES.map((value) => (
          <Chip
            key={value}
            href={`/tours${queryString(query, { groupSize: value })}`}
            label={t(`groupSizeOpt.${value}`)}
            active={query.groupSize === Number(value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label={t("group.sort")}>
        {SORT_VALUES.map((value) => (
          <Chip
            key={value}
            href={`/tours${queryString(query, { sort: value === "featured" ? undefined : value })}`}
            label={t(`sortOpt.${value}`)}
            active={value === "featured" ? !query.sort : query.sort === value}
          />
        ))}
        <Chip href={`/tours${queryString(query, { rating: "4" })}`} label={t("ratingFilter")} active={query.rating === 4} />
      </FilterGroup>

      {hasFilters ? (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">{t("showingFiltered")}</p>
          <Link
            href="/tours"
            className="inline-flex items-center gap-1 rounded-full border border-navy-100 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
          >
            {t("clearFilters")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
