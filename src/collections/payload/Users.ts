import type { CollectionConfig } from "payload";
import { adminOnly, adminOnlyField, adminOrSelf, adminOrSelfField, authenticated } from "./access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email"
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === "create" && !req.user) {
          return {
            ...data,
            role: "admin"
          };
        }

        return data;
      }
    ]
  },
  access: {
    read: adminOrSelf,
    create: authenticated,
    update: adminOrSelf,
    delete: adminOnly
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" }
      ],
      access: {
        create: adminOnlyField,
        read: adminOrSelfField,
        update: adminOnlyField
      }
    }
  ]
};
