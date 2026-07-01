"use client";

import { Calendar, ChevronDown, Compass, MapPin, Search, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SearchConfig, SearchOption, SearchTab } from "./types";

type Translate = (key: string) => string;

interface Props {
  starts: SearchOption[];
  config?: SearchConfig;
}

// Built-in fallbacks. Labels are translated via the `search` message group;
// values must stay stable (used for URL params + product-category slugs, see
// scripts/seed.ts). Used when SiteSettings → searchForm leaves a list empty.
const DEFAULT_TAB_TARGETS: { key: string; target: SearchTab["target"] }[] = [
  { key: "tours", target: "tours" },
  { key: "halongCruises", target: "cruises" },
  { key: "mekongCruises", target: "cruises" }
];
const DEFAULT_TOUR_TYPE_VALUES = ["paid-private", "paid-group", "family", "adventure", "cultural"] as const;
const DEFAULT_DURATION_VALUES = ["1-5", "6-10", "11-15", "16-"] as const;
const DEFAULT_CRUISE_NIGHT_VALUES = ["1", "2", "3"] as const;
const DEFAULT_STYLE_VALUES = ["culture", "food", "family", "adventure", "nature", "history"] as const;

function withDefaults(t: Translate, config?: SearchConfig): Required<SearchConfig> {
  return {
    tabs: config?.tabs?.length
      ? config.tabs
      : DEFAULT_TAB_TARGETS.map(({ key, target }) => ({ label: t(`tabs.${key}`), target })),
    tourTypes: config?.tourTypes?.length
      ? config.tourTypes
      : DEFAULT_TOUR_TYPE_VALUES.map((value) => ({ label: t(`tourTypes.${value}`), value })),
    tourDurations: config?.tourDurations?.length
      ? config.tourDurations
      : DEFAULT_DURATION_VALUES.map((value) => ({ label: t(`durations.${value}`), value })),
    cruiseNights: config?.cruiseNights?.length
      ? config.cruiseNights
      : DEFAULT_CRUISE_NIGHT_VALUES.map((value) => ({ label: t(`cruiseNights.${value}`), value })),
    styles: config?.styles?.length
      ? config.styles
      : DEFAULT_STYLE_VALUES.map((value) => ({ label: t(`styles.${value}`), value }))
  };
}

export function TcTravelSearchForm({ starts, config }: Props) {
  const t = useTranslations("search");
  const resolved = withDefaults(t, config);
  const [activeIndex, setActiveIndex] = useState(0);
  const [start, setStart] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [style, setStyle] = useState("");

  const activeTab = resolved.tabs[activeIndex] ?? resolved.tabs[0];
  const isTours = activeTab.target === "tours";

  function reset(index: number) {
    setActiveIndex(index);
    setStart("");
    setType("");
    setDuration("");
    setStyle("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (start) params.set("destination", start);

    if (isTours) {
      if (type) params.set("type", type);
      if (duration) {
        const [min, max] = duration.split("-");
        if (min) params.set("durationMin", min);
        if (max) params.set("duration", max);
      }
      if (style) params.set("category", style);
      window.location.href = params.size > 0 ? `/tours?${params.toString()}` : "/tours";
      return;
    }

    // Cruises — backend only filters by destination + nights.
    if (duration) params.set("nights", duration);
    window.location.href = params.size > 0 ? `/cruises?${params.toString()}` : "/cruises";
  }

  return (
    <section className="relative z-40 mx-auto w-full max-w-[1400px] px-3 sm:px-4 lg:px-6">
      <div className="-mt-16 w-full">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <Tabs tabs={resolved.tabs} activeIndex={activeIndex} reset={reset} />
          <div className="bg-white p-4 sm:p-6">
            <form
              onSubmit={submit}
              className={cn(
                "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4",
                isTours ? "lg:grid-cols-[1fr_1fr_1fr_1fr_auto]" : "lg:grid-cols-[1fr_1fr_auto]"
              )}
            >
              <SearchField icon={<MapPin />} value={start} setValue={setStart} placeholder={t("startFrom")} options={starts} />
              {isTours ? (
                <SearchField icon={<Users />} value={type} setValue={setType} placeholder={t("tourType")} options={resolved.tourTypes} />
              ) : null}
              <SearchField
                icon={<Calendar />}
                value={duration}
                setValue={setDuration}
                placeholder={t("duration")}
                options={isTours ? resolved.tourDurations : resolved.cruiseNights}
              />
              {isTours ? (
                <SearchField icon={<Compass />} value={style} setValue={setStyle} placeholder={t("travelStyle")} options={resolved.styles} />
              ) : null}
              <SubmitButton full label={t("submit")} />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tabs({ tabs, activeIndex, reset }: { tabs: SearchTab[]; activeIndex: number; reset: (index: number) => void }) {
  return (
    <div className="flex bg-gradient-to-r from-black/80 via-black/60 to-black/80 text-xs font-bold uppercase tracking-wider">
      {tabs.map((tab, index) => (
        <button
          key={`${tab.label}-${index}`}
          type="button"
          onClick={() => reset(index)}
          className={cn(
            "flex-1 px-3 py-3.5 text-center transition sm:flex-none sm:px-8",
            activeIndex === index
              ? "bg-white text-[var(--tctravel-primary)]"
              : "bg-transparent text-white hover:bg-white/20"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function SearchField({ icon, value, setValue, placeholder, options }: { icon: ReactNode; value: string; setValue: (value: string) => void; placeholder: string; options: SearchOption[] }) {
  return (
    <div className="relative flex h-12 items-center rounded-lg border border-[var(--tctravel-border)] bg-white px-3 max-sm:h-[52px]">
      <span className="mr-2 text-[var(--tctravel-text-light)]">{icon}</span>
      <select value={value} onChange={(event) => setValue(event.target.value)} className="w-full appearance-none bg-transparent pr-8 text-sm font-medium text-[var(--tctravel-text)] outline-none max-sm:text-[15px]">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-[var(--tctravel-text-light)]" />
    </div>
  );
}

function SubmitButton({ full = false, label }: { full?: boolean; label: string }) {
  return (
    <button type="submit" className={cn("flex h-12 items-center justify-center gap-2 rounded-lg border-0 bg-[var(--tctravel-orange)] px-6 text-sm font-bold text-white shadow transition hover:bg-[var(--tctravel-orange-dark)]", full && "w-full max-sm:h-[52px]")}>
      <Search className="size-4" /> {label}
    </button>
  );
}
