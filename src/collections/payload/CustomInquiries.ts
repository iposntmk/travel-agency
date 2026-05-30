import type { CollectionConfig } from "payload";
import { adminOnly, adminOnlyField, staffOnly } from "./access";

export const CustomInquiries: CollectionConfig = {
  slug: "custom-inquiries",
  admin: { useAsTitle: "customerName" },
  access: {
    read: staffOnly,
    create: () => true,
    update: staffOnly,
    delete: adminOnly
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "customers" },
    { name: "customerName", type: "text", required: true },
    { name: "email", type: "email", required: true, index: true },
    { name: "phone", type: "text" },
    { name: "nationality", type: "text" },
    { name: "whatsappOptIn", type: "checkbox", defaultValue: false },
    { name: "planningStage", type: "text" },
    { name: "referralSource", type: "text" },
    { name: "travelCompanions", type: "text" },
    { name: "occasion", type: "text" },
    { name: "adults", type: "number", required: true, min: 1 },
    { name: "children", type: "number", min: 0, defaultValue: 0 },
    { name: "exactDatesKnown", type: "checkbox", defaultValue: false },
    { name: "departureDate", type: "date" },
    { name: "returnDate", type: "date" },
    { name: "departureMonth", type: "text" },
    { name: "estimatedDays", type: "number", min: 1 },
    { name: "accommodationLevels", type: "array", fields: [{ name: "value", type: "text", required: true }] },
    { name: "themes", type: "array", fields: [{ name: "value", type: "text", required: true }] },
    { name: "accompanimentType", type: "text" },
    { name: "budgetPerPerson", type: "number", min: 0 },
    { name: "maxBudget", type: "number", min: 0 },
    { name: "selectedDestinations", type: "relationship", relationTo: "destinations", hasMany: true, required: true },
    { name: "message", type: "textarea" },
    { name: "source", type: "text", defaultValue: "free-proposal" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      index: true,
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Quoted", value: "quoted" },
        { label: "Closed", value: "closed" },
        { label: "Spam", value: "spam" }
      ]
    },
    { name: "internalNotes", type: "textarea", access: { read: adminOnlyField } },
    { name: "idempotencyKey", type: "text", required: true, unique: true, index: true }
  ]
};
