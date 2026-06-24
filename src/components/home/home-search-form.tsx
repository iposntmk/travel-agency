"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Destination } from "@/payload-types";
import { TOUR_TYPES } from "@/app/(frontend)/tours/query";

interface HomeSearchFormProps {
  destinations: Pick<Destination, "id" | "slug" | "title">[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function HomeSearchForm({ destinations, eyebrow, title, subtitle }: HomeSearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = keyword.trim();
    if (trimmed) params.set("q", trimmed);
    if (destination) params.set("destination", destination);
    if (type) params.set("type", type);
    const search = params.toString();
    router.push(search ? `/tours?${search}` : "/tours");
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-page px-4">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card md:p-6">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">{eyebrow}</p>
          ) : null}
          {title ? (
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
              {title}
            </h2>
          ) : null}
          {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p> : null}

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <label className="flex flex-col gap-1">
              <span className="sr-only">Keyword</span>
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search tours by keyword"
                className="h-11 rounded-full border border-navy-100 bg-white px-4 text-sm text-navy-900 outline-none transition focus:border-navy-300 focus:ring-2 focus:ring-navy-200"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="sr-only">Destination</span>
              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="h-11 rounded-full border border-navy-100 bg-white px-4 text-sm text-navy-900 outline-none transition focus:border-navy-300 focus:ring-2 focus:ring-navy-200"
              >
                <option value="">All destinations</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.slug}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="sr-only">Tour type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="h-11 rounded-full border border-navy-100 bg-white px-4 text-sm text-navy-900 outline-none transition focus:border-navy-300 focus:ring-2 focus:ring-navy-200"
              >
                <option value="">All tour types</option>
                {TOUR_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-green px-6 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
            >
              <Search className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
