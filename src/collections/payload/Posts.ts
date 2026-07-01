import type { CollectionConfig } from "payload";
import { adminOnly, publicReadPublished, staffOnly } from "./access";
import { revalidatePostAfterChange, revalidatePostAfterDelete } from "./hooks/revalidate-content";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: { useAsTitle: "title" },
  access: {
    read: publicReadPublished,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidatePostAfterChange],
    afterDelete: [revalidatePostAfterDelete]
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, index: true, localized: true },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "content", type: "richText", required: true, localized: true },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" }
      ]
    },
    { name: "destination", type: "relationship", relationTo: "destinations" },
    {
      name: "guideCategory",
      type: "select",
      index: true,
      defaultValue: "general",
      options: [
        { label: "Eat", value: "eat" },
        { label: "Drink", value: "drink" },
        { label: "Do", value: "do" },
        { label: "Shop", value: "shop" },
        { label: "Before the Trip", value: "before-trip" },
        { label: "Service", value: "service" },
        { label: "General", value: "general" }
      ]
    },
    { name: "attractions", type: "relationship", relationTo: "attractions" as never, hasMany: true },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
    { name: "relatedTour", type: "relationship", relationTo: "tours" },
    { name: "relatedPosts", type: "relationship", relationTo: "posts", hasMany: true },
    {
      name: "tags",
      type: "array",
      localized: true,
      fields: [{ name: "tag", type: "text", required: true }]
    },
    { name: "author", type: "text", admin: { description: "Author display name" } },
    { name: "viewCount", type: "number", defaultValue: 0, admin: { description: "Total page views" } },
    { name: "updateCount", type: "number", defaultValue: 0, admin: { description: "Number of content updates" } },
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
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
        { name: "ogImage", type: "upload", relationTo: "media" },
        { name: "keywords", type: "text", localized: true }
      ]
    }
  ]
};
