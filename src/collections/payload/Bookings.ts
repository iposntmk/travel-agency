import type { CollectionConfig } from "payload";
import { adminOnly, adminOnlyField, staffOnly } from "./access";

export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: { useAsTitle: "idempotencyKey" },
  access: {
    read: staffOnly,
    create: () => true,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers" },
    { name: "tour", type: "relationship", relationTo: "tours", required: true },
    { name: "numPax", type: "number", required: true, min: 1 },
    { name: "preferredDate", type: "date", required: true },
    { name: "specialRequest", type: "textarea" },
    {
      name: "contactChannel",
      type: "select",
      options: [
        { label: "WhatsApp", value: "whatsapp" },
        { label: "Email", value: "email" },
        { label: "Zalo", value: "zalo" },
        { label: "Phone", value: "phone" }
      ]
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "Pending",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Confirmed - Pay Later", value: "Confirmed - Pay Later" },
        { label: "Confirmed - Paid", value: "Confirmed - Paid" },
        { label: "Completed", value: "Completed" },
        { label: "Cancelled", value: "Cancelled" }
      ]
    },
    {
      name: "idempotencyKey",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Client-generated key for deduplication on submit" }
    },
    { name: "paymentMethod", type: "text", admin: { description: "Nullable — set in Phase 5" } },
    { name: "paymentStatus", type: "text", admin: { description: "Nullable — set in Phase 5" } },
    {
      name: "paymentProviderEventId",
      type: "text",
      unique: true,
      admin: { description: "Provider webhook event ID for idempotency — Phase 5" }
    },
    {
      name: "internalNotes",
      type: "textarea",
      access: { read: adminOnlyField, update: adminOnlyField }
    },
    {
      name: "source",
      type: "select",
      options: [
        { label: "Direct", value: "direct" },
        { label: "Free Tour Upsell", value: "free-tour-upsell" },
        { label: "Blog CTA", value: "blog-cta" },
        { label: "Social", value: "social" },
        { label: "OTA", value: "ota" }
      ]
    },
    {
      name: "statusHistory",
      type: "array",
      admin: { readOnly: true, description: "Append-only audit trail — do not edit manually" },
      fields: [
        { name: "from", type: "text" },
        { name: "to", type: "text", required: true },
        { name: "actor", type: "text" },
        { name: "reason", type: "text" },
        { name: "source", type: "text" },
        { name: "createdAt", type: "date" }
      ]
    }
  ]
};
