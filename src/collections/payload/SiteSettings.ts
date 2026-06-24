import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";
import { freeProposalField } from "./fields/free-proposal-fields";
import { homepageField } from "./fields/homepage-fields";
import { otaField } from "./fields/ota-fields";

export const SiteSettings: CollectionConfig = {
  slug: "site-settings",
  admin: { useAsTitle: "name" },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
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
        { name: "label", type: "text", admin: { description: "Accessible label, e.g. \"TC Travel on Facebook\"." } }
      ]
    },
    {
      name: "footer",
      type: "group",
      fields: [
        { name: "companyName", type: "text" },
        { name: "legalText", type: "textarea" },
        { name: "address", type: "textarea" }
      ]
    },
    {
      name: "trust",
      type: "group",
      fields: [
        { name: "reviewAverage", type: "number", min: 0, max: 5 },
        { name: "reviewCount", type: "number", min: 0 },
        { name: "summary", type: "textarea" }
      ]
    },
    homepageField,
    otaField,
    freeProposalField
  ]
};
