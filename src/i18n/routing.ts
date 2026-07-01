import { defineRouting } from "next-intl/routing";

// Locale codes are BCP-47 and MUST stay in sync with payload.config.ts
// `localization.locales` so a URL locale maps 1:1 to a Payload locale.
export const locales = ["en", "fr", "es", "de", "it", "pt", "zh-Hans", "zh-Hant"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every locale is prefixed (e.g. /en, /fr) — matches the reference site
  // izitour.com and keeps hreflang/canonical generation uniform.
  localePrefix: "always"
});
