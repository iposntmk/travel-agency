"use client";

import { Calendar, ChevronDown, Compass, MapPin, Search, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SearchConfig, SearchOption, SearchTab } from "./types";

interface Props {
  starts: SearchOption[];
  config?: SearchConfig;
}

// Built-in fallbacks. Used when SiteSettings → searchForm leaves a list empty.
const DEFAULT_TABS: SearchTab[] = [
  { label: "Tours", target: "tours" },
  { label: "Halong Bay Cruises", target: "cruises" },
  { label: "Mekong River Cruises", target: "cruises" }
];

const DEFAULT_TOUR_TYPES: SearchOption[] = [
  { label: "Private Tour", value: "paid-private" },
  { label: "Group Tour", value: "paid-group" },
  { label: "Family Tour", value: "family" },
  { label: "Adventure Tour", value: "adventure" },
  { label: "Cultural Tour", value: "cultural" }
];

const DEFAULT_TOUR_DURATIONS: SearchOption[] = [
  { label: "1-5 Days", value: "1-5" },
  { label: "6-10 Days", value: "6-10" },
  { label: "11-15 Days", value: "11-15" },
  { label: "16+ Days", value: "16-" }
];

const DEFAULT_CRUISE_NIGHTS: SearchOption[] = [
  { label: "1 Night", value: "1" },
  { label: "2 Nights", value: "2" },
  { label: "3 Nights", value: "3" }
];

// Values must match product-category slugs (see scripts/seed.ts).
const DEFAULT_STYLES: SearchOption[] = [
  { label: "Culture", value: "culture" },
  { label: "Food", value: "food" },
  { label: "Family", value: "family" },
  { label: "Adventure", value: "adventure" },
  { label: "Nature", value: "nature" },
  { label: "History", value: "history" }
];

function withDefaults(config?: SearchConfig): Required<SearchConfig> {
  return {
    tabs: config?.tabs?.length ? config.tabs : DEFAULT_TABS,
    tourTypes: config?.tourTypes?.length ? config.tourTypes : DEFAULT_TOUR_TYPES,
    tourDurations: config?.tourDurations?.length ? config.tourDurations : DEFAULT_TOUR_DURATIONS,
    cruiseNights: config?.cruiseNights?.length ? config.cruiseNights : DEFAULT_CRUISE_NIGHTS,
    styles: config?.styles?.length ? config.styles : DEFAULT_STYLES
  };
}

export function TcTravelSearchForm({ starts, config }: Props) {
  const resolved = withDefaults(config);
  const [activeIndex, setActiveIndex] = useState(0);
  const [start, setStart] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [style, setStyle] = useState("");

  const activeTab = resolved.tabs[activeIndex] ?? resolved.tabs[0] ?? DEFAULT_TABS[0];
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
              <SearchField icon={<MapPin />} value={start} setValue={setStart} placeholder="Start From" options={starts} />
              {isTours ? (
                <SearchField icon={<Users />} value={type} setValue={setType} placeholder="Tour type" options={resolved.tourTypes} />
              ) : null}
              <SearchField
                icon={<Calendar />}
                value={duration}
                setValue={setDuration}
                placeholder="Duration"
                options={isTours ? resolved.tourDurations : resolved.cruiseNights}
              />
              {isTours ? (
                <SearchField icon={<Compass />} value={style} setValue={setStyle} placeholder="Travel style" options={resolved.styles} />
              ) : null}
              <SubmitButton full />
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

function SubmitButton({ full = false }: { full?: boolean }) {
  return (
    <button type="submit" className={cn("flex h-12 items-center justify-center gap-2 rounded-lg border-0 bg-[var(--tctravel-orange)] px-6 text-sm font-bold text-white shadow transition hover:bg-[var(--tctravel-orange-dark)]", full && "w-full max-sm:h-[52px]")}>
      <Search className="size-4" /> Search
    </button>
  );
}
