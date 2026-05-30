import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";

export const ProductCategories: CollectionConfig = {
  slug: "product-categories",
  admin: { useAsTitle: "title" },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "type",
      type: "select",
      required: true,
      index: true,
      defaultValue: "shared",
      options: [
        { label: "Tour", value: "tour" },
        { label: "Car Rental", value: "car-rental" },
        { label: "Guide", value: "guide" },
        { label: "Shared", value: "shared" }
      ]
    },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true }
  ]
};
