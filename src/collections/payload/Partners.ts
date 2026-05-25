import type { CollectionConfig } from "payload";
import { adminOnly, adminOnlyField, publicReadFeatured, staffOnly } from "./access";

export const Partners: CollectionConfig = {
  slug: "partners",
  admin: { useAsTitle: "name" },
  access: {
    read: publicReadFeatured,
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
      min: 0.2,
      max: 0.35,
      access: {
        read: adminOnlyField,
        update: adminOnlyField
      },
      admin: { description: "Affiliate commission as a decimal. 0.2 = 20%." }
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
