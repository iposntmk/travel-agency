"use client";

import { Calendar, ChevronDown, Compass, MapPin, Search, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SearchOption } from "./types";

type Tab = "tours" | "halong" | "mekong";

interface Props {
  starts: SearchOption[];
}

const TOUR_TYPES: SearchOption[] = [
  { label: "Private Tour", value: "paid-private" },
  { label: "Group Tour", value: "paid-group" },
  { label: "Family Tour", value: "family" },
  { label: "Adventure Tour", value: "adventure" },
  { label: "Cultural Tour", value: "cultural" }
];

const CRUISE_TYPES: SearchOption[] = [
  { label: "Luxury Cruise", value: "luxury" },
  { label: "Boutique Cruise", value: "boutique" },
  { label: "Private Cruise", value: "private" }
];

export function IzitourSearchForm({ starts }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("tours");
  const [start, setStart] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [style, setStyle] = useState("");
  const typeOptions = activeTab === "tours" ? TOUR_TYPES : CRUISE_TYPES;

  function reset(tab: Tab) {
    setActiveTab(tab);
    setStart("");
    setType("");
    setDuration("");
    setStyle("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (start) params.set("destination", start);
    if (type) params.set(activeTab === "tours" ? "tourType" : "type", type);
    if (duration) params.set("duration", duration);
    if (style) params.set("style", style);
    const base = activeTab === "tours" ? "/tours" : "/cruises";
    window.location.href = params.size > 0 ? `${base}?${params.toString()}` : base;
  }

  return (
    <section className="relative z-30 mx-auto w-full max-w-[1400px] px-3 sm:px-4 lg:px-6">
      <div className="hidden -mt-16 w-full lg:block">
        <Tabs activeTab={activeTab} reset={reset} />
        <div className="rounded-b-xl rounded-tr-xl border border-[var(--izitour-border)]/50 bg-white p-6 shadow-lg">
          <form onSubmit={submit} className="grid grid-cols-[1.2fr_1.2fr_1.2fr_1.2fr_0.8fr] items-center gap-4">
            <SearchField icon={<MapPin />} value={start} setValue={setStart} placeholder="Start From" options={starts} />
            <SearchField icon={<Users />} value={type} setValue={setType} placeholder={activeTab === "tours" ? "Tour type" : "Cruise type"} options={typeOptions} />
            <SearchField icon={<Calendar />} value={duration} setValue={setDuration} placeholder="Duration" options={durationOptions(activeTab)} />
            <SearchField icon={<Compass />} value={style} setValue={setStyle} placeholder="Travel style" options={styleOptions()} />
            <SubmitButton />
          </form>
        </div>
      </div>
      <form onSubmit={submit} className="block -mt-10 w-full lg:hidden">
        <Tabs activeTab={activeTab} reset={reset} mobile />
        <div className="space-y-3.5 rounded-b-xl border border-[var(--izitour-border)]/50 bg-white p-4 shadow-xl">
          <SearchField icon={<MapPin />} value={start} setValue={setStart} placeholder="Start From" options={starts} />
          <SearchField icon={<Users />} value={type} setValue={setType} placeholder="Tour type" options={typeOptions} />
          <SearchField icon={<Calendar />} value={duration} setValue={setDuration} placeholder="Duration" options={durationOptions(activeTab)} />
          <SubmitButton full />
        </div>
      </form>
    </section>
  );
}

function Tabs({ activeTab, reset, mobile = false }: { activeTab: Tab; reset: (tab: Tab) => void; mobile?: boolean }) {
  const tabs: Array<{ key: Tab; label: string; mobileLabel: string }> = [
    { key: "tours", label: "Tours", mobileLabel: "Tours" },
    { key: "halong", label: "Halong Bay Cruises", mobileLabel: "Halong Bay" },
    { key: "mekong", label: "Mekong River Cruises", mobileLabel: "Mekong River" }
  ];
  return (
    <div className={cn("flex overflow-hidden rounded-t-xl bg-[#0f2421] text-xs font-bold uppercase tracking-wider text-white", !mobile && "max-w-2xl")}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => reset(tab.key)}
          className={cn("border-r border-[#1a3834] px-3 py-3.5 text-center transition last:border-r-0", mobile ? "flex-1 text-[11px]" : "px-8", activeTab === tab.key ? "bg-white text-[var(--izitour-primary)]" : "text-white/80 hover:bg-white/5")}
        >
          {mobile ? tab.mobileLabel : tab.label}
        </button>
      ))}
    </div>
  );
}

function SearchField({ icon, value, setValue, placeholder, options }: { icon: ReactNode; value: string; setValue: (value: string) => void; placeholder: string; options: SearchOption[] }) {
  return (
    <div className="relative flex h-12 items-center rounded-lg border border-[var(--izitour-border)] bg-white px-3 max-sm:h-[52px]">
      <span className="mr-2 text-[var(--izitour-text-light)]">{icon}</span>
      <select value={value} onChange={(event) => setValue(event.target.value)} className="w-full appearance-none bg-transparent pr-8 text-sm font-medium text-[var(--izitour-text)] outline-none max-sm:text-[15px]">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-[var(--izitour-text-light)]" />
    </div>
  );
}

function SubmitButton({ full = false }: { full?: boolean }) {
  return (
    <button type="submit" className={cn("flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--izitour-orange)] px-6 text-sm font-bold text-white shadow transition hover:bg-[var(--izitour-orange-dark)]", full && "w-full max-sm:h-[52px]")}>
      <Search className="size-4" /> Search
    </button>
  );
}

function durationOptions(tab: Tab): SearchOption[] {
  return tab === "tours"
    ? [{ label: "1-5 Days", value: "1-5" }, { label: "6-10 Days", value: "6-10" }, { label: "11-15 Days", value: "11-15" }, { label: "16+ Days", value: "16" }]
    : [{ label: "Day Trip", value: "1" }, { label: "2 Days 1 Night", value: "2" }, { label: "3 Days 2 Nights", value: "3" }];
}

function styleOptions(): SearchOption[] {
  return ["Classic", "Culture", "Nature", "Beach", "Culinary"].map((value) => ({ label: value, value: value.toLowerCase() }));
}
