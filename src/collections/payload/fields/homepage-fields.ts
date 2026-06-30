import type { Field } from "payload";

// Section copy fields shared by Featured Tours, Destinations, Team, Free Tours.
function headFields(): Field[] {
  return [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text" },
    { name: "subtitle", type: "textarea" },
    { name: "actionLabel", type: "text" },
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
      "Toggle each homepage section on/off and override its copy. Leave a text field blank to keep the built-in default."
  },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        enabled,
        { name: "title", type: "text" },
        { name: "subtitle", type: "text" },
        { name: "body", type: "textarea" },
        {
          name: "trustItems",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "hint", type: "text" }
          ]
        }
      ]
    },
    {
      name: "search",
      type: "group",
      admin: { description: "Tour search form shown under the hero." },
      fields: [enabled, { name: "eyebrow", type: "text" }, { name: "title", type: "text" }, { name: "subtitle", type: "textarea" }]
    },
    {
      name: "whoWeAre",
      type: "group",
      admin: { description: "Short intro block under the search form." },
      fields: [
        enabled,
        { name: "heading", type: "text", admin: { description: 'Section heading, e.g. "Who we are".' } },
        { name: "title", type: "textarea", admin: { description: "First paragraph." } },
        { name: "body", type: "textarea", admin: { description: "Second paragraph." } },
        { name: "actionLabel", type: "text" },
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
        { name: "tabLabel", type: "text", admin: { description: 'Filter tab label, e.g. "PRIVATE TOURS".' } }
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
      fields: [enabled, { name: "eyebrow", type: "text" }, { name: "title", type: "text" }, { name: "subtitle", type: "textarea" }]
    },
    {
      name: "testimonials",
      type: "group",
      fields: [enabled, { name: "eyebrow", type: "text" }, { name: "title", type: "text" }, { name: "subtitle", type: "textarea" }]
    },
    { name: "team", type: "group", fields: [enabled, ...headFields()] },
    {
      name: "whyUs",
      type: "group",
      fields: [
        enabled,
        { name: "eyebrow", type: "text" },
        { name: "title", type: "text" },
        { name: "subtitle", type: "textarea" },
        {
          name: "items",
          type: "array",
          fields: [
            { name: "icon", type: "select", options: WHY_US_ICONS, defaultValue: "compass" },
            { name: "title", type: "text", required: true },
            { name: "body", type: "textarea", required: true }
          ]
        }
      ]
    },
    { name: "blog", type: "group", fields: [enabled, ...headFields()] },
    {
      name: "newsletter",
      type: "group",
      fields: [enabled, { name: "title", type: "text" }, { name: "subtitle", type: "textarea" }]
    }
  ]
};
