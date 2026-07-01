import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";

export const Attractions: CollectionConfig = {
  slug: "attractions",
  admin: { useAsTitle: "title" },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, index: true, localized: true },
    { name: "destination", type: "relationship", relationTo: "destinations", required: true, index: true },
    { name: "summary", type: "textarea", localized: true },
    { name: "featuredImage", type: "upload", relationTo: "media" },
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
