import { Search } from "lucide-react";

interface BlogHeroProps {
  query?: string;
}

export function BlogHero({ query }: BlogHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 420px at 80% -10%, rgba(74,144,217,0.35), transparent 60%), radial-gradient(760px 460px at 0% 120%, rgba(15,103,177,0.45), transparent 55%)"
        }}
      />
      <div className="relative mx-auto max-w-page px-4 py-16 text-center md:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-100 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
          Stories from the ground
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          The Most Useful Travel Guide for Central Vietnam
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-navy-100 md:text-lg">
          Local guides, season-by-season tips, and honest stories from our team in Hội An, Huế, and Đà Nẵng.
        </p>

        <form
          action="/blog"
          method="get"
          role="search"
          className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-white/15 bg-white/95 p-2 shadow-elevated"
        >
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <input
            id="blog-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search destinations, food, attractions…"
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white transition hover:bg-navy-800"
          >
            <Search className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
