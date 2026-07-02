import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHero, SectionBand } from "@/components/section";
import { getSiteUrl } from "@/config/env";
import { getSiteSettings } from "@/lib/cms";
import { lexicalToHtml } from "@/lib/lexical";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { routing } from "@/i18n/routing";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "policy" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: localizedUrl(getSiteUrl(), locale, "/cancellation-policy"),
      languages: buildAlternates(getSiteUrl(), "/cancellation-policy")
    }
  };
}

export default async function CancellationPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "policy" })
  ]);
  const html = lexicalToHtml(settings?.cancellationPolicy ?? null);

  return (
    <main>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")}>
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[{ label: t("home"), href: "/" }, { label: t("title") }]}
          />
        </div>
      </PageHero>

      <SectionBand>
        {html ? (
          <div
            className="prose prose-slate max-w-3xl leading-7"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="max-w-3xl space-y-4 text-sm leading-7 text-slate-700 md:text-base">
            <p>{t("fallbackIntro")}</p>
            <p>{t("fallbackContact")}</p>
          </div>
        )}
      </SectionBand>
    </main>
  );
}
