import type { CollectionConfig } from "payload";
import { adminOnly, authenticated, staffOnly } from "./access";

export const Comments: CollectionConfig = {
  slug: "comments",
  admin: { useAsTitle: "id" },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: "approved" } }),
    create: authenticated,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "author", type: "relationship", relationTo: "users", required: true },
    {
      name: "target",
      type: "relationship",
      relationTo: ["tours", "posts"],
      required: true
    },
    { name: "content", type: "textarea", required: true },
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
