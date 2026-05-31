import { getSiteSettings } from "@/lib/cms";
import { MailIcon, PhoneIcon, SOCIAL_ICONS, WhatsAppIcon, type SocialPlatform } from "@/components/icons";

const DEFAULTS = {
  hotline: "+84-236-555-0100",
  whatsapp: "+84-903-111-222",
  salesEmail: "hello@tctravel.example"
};

function toWaLink(value: string): string {
  return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
}

export async function SiteTopbar() {
  const settings = await getSiteSettings();
  const hotline = settings?.hotline ?? DEFAULTS.hotline;
  const whatsapp = settings?.whatsapp ?? DEFAULTS.whatsapp;
  const email = settings?.salesEmail ?? DEFAULTS.salesEmail;
  const social = (settings?.social ?? []).filter((item) => item?.platform && item?.url);

  return (
    <div className="bg-navy-950 text-white">
      <div className="mx-auto flex max-w-page items-center justify-center gap-4 px-4 py-1.5 text-xs sm:justify-between">
        <p className="hidden text-navy-100 sm:block">Local travel experts · Book now, pay later</p>

        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href={`tel:${hotline.replace(/\s/g, "")}`}
            className="inline-flex min-h-8 items-center gap-1.5 transition hover:text-brand-gold"
          >
            <PhoneIcon className="h-3.5 w-3.5" />
            <span>{hotline}</span>
          </a>
          <a
            href={toWaLink(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-8 items-center gap-1.5 transition hover:text-brand-gold"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="hidden min-h-8 items-center gap-1.5 transition hover:text-brand-gold md:inline-flex"
          >
            <MailIcon className="h-3.5 w-3.5" />
            <span>{email}</span>
          </a>

          {social.length > 0 ? (
            <span className="hidden items-center gap-3 border-l border-white/15 pl-3 sm:inline-flex">
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
                    className="inline-flex min-h-8 min-w-8 items-center justify-center transition hover:text-brand-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
