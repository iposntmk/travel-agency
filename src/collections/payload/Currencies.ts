import type { CollectionConfig } from "payload";
import { adminOnly, publicRead, staffOnly } from "./access";
import {
  revalidateCurrenciesAfterChange,
  revalidateCurrenciesAfterDelete
} from "./hooks/revalidate-content";

// Display currencies for the storefront currency selector. Tour prices are
// stored once in the base currency (the row flagged `isDefault`); every other
// currency converts via `rateToBase`. CRUD here lets staff add new markets
// (PHP, SGD, MYR, …) and edit rates without a deploy.
export const Currencies: CollectionConfig = {
  slug: "currencies",
  admin: {
    useAsTitle: "code",
    defaultColumns: ["code", "name", "symbol", "rateToBase", "active", "isDefault", "sort"],
    group: "Settings"
  },
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateCurrenciesAfterChange],
    afterDelete: [revalidateCurrenciesAfterDelete]
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "ISO 4217 code, e.g. USD, GBP, EUR, PHP." }
    },
    { name: "name", type: "text", required: true, admin: { description: 'Full name, e.g. "British Pound".' } },
    {
      name: "symbol",
      type: "text",
      required: true,
      admin: { description: 'Display symbol, e.g. "$", "£", "€", "₫".' }
    },
    {
      name: "rateToBase",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 1,
      admin: {
        description:
          "Units of THIS currency per 1 unit of the base (default) currency. The base currency must be 1. Example: if base is USD and 1 USD = 0.79 GBP, set GBP to 0.79."
      }
    },
    {
      name: "decimals",
      type: "number",
      required: true,
      min: 0,
      max: 4,
      defaultValue: 2,
      admin: { description: "Fraction digits shown. Use 0 for JPY/VND." }
    },
    {
      name: "symbolPosition",
      type: "select",
      required: true,
      defaultValue: "before",
      options: [
        { label: "Before amount ($100)", value: "before" },
        { label: "After amount (100 ₫)", value: "after" }
      ]
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: { description: "Show this currency in the storefront selector." }
    },
    {
      name: "isDefault",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "The base currency that all tour prices are stored in. Exactly one currency should be the default, and its rate must be 1."
      }
    },
    {
      name: "sort",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: { description: "Order in the selector dropdown (ascending)." }
    }
  ]
};
