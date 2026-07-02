import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { PageHero, SectionBand } from "@/components/section";
import { getSiteUrl } from "@/config/env";
import { getSiteSettings } from "@/lib/cms";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";
import { faqPageJsonLd } from "@/lib/structured-data";
import { routing } from "@/i18n/routing";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: localizedUrl(getSiteUrl(), locale, "/faq"),
      languages: buildAlternates(getSiteUrl(), "/faq")
    }
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "faqPage" })
  ]);
  const faqs = (settings?.generalFaqs ?? []).filter((faq) => faq.question && faq.answer);

  return (
    <main>
      {faqs.length > 0 ? (
        <JsonLd data={faqPageJsonLd(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))} />
      ) : null}
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")}>
        <div className="mt-6">
          <Breadcrumb
            variant="on-dark"
            items={[{ label: t("home"), href: "/" }, { label: t("title") }]}
          />
        </div>
      </PageHero>

      <SectionBand>
        {faqs.length > 0 ? (
          <div className="mx-auto max-w-3xl divide-y divide-slate-200">
            {faqs.map((faq) => (
              <details key={faq.id ?? faq.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-base font-semibold text-navy-950">
                  {faq.question}
                  <span className="text-slate-400 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{faq.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{t("empty")}</p>
        )}
      </SectionBand>
    </main>
  );
}
