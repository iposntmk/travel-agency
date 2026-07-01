import type { Field } from "payload";

// Section copy fields shared by Featured Tours, Destinations, Team, Free Tours.
// Display copy is `localized` so editors can translate per-locale; `actionHref`
// stays shared (a URL is locale-independent).
function headFields(): Field[] {
  return [
    { name: "eyebrow", type: "text", localized: true },
    { name: "title", type: "text", localized: true },
    { name: "subtitle", type: "textarea", localized: true },
    { name: "actionLabel", type: "text", localized: true },
    { name: "actionHref", type: "text" }
  ];
}

const enabled: Field = {
  name: "enabled",
  type: "checkbox",
  defaultValue: true,
  admin: { description: "Show this section on the homepage." }
};

// Icon keys must match the registry in src/components/home/why-tc-travel.tsx.
const WHY_US_ICONS: { label: string; value: string }[] = [
  { label: "Compass", value: "compass" },
  { label: "Shield", value: "shield" },
  { label: "Wallet", value: "wallet" },
  { label: "Heart", value: "heart" },
  { label: "Sparkle", value: "sparkle" }
];

export const homepageField: Field = {
  name: "homepage",
  type: "group",
  label: "Homepage sections",
  admin: {
    description:
      "Toggle each homepage section on/off and override its copy. Leave a text field blank to keep the built-in default. Copy fields are translatable per language."
  },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        enabled,
        { name: "title", type: "text", localized: true },
        { name: "subtitle", type: "text", localized: true },
        { name: "body", type: "textarea", localized: true },
        {
          name: "trustItems",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true, localized: true },
            { name: "hint", type: "text", localized: true }
          ]
        }
      ]
    },
    {
      name: "search",
      type: "group",
      admin: { description: "Tour search form shown under the hero." },
      fields: [
        enabled,
        { name: "eyebrow", type: "text", localized: true },
        { name: "title", type: "text", localized: true },
        { name: "subtitle", type: "textarea", localized: true }
      ]
    },
    {
      name: "whoWeAre",
      type: "group",
      admin: { description: "Short intro block under the search form." },
      fields: [
        enabled,
        { name: "heading", type: "text", localized: true, admin: { description: 'Section heading, e.g. "Who we are".' } },
        { name: "title", type: "textarea", localized: true, admin: { description: "First paragraph." } },
        { name: "body", type: "textarea", localized: true, admin: { description: "Second paragraph." } },
        { name: "actionLabel", type: "text", localized: true },
        { name: "actionHref", type: "text" }
      ]
    },
    { name: "seasonalBanner", type: "group", fields: [enabled] },
    {
      name: "featuredTours",
      type: "group",
      fields: [
        enabled,
        ...headFields(),
        { name: "tabLabel", type: "text", localized: true, admin: { description: 'Filter tab label, e.g. "PRIVATE TOURS".' } }
      ]
    },
    { name: "cruises", type: "group", fields: [enabled, ...headFields()] },
    { name: "destinations", type: "group", fields: [enabled, ...headFields()] },
    {
      name: "freeTours",
      type: "group",
      fields: [
        {
          name: "sectionEnabled",
          type: "checkbox",
          defaultValue: true,
          admin: { description: "Show the Free Tours section on the homepage." }
        },
        {
          name: "pageEnabled",
          type: "checkbox",
          defaultValue: true,
          admin: { description: "Keep the /free-tours page reachable (off returns 404)." }
        },
        ...headFields()
      ]
    },
    {
      name: "featuredExperiences",
      type: "group",
      admin: { description: "External partner (OTA) section header. Providers are configured in the OTA group." },
      fields: [
        enabled,
        { name: "eyebrow", type: "text", localized: true },
        { name: "title", type: "text", localized: true },
        { name: "subtitle", type: "textarea", localized: true }
      ]
    },
    {
      name: "testimonials",
      type: "group",
      fields: [
        enabled,
        { name: "eyebrow", type: "text", localized: true },
        { name: "title", type: "text", localized: true },
        { name: "subtitle", type: "textarea", localized: true }
      ]
    },
    { name: "team", type: "group", fields: [enabled, ...headFields()] },
    {
      name: "whyUs",
      type: "group",
      fields: [
        enabled,
        { name: "eyebrow", type: "text", localized: true },
        { name: "title", type: "text", localized: true },
        { name: "subtitle", type: "textarea", localized: true },
        {
          name: "items",
          type: "array",
          fields: [
            { name: "icon", type: "select", options: WHY_US_ICONS, defaultValue: "compass" },
            { name: "title", type: "text", required: true, localized: true },
            { name: "body", type: "textarea", required: true, localized: true }
          ]
        }
      ]
    },
    { name: "blog", type: "group", fields: [enabled, ...headFields()] },
    {
      name: "newsletter",
      type: "group",
      fields: [
        enabled,
        { name: "title", type: "text", localized: true },
        { name: "subtitle", type: "textarea", localized: true }
      ]
    }
  ]
};
