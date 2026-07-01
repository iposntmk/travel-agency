import { Link } from "@/i18n/navigation";
import { Mail, Phone, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms";
import { getFooterNavigation } from "@/lib/cms-navigation";
import { SOCIAL_ICONS, type SocialPlatform } from "@/components/icons";
import { FooterNewsletter } from "@/components/footer-newsletter";
import type { NavItem } from "@/types/navigation";

export async function SiteFooter() {
  const [settings, navigation, t] = await Promise.all([
    getSiteSettings(),
    getFooterNavigation(),
    getTranslations("footer")
  ]);
  const columns = navigation.map(toFooterColumn).filter((column): column is FooterColumn => column.links.length > 0);
  const email = settings?.salesEmail ?? "hello@tctravel.example";
  const whatsapp = settings?.whatsapp ?? "+84-903-111-222";
  const address = settings?.footer?.address ?? "Hội An · Huế · Đà Nẵng · Quảng Trị";
  const company = settings?.footer?.companyName ?? "TC Travel Vietnam";
  const social = (settings?.social ?? []).filter((item) => item?.platform && item?.url);

  return (
    <footer className="border-t border-[#1a3834] bg-[#0c1f1c] text-white">
      <div className="container-center py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="block" aria-label="TC Travel Vietnam home">
              <span className="text-2xl font-black tracking-tight text-[var(--tctravel-primary)]">TC</span>
              <span className="ml-1 text-sm font-bold uppercase tracking-[0.16em] text-white">Travel Vietnam</span>
            </Link>
            <p className="mt-4 text-xs font-bold text-white/95 leading-normal">
              {t("tagline")}
            </p>
            <div className="mt-4 space-y-3 text-xs text-white font-medium">
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-[var(--tctravel-primary)] transition-colors">
                <Mail className="size-4 text-[var(--tctravel-primary)] shrink-0" />
                <span>{email}</span>
              </a>
              <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-[var(--tctravel-primary)] transition-colors">
                <Phone className="size-4 text-[var(--tctravel-primary)] shrink-0" />
                <span>{whatsapp} (Whatsapp)</span>
              </a>
              <div className="flex items-start gap-2.5 leading-relaxed">
                <MapPin className="size-4 text-[var(--tctravel-primary)] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
            </div>
          </div>

          {columns.slice(0, 2).map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
                {col.heading}
              </h4>
              <ul className="space-y-2.5 text-xs text-white font-medium">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.target}
                      rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                      className="hover:text-[var(--tctravel-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t("helpTitle")}
            </h4>
            <FooterNewsletter />

            {social.length > 0 ? (
              <div className="flex gap-4 pt-2 justify-start">
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
                      className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/95 transition-all hover:bg-[var(--tctravel-primary)] hover:scale-105"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white">
              © {new Date().getFullYear()} {company}. {t("payLaterTagline")}
            </p>
            <p className="text-xs text-white">
              {t("trustLine")}
            </p>
          </div>
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
