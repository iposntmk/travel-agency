import type { CollectionConfig } from "payload";
import { adminOnly, publicReadActive, staffOnly } from "./access";
import { revalidateTourAfterChange, revalidateTourAfterDelete } from "./hooks/revalidate-content";

export const Tours: CollectionConfig = {
  slug: "tours",
  admin: { useAsTitle: "title" },
  access: {
    read: publicReadActive,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateTourAfterChange],
    afterDelete: [revalidateTourAfterDelete]
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "richText" },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "gallery", type: "relationship", relationTo: "media", hasMany: true },
    { name: "destination", type: "relationship", relationTo: "destinations", required: true },
    {
      name: "operationType",
      type: "select",
      required: true,
      index: true,
      defaultValue: "self-operated",
      options: [
        { label: "Self-Operated", value: "self-operated" },
        { label: "Partner", value: "partner" },
        { label: "Hybrid", value: "hybrid" }
      ]
    },
    { name: "partner", type: "relationship", relationTo: "partners" },
    { name: "minPax", type: "number", min: 1, defaultValue: 1 },
    { name: "currentPax", type: "number", min: 0, defaultValue: 0 },
    {
      name: "tourType",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Free Walking", value: "free-walking" },
        { label: "Free Cycling", value: "free-cycling" },
        { label: "Paid Private", value: "paid-private" },
        { label: "Paid Group", value: "paid-group" },
        { label: "Adventure", value: "adventure" },
        { label: "Family", value: "family" },
        { label: "Cultural", value: "cultural" }
      ]
    },
    {
      name: "season",
      type: "select",
      index: true,
      options: [
        { label: "Summer", value: "summer" },
        { label: "Winter", value: "winter" },
        { label: "Year-Round", value: "year-round" }
      ]
    },
    { name: "isFeaturedInSeason", type: "checkbox", defaultValue: false, index: true },
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
    { name: "priceFrom", type: "number", min: 0, index: true },
    { name: "currency", type: "text", defaultValue: "USD" },
    {
      name: "pricingTiers",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "price", type: "number", required: true, min: 0 },
        { name: "minPax", type: "number", min: 1 },
        { name: "maxPax", type: "number" }
      ]
    },
    {
      name: "availableDates",
      type: "array",
      fields: [{ name: "date", type: "date", required: true }]
    },
    {
      name: "itinerary",
      type: "array",
      fields: [
        { name: "time", type: "text" },
        { name: "activity", type: "richText" }
      ]
    },
    { name: "addOns", type: "relationship", relationTo: "partners", hasMany: true },
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
