import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";
import { revalidateDestinationAfterChange, revalidateDestinationAfterDelete } from "./hooks/revalidate-content";

export const Destinations: CollectionConfig = {
  slug: "destinations",
  admin: { useAsTitle: "title" },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateDestinationAfterChange],
    afterDelete: [revalidateDestinationAfterDelete]
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "URL-friendly identifier, e.g. hoi-an" }
    },
    { name: "description", type: "richText" },
    { name: "summary", type: "textarea" },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    {
      name: "region",
      type: "select",
      options: [
        { label: "Central Vietnam", value: "central" },
        { label: "Northern Vietnam", value: "north" },
        { label: "Southern Vietnam", value: "south" }
      ]
    },
    { name: "bestTimeToVisit", type: "textarea" },
    { name: "hubIntro", type: "richText" },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
    { name: "featuredTours", type: "relationship", relationTo: "tours", hasMany: true },
    { name: "featuredCarRentals", type: "relationship", relationTo: "car-rentals" as never, hasMany: true },
    { name: "featuredGuides", type: "relationship", relationTo: "posts", hasMany: true },
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
