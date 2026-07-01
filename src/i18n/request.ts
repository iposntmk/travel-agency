import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getDbMessages } from "@/lib/cms-translations";
import { deepMerge } from "@/lib/deep-merge";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Precedence low → high:
  //   1. English JSON  — ultimate fallback so no key ever renders empty
  //   2. locale JSON    — offline seed / fallback for this locale
  //   3. Payload DB     — source of truth, editable in the admin (wins)
  const [enDefaults, localeDefaults, dbMessages] = await Promise.all([
    import(`./messages/en/common.json`).then((m) => m.default as Record<string, unknown>),
    locale === "en"
      ? Promise.resolve<Record<string, unknown>>({})
      : import(`./messages/${locale}/common.json`).then((m) => m.default as Record<string, unknown>),
    getDbMessages(locale)
  ]);

  return {
    locale,
    messages: deepMerge(deepMerge(enDefaults, localeDefaults), dbMessages)
  };
});
