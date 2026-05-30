import type { CollectionConfig } from "payload";
import { adminOnly, publicReadPublished, staffOnly } from "./access";

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  admin: { useAsTitle: "name" },
  access: {
    read: publicReadPublished,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "quote", type: "textarea" },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
    { name: "status", type: "select", defaultValue: "published", options: ["draft", "published"], index: true },
    { name: "isPublished", type: "checkbox", defaultValue: true }
  ]
};
