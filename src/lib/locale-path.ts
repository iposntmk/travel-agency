import { type AppLocale, defaultLocale, locales } from "@/i18n/routing";

/**
 * Build a locale-prefixed path. With `localePrefix: "always"` every locale —
 * including the default — carries its prefix (e.g. `/en/tours`, `/fr/tours`).
 *
 * @param locale target locale code
 * @param path   app-relative path beginning with "/" (use "/" for the home page)
 */
export function localizedPath(locale: string, path = "/"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

/**
 * Absolute locale-prefixed URL, for canonical/hreflang/JSON-LD/sitemap output.
 */
export function localizedUrl(baseUrl: string, locale: string, path = "/"): string {
  return `${baseUrl.replace(/\/$/, "")}${localizedPath(locale, path)}`;
}

/**
 * Map of every locale to its absolute URL for a path — used to populate
 * `alternates.languages` plus an `x-default` pointing at the default locale.
 */
export function buildAlternates(baseUrl: string, path = "/"): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizedUrl(baseUrl, locale, path);
  }
  languages["x-default"] = localizedUrl(baseUrl, defaultLocale, path);
  return languages;
}

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
