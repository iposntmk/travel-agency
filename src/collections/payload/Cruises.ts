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
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "richText" },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "gallery", type: "relationship", relationTo: "media", hasMany: true },
    { name: "destination", type: "relationship", relationTo: "destinations", required: true },
    { name: "nights", type: "number", min: 1, index: true },
    { name: "durationText", type: "text" },
    { name: "routeSummary", type: "text" },
    {
      name: "cabinTypes",
      type: "array",
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
      fields: [
        { name: "time", type: "text" },
        { name: "activity", type: "richText" }
      ]
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
        { name: "ogImage", type: "upload", relationTo: "media" }
      ]
    }
  ]
};
