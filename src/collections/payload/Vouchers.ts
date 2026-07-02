import type { CollectionConfig } from "payload";
import { adminOnly, staffOnly } from "./access";

/**
 * Cross-sell vouchers issued when a booking of a Promotions.triggerProducts
 * item is confirmed ("book the Hue→Hoi An car, unlock 10% off Ky Uc Hoi An").
 * Fully staff-only — the storefront validates/redeems exclusively through
 * server actions (voucher-service) with overrideAccess.
 */
export const Vouchers: CollectionConfig = {
  slug: "vouchers",
  admin: { useAsTitle: "code" },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "code", type: "text", required: true, unique: true, index: true },
    { name: "promotion", type: "relationship", relationTo: "promotions", required: true, index: true },
    { name: "customerEmail", type: "text", required: true, index: true },
    { name: "customer", type: "relationship", relationTo: "customers" },
    { name: "sourceBooking", type: "relationship", relationTo: "bookings", required: true, index: true },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "issued",
      options: [
        { label: "Issued", value: "issued" },
        { label: "Redeemed", value: "redeemed" },
        { label: "Expired", value: "expired" },
        { label: "Void", value: "void" }
      ]
    },
    { name: "expiresAt", type: "date", index: true },
    { name: "redeemedBooking", type: "relationship", relationTo: "bookings" },
    { name: "issuedAt", type: "date", required: true }
  ]
};
