import type { CollectionConfig } from "payload";
import { adminOnly, adminOnlyField, staffOnly } from "./access";
import { normalizeMediaUrlAfterRead } from "./hooks/normalize-media-url";

export const Media: CollectionConfig = {
  slug: "media",
  upload: true,
  admin: {
    useAsTitle: "alt"
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: "ready" } };
    },
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterRead: [normalizeMediaUrlAfterRead]
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true
    },
    {
      name: "caption",
      type: "text"
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "ready",
      options: [
        { label: "Uploading", value: "uploading" },
        { label: "Processing", value: "processing" },
        { label: "Ready", value: "ready" },
        { label: "Failed", value: "failed" }
      ]
    },
    {
      name: "r2Key",
      type: "text",
      admin: { readOnly: true }
    },
    {
      name: "publicUrl",
      type: "text",
      admin: { readOnly: true }
    },
    {
      name: "variants",
      type: "json",
      admin: { readOnly: true }
    },
    {
      name: "processingError",
      type: "text",
      access: { read: adminOnlyField },
      admin: { readOnly: true }
    }
  ]
};
