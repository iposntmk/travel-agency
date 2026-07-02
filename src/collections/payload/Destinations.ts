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
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
      localized: true,
      admin: { description: "URL-friendly identifier, e.g. hoi-an" }
    },
    { name: "description", type: "richText", localized: true },
    { name: "summary", type: "textarea", localized: true },
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
    { name: "bestTimeToVisit", type: "textarea", localized: true },
    { name: "hubIntro", type: "richText", localized: true },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
    {
      name: "faqs",
      type: "array",
      localized: true,
      label: "FAQs (destination-specific)",
      admin: {
        description:
          "Q&A for the destination hub page (e.g. 'What are the best tours in Hoi An?'), emitted as FAQPage structured data."
      },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true }
      ]
    },
    {
      name: "nearbyDestinations",
      type: "relationship",
      relationTo: "destinations",
      hasMany: true,
      admin: { description: "Shown as 'Go beyond' cross-sell on the destination hub." }
    },
    {
      name: "themeChips",
      type: "relationship",
      relationTo: "product-categories" as never,
      hasMany: true,
      admin: { description: "Curated 1-click experience filters shown as chips on the hub (order matters)." }
    },
    { name: "featuredTours", type: "relationship", relationTo: "tours", hasMany: true },
    { name: "featuredCarRentals", type: "relationship", relationTo: "car-rentals" as never, hasMany: true },
    { name: "featuredGuides", type: "relationship", relationTo: "posts", hasMany: true },
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
