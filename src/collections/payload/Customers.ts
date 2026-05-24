import type { CollectionConfig } from "payload";
import { adminOnly, staffOnly } from "./access";

export const Customers: CollectionConfig = {
  slug: "customers",
  admin: { useAsTitle: "email" },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true, unique: true },
    { name: "phone", type: "text" },
    { name: "nationality", type: "text" },
    {
      name: "clerkUserId",
      type: "text",
      unique: true,
      admin: { readOnly: true, description: "Linked Clerk user ID (set on first SSO login)" }
    },
    {
      name: "preferredContactChannel",
      type: "select",
      options: [
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Email", value: "email" },
        { label: "Zalo", value: "zalo" },
        { label: "Phone", value: "phone" }
      ]
    },
    {
      name: "notes",
      type: "textarea",
      admin: { description: "Internal CRM notes — not visible to customer" }
    }
  ]
};
