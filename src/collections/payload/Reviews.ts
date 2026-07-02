import type { CollectionConfig } from "payload";
import { adminOnly, staffOnly } from "./access";
import { aggregateTourRatingAfterChange, aggregateTourRatingAfterDelete } from "./hooks/review-aggregation";
import { revalidateReviewsAfterChange, revalidateReviewsAfterDelete } from "./hooks/revalidate-content";
import { sanitizeTextField } from "./hooks/sanitize-ugc";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: { useAsTitle: "id" },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: "approved" } }),
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    beforeValidate: [sanitizeTextField("comment"), sanitizeTextField("authorName")],
    afterChange: [aggregateTourRatingAfterChange, revalidateReviewsAfterChange],
    afterDelete: [aggregateTourRatingAfterDelete, revalidateReviewsAfterDelete]
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers" },
    {
      name: "authorName",
      type: "text",
      admin: { description: "Display name for public submissions (no customer record)." }
    },
    {
      name: "authorEmail",
      type: "text",
      access: { read: ({ req }) => Boolean(req.user) },
      admin: { description: "Never shown publicly." }
    },
    { name: "tour", type: "relationship", relationTo: "tours", required: true },
    { name: "booking", type: "relationship", relationTo: "bookings" },
    { name: "rating", type: "number", required: true, min: 1, max: 5 },
    { name: "comment", type: "textarea" },
    { name: "photos", type: "relationship", relationTo: "media", hasMany: true },
    {
      name: "submissionSource",
      type: "select",
      required: true,
      defaultValue: "staff",
      options: [
        { label: "Staff", value: "staff" },
        { label: "Public form", value: "public" }
      ]
    },
    {
      name: "honeypotFlagged",
      type: "checkbox",
      defaultValue: false,
      access: { read: ({ req }) => Boolean(req.user) }
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
