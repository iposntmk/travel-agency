import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";
import { blogMediaField } from "./fields/blog-media-fields";
import { freeProposalField } from "./fields/free-proposal-fields";
import { homepageField } from "./fields/homepage-fields";
import { otaField } from "./fields/ota-fields";
import { searchFormField } from "./fields/search-form-fields";
import {
  revalidateSiteSettingsAfterChange,
  revalidateSiteSettingsAfterDelete
} from "./hooks/revalidate-content";

export const SiteSettings: CollectionConfig = {
  slug: "site-settings",
  admin: { useAsTitle: "name" },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateSiteSettingsAfterChange],
    afterDelete: [revalidateSiteSettingsAfterDelete]
  },
  fields: [
    { name: "name", type: "text", required: true, defaultValue: "Default" },
    { name: "hotline", type: "text" },
    { name: "whatsapp", type: "text" },
    {
      name: "messenger",
      type: "text",
      admin: { description: "Messenger m.me username (e.g. \"tctravel\") or full URL." }
    },
    { name: "salesEmail", type: "email" },
    {
      name: "social",
      type: "array",
      label: "Social & top-bar links",
      admin: {
        description: "Links shown in the sticky top bar and footer (Facebook, Instagram, language icons, etc.)."
      },
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Instagram", value: "instagram" },
            { label: "YouTube", value: "youtube" },
            { label: "TikTok", value: "tiktok" },
            { label: "WhatsApp", value: "whatsapp" }
          ]
        },
        { name: "url", type: "text", required: true },
        { name: "label", type: "text", localized: true, admin: { description: "Accessible label, e.g. \"TC Travel on Facebook\"." } }
      ]
    },
    {
      name: "footer",
      type: "group",
      fields: [
        { name: "companyName", type: "text" },
        { name: "legalText", type: "textarea", localized: true },
        { name: "address", type: "textarea", localized: true }
      ]
    },
    {
      name: "trust",
      type: "group",
      fields: [
        { name: "reviewAverage", type: "number", min: 0, max: 5 },
        { name: "reviewCount", type: "number", min: 0 },
        { name: "summary", type: "textarea", localized: true }
      ]
    },
    {
      name: "giveaway",
      type: "group",
      label: "Newsletter giveaway popup",
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: false },
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
        {
          name: "prizeText",
          type: "text",
          localized: true,
          admin: { description: "e.g. \"Win a $500 Travel Voucher\"" }
        },
        { name: "ctaLabel", type: "text", localized: true },
        {
          name: "delaySeconds",
          type: "number",
          min: 0,
          defaultValue: 15,
          admin: { description: "Seconds before the popup shows (also triggers on exit intent on desktop)." }
        },
        {
          name: "frequencyDays",
          type: "number",
          min: 1,
          defaultValue: 14,
          admin: { description: "Do not re-show to the same visitor for this many days." }
        }
      ]
    },
    { name: "cancellationPolicy", type: "richText", localized: true },
    {
      name: "generalFaqs",
      type: "array",
      localized: true,
      label: "General FAQs (site-wide)",
      admin: { description: "Shown on the /faq page and emitted as FAQPage structured data." },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true }
      ]
    },
    homepageField,
    searchFormField,
    otaField,
    freeProposalField,
    blogMediaField
  ]
};
