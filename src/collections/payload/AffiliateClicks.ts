import type { CollectionConfig } from "payload";
import { adminOnly } from "./access";

export const AffiliateClicks: CollectionConfig = {
  slug: "affiliate-clicks",
  admin: {
    useAsTitle: "targetUrl",
    defaultColumns: ["targetType", "targetId", "source", "createdAt"]
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly
  },
  fields: [
    {
      name: "targetType",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Add-on partner", value: "addon" },
        { label: "OTA experience", value: "ota" }
      ]
    },
    { name: "targetId", type: "text", required: true, index: true },
    { name: "targetUrl", type: "text", required: true },
    {
      name: "source",
      type: "text",
      required: true,
      index: true,
      admin: { description: "Path of the page where the click happened" }
    },
    { name: "referrer", type: "text" },
    { name: "userAgent", type: "text" },
    {
      name: "ipHash",
      type: "text",
      admin: { description: "One-way SHA-256 hash of the client IP (salted with PAYLOAD_SECRET)" }
    }
  ]
};
