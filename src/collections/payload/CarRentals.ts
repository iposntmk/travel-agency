import type { CollectionConfig } from "payload";
import { adminOnly, publicReadActive, staffOnly } from "./access";

export const CarRentals: CollectionConfig = {
  slug: "car-rentals",
  admin: { useAsTitle: "title" },
  access: {
    read: publicReadActive,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, index: true, localized: true },
    { name: "destination", type: "relationship", relationTo: "destinations", required: true, index: true },
    { name: "routeFrom", type: "text", required: true, index: true, localized: true },
    { name: "routeTo", type: "text", required: true, index: true, localized: true },
    {
      name: "vehicleType",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Sedan", value: "sedan" },
        { label: "SUV", value: "suv" },
        { label: "Van", value: "van" },
        { label: "Luxury", value: "luxury" },
        { label: "Minibus", value: "minibus" }
      ]
    },
    { name: "durationText", type: "text", localized: true },
    { name: "priceFrom", type: "number", min: 0, index: true },
    { name: "currency", type: "text", defaultValue: "USD" },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "gallery", type: "relationship", relationTo: "media", hasMany: true },
    { name: "partner", type: "relationship", relationTo: "partners" },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" }
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
