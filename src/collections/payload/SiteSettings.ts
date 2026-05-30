import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";

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
    { name: "salesEmail", type: "email" },
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
    }
  ]
};
