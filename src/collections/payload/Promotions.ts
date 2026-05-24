import type { CollectionConfig } from "payload";
import { adminOnly, staffOnly } from "./access";

export const Promotions: CollectionConfig = {
  slug: "promotions",
  admin: { useAsTitle: "name" },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "code", type: "text", required: true, unique: true },
    { name: "description", type: "textarea" },
    {
      name: "discountType",
      type: "select",
      required: true,
      options: [
        { label: "Percentage", value: "percentage" },
        { label: "Fixed Amount", value: "fixed" }
      ]
    },
    { name: "discountValue", type: "number", required: true, min: 0 },
    { name: "applicableTours", type: "relationship", relationTo: "tours", hasMany: true },
    {
      name: "applicableMarkets",
      type: "select",
      hasMany: true,
      options: [
        { label: "European Union", value: "EU" },
        { label: "United States", value: "US" },
        { label: "Australia", value: "AU" },
        { label: "Asia", value: "Asia" },
        { label: "Vietnam", value: "VN" }
      ]
    },
    { name: "startDate", type: "date", required: true },
    { name: "endDate", type: "date", required: true },
    {
      name: "season",
      type: "select",
      options: [
        { label: "Summer", value: "summer" },
        { label: "Winter", value: "winter" },
        { label: "Year-Round", value: "year-round" }
      ]
    }
  ]
};
