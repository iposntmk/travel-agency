import type { Field } from "payload";

// Keep in sync with OTA_PROVIDERS in src/lib/ota-providers.ts.
const PROVIDER_OPTIONS: { label: string; value: string }[] = [
  { label: "GetYourGuide", value: "getyourguide" },
  { label: "Viator", value: "viator" },
  { label: "Klook", value: "klook" },
  { label: "Civitatis", value: "civitatis" },
  { label: "GuruWalk", value: "guruwalk" }
];

function placementGroup(name: string, description: string): Field {
  return {
    name,
    type: "group",
    admin: { description },
    fields: [
      { name: "enabled", type: "checkbox", defaultValue: true },
      {
        name: "providers",
        type: "select",
        hasMany: true,
        options: PROVIDER_OPTIONS,
        admin: { description: "Which providers to show here. Leave empty to use the built-in default." }
      },
      { name: "heading", type: "text", admin: { description: "Override the card heading (default: \"More things to do in {city}\")." } },
      { name: "blurb", type: "textarea" }
    ]
  };
}

export const otaField: Field = {
  name: "ota",
  type: "group",
  label: "OTA / external experiences",
  admin: {
    description:
      "Configure external travel-partner (OTA) widgets. Add an affiliate URL template per provider to earn commission without a code change."
  },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Master switch for all OTA widgets across the site." }
    },
    {
      name: "providers",
      type: "array",
      label: "Provider catalog",
      admin: { description: "Per-provider affiliate config. Empty URL template = generic search link." },
      fields: [
        { name: "key", type: "select", required: true, options: PROVIDER_OPTIONS },
        { name: "label", type: "text", admin: { description: "Optional display name override." } },
        {
          name: "urlTemplate",
          type: "text",
          admin: {
            description:
              "Affiliate URL with a {city} token, e.g. https://www.getyourguide.com/s/?q={city}&partner_id=ABC123. Leave blank for the default search URL."
          }
        },
        { name: "enabled", type: "checkbox", defaultValue: true }
      ]
    },
    {
      name: "placements",
      type: "group",
      label: "Where widgets appear",
      fields: [
        placementGroup("home", "Homepage \"Featured Experiences\" section."),
        placementGroup("destination", "Destination detail pages."),
        placementGroup("tour", "Tour detail pages.")
      ]
    }
  ]
};
