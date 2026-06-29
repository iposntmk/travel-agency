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
    { name: "durationDays", type: "number", min: 1, index: true },
    { name: "durationText", type: "text" },
    { name: "routeSummary", type: "text" },
    { name: "startEnd", type: "text" },
    { name: "travelStyle", type: "text" },
    { name: "guideLanguages", type: "text" },
    { name: "mapImage", type: "upload", relationTo: "media" },
    { name: "highlightIntro", type: "textarea" },
    {
      name: "highlights",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "text" }
      ]
    },
    {
      name: "inclusions",
      type: "array",
      fields: [{ name: "item", type: "text", required: true }]
    },
    {
      name: "exclusions",
      type: "array",
      fields: [{ name: "item", type: "text", required: true }]
    },
    { name: "groupSizeMin", type: "number", min: 1 },
    { name: "groupSizeMax", type: "number", min: 1, index: true },
    { name: "categories", type: "relationship", relationTo: "product-categories" as never, hasMany: true },
    { name: "attractions", type: "relationship", relationTo: "attractions" as never, hasMany: true },
    { name: "ratingAverage", type: "number", min: 0, max: 5, defaultValue: 0, index: true },
    { name: "ratingCount", type: "number", min: 0, defaultValue: 0 },
    { name: "isFeatured", type: "checkbox", defaultValue: false, index: true },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
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
        { name: "location", type: "text" },
        { name: "distance", type: "text" },
        { name: "title", type: "text" },
        { name: "activity", type: "richText" },
        { name: "note", type: "text" },
        {
          name: "included",
          type: "array",
          fields: [{ name: "item", type: "text", required: true }]
        },
        { name: "hotelName", type: "text" },
        { name: "hotelStars", type: "number", min: 0, max: 5 },
        { name: "hotelRoom", type: "text" }
      ]
    },
    { name: "addOns", type: "relationship", relationTo: "partners", hasMany: true },
    {
      name: "faqs",
      type: "array",
      label: "FAQs (tour-specific)",
      admin: {
        description: "Short Q&A pairs surfaced to travellers and emitted as FAQPage structured data for AI/search engines."
      },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true }
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
