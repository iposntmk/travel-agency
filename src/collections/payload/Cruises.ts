import type { CollectionConfig } from "payload";
import { adminOnly, publicReadActive, staffOnly } from "./access";
import { revalidateCruiseAfterChange, revalidateCruiseAfterDelete } from "./hooks/revalidate-content";

export const Cruises: CollectionConfig = {
  slug: "cruises",
  admin: { useAsTitle: "title" },
  access: {
    read: publicReadActive,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateCruiseAfterChange],
    afterDelete: [revalidateCruiseAfterDelete]
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, index: true, localized: true },
    { name: "description", type: "richText", localized: true },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "gallery", type: "relationship", relationTo: "media", hasMany: true },
    { name: "destination", type: "relationship", relationTo: "destinations", required: true },
    { name: "nights", type: "number", min: 1, index: true },
    { name: "durationText", type: "text", localized: true },
    { name: "routeSummary", type: "text", localized: true },
    {
      name: "cabinTypes",
      type: "array",
      localized: true,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "price", type: "number", required: true, min: 0 },
        { name: "maxPax", type: "number", min: 1 }
      ]
    },
    { name: "priceFrom", type: "number", min: 0, index: true },
    { name: "currency", type: "text", defaultValue: "USD" },
    { name: "ratingAverage", type: "number", min: 0, max: 5, defaultValue: 0, index: true },
    { name: "ratingCount", type: "number", min: 0, defaultValue: 0 },
    { name: "isFeatured", type: "checkbox", defaultValue: false, index: true },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Seasonal", value: "seasonal" },
        { label: "Sold Out", value: "sold-out" },
        { label: "Paused", value: "paused" }
      ]
    },
    {
      name: "itinerary",
      type: "array",
      localized: true,
      fields: [
        { name: "time", type: "text" },
        { name: "activity", type: "richText" }
      ]
    },
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
