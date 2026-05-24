import type { CollectionConfig } from "payload";
import { adminOnly, authenticated, publicRead } from "./access";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    disableLocalStorage: true
  },
  admin: {
    useAsTitle: "alt"
  },
  access: {
    read: publicRead,
    create: authenticated,
    update: authenticated,
    delete: adminOnly
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "uploading",
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
      admin: {
        readOnly: true
      }
    },
    {
      name: "publicUrl",
      type: "text",
      admin: {
        readOnly: true
      }
    }
  ]
};
