import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ConsentBanner } from "@/components/consent-banner";
import { CurrencyProvider } from "@/components/currency/currency-provider";
import { SiteFloating } from "@/components/site-floating";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getNextConfigEnv, getSeoEnv, getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";
import { getCurrencies } from "@/lib/cms";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap"
});

const indexingAllowed = getSeoEnv().ALLOW_INDEXING;
const siteUrl = getSiteUrl();
const r2PublicUrl = getNextConfigEnv().R2_PUBLIC_URL;
const r2Origin = r2PublicUrl ? new URL(r2PublicUrl).origin : undefined;

// BCP-47 locale → Open Graph locale (language_TERRITORY).
const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  it: "it_IT",
  pt: "pt_PT",
  "zh-Hans": "zh_CN",
  "zh-Hant": "zh_TW"
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ogLocale = OG_LOCALE[locale] ?? OG_LOCALE.en;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "TC Travel Vietnam",
      template: "%s | TC Travel Vietnam"
    },
    description:
      "Private, small group, and free walking tours in Hội An, Huế, and Đà Nẵng. Book now, pay later — TC Travel Vietnam.",
    icons: { icon: "/favicon.svg" },
    alternates: {
      canonical: localizedUrl(siteUrl, locale, "/"),
      languages: buildAlternates(siteUrl, "/")
    },
    openGraph: {
      type: "website",
      siteName: "TC Travel Vietnam",
      locale: ogLocale,
      alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== ogLocale),
      url: localizedUrl(siteUrl, locale, "/"),
      title: "TC Travel Vietnam",
      description:
        "Private, small group, and free walking tours in Hội An, Huế, and Đà Nẵng. Book now, pay later.",
      images: [{ url: "/og-default", width: 1200, height: 630, alt: "TC Travel Vietnam" }]
    },
    twitter: { card: "summary_large_image" },
    robots: indexingAllowed ? { index: true, follow: true } : { index: false, follow: false }
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enables static rendering for this locale segment.
  setRequestLocale(locale);

  const currencies = await getCurrencies();
  return (
    <html lang={locale} className={inter.variable}>
      <head>{r2Origin ? <link rel="preconnect" href={r2Origin} crossOrigin="anonymous" /> : null}</head>
      <body className="bg-mist text-slate-800">
        <a className="skip-link sr-only" href="#main-content">
          Skip to content
        </a>
        <NextIntlClientProvider>
          <CurrencyProvider currencies={currencies}>
            <SiteHeader />
            <div id="main-content" className="pt-[60px] lg:pt-[110px]">
              {children}
            </div>
            <SiteFooter />
            <SiteFloating />
          </CurrencyProvider>
          <ConsentBanner />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
