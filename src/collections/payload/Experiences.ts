import type { CollectionConfig } from "payload";
import { adminOnly, publicReadActive, staffOnly } from "./access";
import { revalidateExperienceAfterChange, revalidateExperienceAfterDelete } from "./hooks/revalidate-content";

/**
 * Sellable add-ons distinct from tours: show tickets (Ky Uc Hoi An), massage &
 * spa sessions, basket-boat rides… Cross-sell vouchers (Promotions.
 * rewardApplicableTo) redeem against these. Kept separate from Tours so tour
 * queries/filters/sitemaps stay untouched.
 */
export const Experiences: CollectionConfig = {
  slug: "experiences",
  admin: { useAsTitle: "title" },
  access: {
    read: publicReadActive,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateExperienceAfterChange],
    afterDelete: [revalidateExperienceAfterDelete]
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, index: true, localized: true },
    { name: "destination", type: "relationship", relationTo: "destinations", required: true, index: true },
    {
      name: "experienceType",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Show / Event Ticket", value: "show-ticket" },
        { label: "Massage & Spa", value: "massage-spa" },
        { label: "Boat Ride", value: "boat-ride" },
        { label: "Other", value: "other" }
      ]
    },
    { name: "summary", type: "textarea", localized: true },
    { name: "description", type: "richText", localized: true },
    { name: "featuredImage", type: "upload", relationTo: "media" },
    { name: "gallery", type: "relationship", relationTo: "media", hasMany: true },
    { name: "partner", type: "relationship", relationTo: "partners" },
    { name: "venue", type: "text", localized: true },
    { name: "sessionDuration", type: "text", localized: true },
    { name: "priceFrom", type: "number", min: 0, index: true },
    { name: "currency", type: "text", defaultValue: "USD" },
    {
      name: "deal",
      type: "group",
      admin: { description: "Strike-through deal pricing. originalPrice must exceed priceFrom to display." },
      fields: [
        { name: "originalPrice", type: "number", min: 0 },
        { name: "dealEndsAt", type: "date" },
        { name: "dealLabel", type: "text", localized: true }
      ]
    },
    { name: "isFeatured", type: "checkbox", defaultValue: false, index: true },
    { name: "isBestSeller", type: "checkbox", defaultValue: false, index: true },
    { name: "sortWeight", type: "number", defaultValue: 0, index: true },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" }
      ]
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
        { name: "ogImage", type: "upload", relationTo: "media" }
      ]
    }
  ]
};
