import type { CollectionConfig } from "payload";
import { adminOnly, authenticated, staffOnly } from "./access";
import { sanitizeTextField } from "./hooks/sanitize-ugc";

export const Comments: CollectionConfig = {
  slug: "comments",
  admin: { useAsTitle: "id" },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: "approved" } }),
    create: authenticated,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    beforeValidate: [sanitizeTextField("content")]
  },
  fields: [
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: { description: "Set for authenticated commenters; blank for public guest submissions" }
    },
    {
      name: "authorName",
      type: "text",
      admin: { description: "Public display name shown on the blog (falls back to author email)" }
    },
    {
      name: "target",
      type: "relationship",
      relationTo: ["tours", "posts"],
      required: true
    },
    { name: "content", type: "textarea", required: true },
    {
      name: "rating",
      type: "number",
      min: 1,
      max: 5,
      admin: { description: "Optional 1-5 star rating left with a blog comment" }
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Hidden", value: "hidden" }
      ]
    }
  ]
};
