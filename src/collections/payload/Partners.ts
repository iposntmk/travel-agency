import type { CollectionConfig } from "payload";
import { adminOnly, adminOnlyField, publicRead, staffOnly } from "./access";

export const Partners: CollectionConfig = {
  slug: "partners",
  admin: { useAsTitle: "name" },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "description", type: "textarea" },
    {
      name: "partnerType",
      type: "select",
      required: true,
      options: [
        { label: "Tour Outsource", value: "tour-outsource" },
        { label: "Spa", value: "spa" },
        { label: "Dental", value: "dental" },
        { label: "Nail", value: "nail" },
        { label: "Wellness", value: "wellness" },
        { label: "Other", value: "other" }
      ]
    },
    { name: "location", type: "relationship", relationTo: "destinations", hasMany: false },
    {
      name: "commissionRate",
      type: "number",
      min: 0,
      max: 100,
      access: {
        read: adminOnlyField,
        update: adminOnlyField
      }
    },
    { name: "contactPerson", type: "text" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    { name: "whatsapp", type: "text" },
    { name: "rating", type: "number", min: 0, max: 5 },
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "inquiryFormUrl", type: "text" }
  ]
};
