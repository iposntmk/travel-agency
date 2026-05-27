import Link from "next/link";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { href: "/tours", label: "All tours" },
      { href: "/free-tours", label: "Free tours" },
      { href: "/destinations", label: "Destinations" },
      { href: "/blog", label: "Travel blog" }
    ]
  },
  {
    heading: "Plan your trip",
    links: [
      { href: "/tours?type=private", label: "Private tours" },
      { href: "/tours?type=small-group", label: "Small group" },
      { href: "/destinations/hoi-an", label: "Hội An" },
      { href: "/destinations/hue", label: "Huế" },
      { href: "/destinations/da-nang", label: "Đà Nẵng" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-navy-100 bg-white">
      <div className="mx-auto max-w-page px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2" aria-label="TC Travel Vietnam home">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M3 12L11 4l3 3-5 5h11v2H9l5 5-3 3z" fill="currentColor" />
                </svg>
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-500">TC Travel</span>
                <span className="text-base font-semibold tracking-tight text-navy-900">Vietnam</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
              Private, small group, and free walking tours across Hội An, Huế, and Đà Nẵng. Book now,
              pay when you meet your guide.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-500">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 transition-colors hover:text-navy-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-500">Contact</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>WhatsApp · +84 000 000 000</li>
              <li>
                <a className="hover:text-navy-900" href="mailto:sales@example.com">
                  sales@example.com
                </a>
              </li>
              <li>Hội An · Huế · Đà Nẵng</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-navy-100 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} TC Travel Vietnam. Book Now — Pay Later.</p>
          <p>Local guides · Curated itineraries · Trusted by inbound travellers</p>
        </div>
      </div>
    </footer>
  );
}
