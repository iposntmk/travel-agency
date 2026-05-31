import type { Field } from "payload";

export const freeProposalField: Field = {
  name: "freeProposal",
  type: "group",
  label: "Free proposal",
  admin: {
    description: "Control the /free-proposal page: enable it, and edit the planning stages and theme chips."
  },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Keep the /free-proposal page reachable (off returns 404)." }
    },
    {
      name: "stages",
      type: "array",
      label: "Planning stages (single choice)",
      fields: [{ name: "value", type: "text", required: true }]
    },
    {
      name: "themes",
      type: "array",
      label: "Theme chips (multi choice)",
      fields: [{ name: "value", type: "text", required: true }]
    },
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "title", type: "text" },
        { name: "subtitle", type: "textarea" }
      ]
    }
  ]
};
