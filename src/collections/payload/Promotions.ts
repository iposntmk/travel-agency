import type { CollectionConfig } from "payload";
import { adminOnly, staffOnly } from "./access";
import { revalidatePromotionsAfterChange, revalidatePromotionsAfterDelete } from "./hooks/revalidate-content";

export const Promotions: CollectionConfig = {
  slug: "promotions",
  admin: { useAsTitle: "name" },
  access: {
    read: staffOnly,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidatePromotionsAfterChange],
    afterDelete: [revalidatePromotionsAfterDelete]
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "code", type: "text", required: true, unique: true },
    { name: "description", type: "textarea" },
    {
      name: "discountType",
      type: "select",
      required: true,
      options: [
        { label: "Percentage", value: "percentage" },
        { label: "Fixed Amount", value: "fixed" }
      ]
    },
    { name: "discountValue", type: "number", required: true, min: 0 },
    { name: "applicableTours", type: "relationship", relationTo: "tours", hasMany: true },
    {
      name: "applicableMarkets",
      type: "select",
      hasMany: true,
      options: [
        { label: "European Union", value: "EU" },
        { label: "United States", value: "US" },
        { label: "Australia", value: "AU" },
        { label: "Asia", value: "Asia" },
        { label: "Vietnam", value: "VN" }
      ]
    },
    { name: "startDate", type: "date", required: true },
    { name: "endDate", type: "date", required: true },
    {
      name: "season",
      type: "select",
      options: [
        { label: "Summer", value: "summer" },
        { label: "Winter", value: "winter" },
        { label: "Year-Round", value: "year-round" }
      ]
    },
    {
      name: "isPublic",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: { description: "Expose on the storefront (sale banner / cross-sell teaser) while inside the date window." }
    },
    { name: "bannerText", type: "text", localized: true },
    { name: "showCountdown", type: "checkbox", defaultValue: false },
    {
      name: "triggerProducts",
      type: "relationship",
      relationTo: ["car-rentals", "tours", "cruises"] as never,
      hasMany: true,
      admin: { description: "Cross-sell: confirming a booking of one of these products issues a voucher for this promotion." }
    },
    {
      name: "rewardApplicableTo",
      type: "relationship",
      relationTo: ["tours", "experiences"] as never,
      hasMany: true,
      admin: {
        description: "Products the issued voucher can be redeemed on (tours or experiences such as show tickets, massage, boat rides)."
      }
    },
    {
      name: "voucherValidityDays",
      type: "number",
      min: 1,
      admin: { description: "Days until an issued voucher expires." }
    },
    { name: "autoIssueVoucher", type: "checkbox", defaultValue: false }
  ]
};
