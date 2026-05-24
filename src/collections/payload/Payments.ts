import type { CollectionConfig } from "payload";
import { adminOnly, staffOnly } from "./access";

export const Payments: CollectionConfig = {
  slug: "payments",
  admin: { useAsTitle: "id" },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "booking", type: "relationship", relationTo: "bookings", required: true },
    { name: "amount", type: "number", required: true, min: 0 },
    { name: "currency", type: "text", required: true, defaultValue: "USD" },
    {
      name: "paymentMethod",
      type: "select",
      options: [
        { label: "Cash", value: "cash" },
        { label: "Bank Transfer", value: "bank-transfer" },
        { label: "Stripe", value: "stripe" },
        { label: "VNPay", value: "vnpay" },
        { label: "MoMo", value: "momo" }
      ]
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" }
      ]
    },
    {
      name: "providerEventId",
      type: "text",
      unique: true,
      admin: { description: "Payment provider event ID — used for webhook idempotency (Phase 5)" }
    },
    { name: "providerPaymentId", type: "text" },
    { name: "metadata", type: "json" }
  ]
};
