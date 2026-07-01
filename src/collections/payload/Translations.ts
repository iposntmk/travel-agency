import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";
import {
  revalidateTranslationsAfterChange,
  revalidateTranslationsAfterDelete
} from "./hooks/revalidate-content";

// UI micro-copy for the storefront chrome (footer, cookie banner, search form,
// buttons, aria labels…). Each row is one next-intl message: a dot-notation
// `key` the component reads via t("key"), and a `value` localized across all 8
// locales. Editing here changes the live site without a deploy — the JSON files
// in src/i18n/messages are only the seed source + offline fallback.

export const Translations: CollectionConfig = {
  slug: "translations",
  admin: {
    useAsTitle: "key",
    defaultColumns: ["key", "group", "value", "updatedAt"],
    group: "Settings",
    listSearchableFields: ["key", "value", "description"]
  },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateTranslationsAfterChange],
    afterDelete: [revalidateTranslationsAfterDelete]
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Dot-notation message key read by the code, e.g. "footer.tagline". Do NOT rename without updating the component that calls t() for it.'
      }
    },
    {
      name: "group",
      type: "text",
      index: true,
      admin: {
        description:
          "Grouping for admin filtering only. Auto-set to the key prefix (the part before the first dot), e.g. footer, card, consent."
      }
    },
    {
      name: "value",
      type: "textarea",
      required: true,
      localized: true,
      admin: {
        description:
          "The translated text for the currently selected locale. Switch locale (top-right of the admin) to translate the other languages. Empty locales fall back to English."
      }
    },
    {
      name: "description",
      type: "text",
      admin: {
        description: "Optional context for translators (where the string appears, tone, length limits)."
      }
    }
  ]
};
