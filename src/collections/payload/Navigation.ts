import type { CollectionConfig } from "payload";
import { adminOnly, publicReadPublished, staffOnly } from "./access";
import {
  normalizeNavigationHrefHook,
  validateNavigationHref,
  validateOptionalNavigationHref
} from "./fields/navigation-href";
import { revalidateNavigationAfterChange, revalidateNavigationAfterDelete } from "./hooks/revalidate-content";

const targetOptions = [
  { label: "Same tab", value: "_self" },
  { label: "New tab", value: "_blank" }
];

const childLinkFields: CollectionConfig["fields"] = [
  { name: "label", type: "text", required: true },
  {
    name: "href",
    type: "text",
    required: true,
    validate: validateNavigationHref,
    hooks: { beforeValidate: [normalizeNavigationHrefHook] }
  },
  { name: "target", type: "select", defaultValue: "_self", options: targetOptions }
];

export const Navigation: CollectionConfig = {
  slug: "navigation",
  admin: { useAsTitle: "name" },
  access: {
    read: publicReadPublished,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  },
  hooks: {
    afterChange: [revalidateNavigationAfterChange],
    afterDelete: [revalidateNavigationAfterDelete]
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "location",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Header", value: "header" },
        { label: "Footer", value: "footer" }
      ]
    },
    {
      name: "status",
      type: "select",
      required: true,
      index: true,
      defaultValue: "published",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" }
      ]
    },
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "href",
          type: "text",
          validate: validateOptionalNavigationHref,
          hooks: { beforeValidate: [normalizeNavigationHrefHook] }
        },
        { name: "target", type: "select", defaultValue: "_self", options: targetOptions },
        {
          name: "children",
          type: "array",
          fields: childLinkFields
        }
      ]
    }
  ]
};
