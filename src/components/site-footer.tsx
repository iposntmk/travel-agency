import Link from "next/link";
import { getSiteSettings } from "@/lib/cms";
import { getFooterNavigation } from "@/lib/cms-navigation";
import type { NavItem } from "@/types/navigation";

export async function SiteFooter() {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getFooterNavigation()]);
  const columns = navigation.map(toFooterColumn).filter((column): column is FooterColumn => column.links.length > 0);
  const email = settings?.salesEmail ?? "hello@tctravel.example";
  const whatsapp = settings?.whatsapp ?? "+84-903-111-222";
  const address = settings?.footer?.address ?? "Hội An · Huế · Đà Nẵng · Quảng Trị";
  const company = settings?.footer?.companyName ?? "TC Travel Vietnam";

  return (
    <footer className="mt-20 border-t border-navy-100 bg-white">
      <div className="mx-auto max-w-page px-4 py-12">
        <div className="grid gap-10 md:grid-cols-5">
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
              Private, small group, and free walking tours across Hội An, Huế, Đà Nẵng, and Quảng Trị. Book now,
              pay when you meet your guide.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-500">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.target}
                      rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
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
              <li>WhatsApp · {whatsapp}</li>
              <li>
                <a className="hover:text-navy-900" href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
              <li>{address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-navy-100 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {company}. Book Now — Pay Later.</p>
          <p>Local guides · Curated itineraries · Trusted by inbound travellers</p>
        </div>
      </div>
    </footer>
  );
}

type FooterColumn = {
  heading: string;
  links: Array<NavItem & { href: string }>;
};

function toFooterColumn(item: NavItem): FooterColumn {
  const links = (item.children ?? (item.href ? [item] : [])).filter(
    (link): link is NavItem & { href: string } => Boolean(link.href)
  );
  return { heading: item.label, links };
}
