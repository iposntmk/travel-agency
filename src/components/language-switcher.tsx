"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type AppLocale, locales } from "@/i18n/routing";

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文"
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  // usePathname() returns the locale-stripped path including resolved dynamic
  // segments (e.g. /tours/abc), so switching locale keeps the same page. Slugs
  // aren't re-mapped per locale yet — Payload fallback serves default-locale data.
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as AppLocale;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <label className={className}>
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        aria-label={t("selectLabel")}
        className="cursor-pointer rounded-md bg-transparent text-xs font-medium outline-none disabled:opacity-60"
      >
        {locales.map((code) => (
          <option key={code} value={code} className="text-slate-800">
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
