import Link from "next/link";
import { getSiteSettings } from "@/lib/cms";
import { getFooterNavigation } from "@/lib/cms-navigation";
import { SOCIAL_ICONS, type SocialPlatform } from "@/components/icons";
import type { NavItem } from "@/types/navigation";

export async function SiteFooter() {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getFooterNavigation()]);
  const columns = navigation.map(toFooterColumn).filter((column): column is FooterColumn => column.links.length > 0);
  const email = settings?.salesEmail ?? "hello@tctravel.example";
  const whatsapp = settings?.whatsapp ?? "+84-903-111-222";
  const address = settings?.footer?.address ?? "Hội An · Huế · Đà Nẵng · Quảng Trị";
  const company = settings?.footer?.companyName ?? "TC Travel Vietnam";
  const social = (settings?.social ?? []).filter((item) => item?.platform && item?.url);

  return (
    <footer className="border-t border-white/10 bg-[#0f0f0f] text-white">
      <div className="container-center py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div>
            <Link href="/" className="inline-flex items-center gap-2" aria-label="TC Travel Vietnam home">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--izitour-primary)] text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M3 12L11 4l3 3-5 5h11v2H9l5 5-3 3z" fill="currentColor" />
                </svg>
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">TC Travel</span>
                <span className="text-base font-semibold tracking-tight text-white">Vietnam</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
              Private, small group, and free walking tours across Hội An, Huế, Đà Nẵng, and Quảng Trị. Book now,
              pay when you meet your guide.
            </p>
            {social.length > 0 ? (
              <div className="mt-5 flex items-center gap-3">
                {social.map((item, index) => {
                  const Icon = SOCIAL_ICONS[item.platform as SocialPlatform] ?? null;
                  if (!Icon) return null;
                  return (
                    <a
                      key={`${item.platform}-${index}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label ?? item.platform}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-[var(--izitour-primary)] hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.target}
                      rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                      className="text-white/60 transition-colors hover:text-[var(--izitour-orange)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Contact</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>WhatsApp · {whatsapp}</li>
              <li>
                <a className="break-all hover:text-[var(--izitour-orange)]" href={`mailto:${email}`}>
                  {email}
                </a>
              </li>
              <li>{address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
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
