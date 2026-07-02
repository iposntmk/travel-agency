import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";
import { revalidateAttractionAfterChange, revalidateAttractionAfterDelete } from "./hooks/revalidate-content";

export const Attractions: CollectionConfig = {
  slug: "attractions",
  admin: { useAsTitle: "title" },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateAttractionAfterChange],
    afterDelete: [revalidateAttractionAfterDelete]
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, index: true, localized: true },
    { name: "destination", type: "relationship", relationTo: "destinations", required: true, index: true },
    { name: "summary", type: "textarea", localized: true },
    { name: "content", type: "richText", localized: true },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "gallery", type: "relationship", relationTo: "media", hasMany: true },
    {
      name: "highlights",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "text" }
      ]
    },
    {
      name: "practicalInfo",
      type: "group",
      fields: [
        { name: "address", type: "text", localized: true },
        { name: "latitude", type: "number" },
        { name: "longitude", type: "number" },
        { name: "openingHours", type: "text", localized: true },
        {
          name: "priceRange",
          type: "text",
          localized: true,
          admin: { description: "Free-form, e.g. 'Free' or '120,000 VND entrance'" }
        }
      ]
    },
    {
      name: "faqs",
      type: "array",
      localized: true,
      label: "FAQs (attraction-specific)",
      admin: {
        description: "Short Q&A pairs surfaced to travellers and emitted as FAQPage structured data for AI/search engines."
      },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true }
      ]
    },
    { name: "categories", type: "relationship", relationTo: "product-categories" as never, hasMany: true },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
        { name: "ogImage", type: "upload", relationTo: "media" }
      ]
    }
  ]
};
