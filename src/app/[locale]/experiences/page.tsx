import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/breadcrumb";
import { ExperienceCard } from "@/components/experience-card";
import { PageHero, SectionBand } from "@/components/section";
import { getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";
import { getExperiencesForList } from "@/lib/cms-experiences";
import { buildAlternates, localizedUrl } from "@/lib/locale-path";

// Filter-free listing → pure ISR, no dynamicListingSources entry needed.
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experiences" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: localizedUrl(getSiteUrl(), locale, "/experiences"),
      languages: buildAlternates(getSiteUrl(), "/experiences")
    }
  };
}

export default async function ExperiencesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [experiences, t] = await Promise.all([
    getExperiencesForList(24, locale),
    getTranslations({ locale, namespace: "experiences" })
  ]);

  return (
    <main>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")}>
        <div className="mt-6">
          <Breadcrumb variant="on-dark" items={[{ label: t("home"), href: "/" }, { label: t("title") }]} />
        </div>
      </PageHero>

      <SectionBand>
        {experiences.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy-100 bg-white p-8 text-center text-sm text-slate-500">
            {t("empty")}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        )}
      </SectionBand>
    </main>
  );
}
