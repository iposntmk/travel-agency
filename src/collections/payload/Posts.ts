import type { CollectionConfig } from "payload";
import { adminOnly, publicReadPublished, staffOnly } from "./access";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: { useAsTitle: "title" },
  access: {
    read: publicReadPublished,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "content", type: "richText", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" }
      ]
    },
    { name: "destination", type: "relationship", relationTo: "destinations" },
    { name: "relatedTour", type: "relationship", relationTo: "tours" },
    { name: "relatedPosts", type: "relationship", relationTo: "posts", hasMany: true },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }]
    },
    { name: "featured", type: "checkbox", defaultValue: false },
    {
      name: "readingTime",
      type: "number",
      min: 1,
      admin: { description: "Estimated reading time in minutes" }
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
        { name: "ogImage", type: "upload", relationTo: "media" },
        { name: "keywords", type: "text" }
      ]
    }
  ]
};
