import type { CollectionConfig } from "payload";
import { adminOnly, staffOnly } from "./access";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: { useAsTitle: "id" },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: "approved" } }),
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers", required: true },
    { name: "tour", type: "relationship", relationTo: "tours", required: true },
    { name: "booking", type: "relationship", relationTo: "bookings" },
    { name: "rating", type: "number", required: true, min: 1, max: 5 },
    { name: "comment", type: "textarea" },
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

