import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms";
import { NewsletterPopup, type GiveawayConfig } from "@/components/newsletter-popup";

interface NewsletterPopupServerProps {
  locale: string;
}

/**
 * Server wrapper: reads the giveaway config from SiteSettings (cached getter)
 * and mounts the client popup only when enabled. Localized text falls back to
 * i18n defaults so the popup works before CMS copy is entered.
 */
export async function NewsletterPopupServer({ locale }: NewsletterPopupServerProps) {
  const settings = await getSiteSettings(locale);
  const giveaway = settings?.giveaway;
  if (!giveaway?.enabled) return null;

  const t = await getTranslations("giveaway");
  const config: GiveawayConfig = {
    title: giveaway.title ?? t("defaultTitle"),
    description: giveaway.description ?? t("defaultDescription"),
    prizeText: giveaway.prizeText ?? undefined,
    ctaLabel: giveaway.ctaLabel ?? t("defaultCta"),
    delaySeconds: giveaway.delaySeconds ?? 15,
    frequencyDays: giveaway.frequencyDays ?? 14
  };

  return <NewsletterPopup config={config} />;
}
