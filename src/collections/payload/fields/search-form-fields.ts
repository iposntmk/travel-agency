import type { Field } from "payload";

// Homepage search form: tab labels + the option lists shown in each dropdown.
// Leave a list empty to keep the built-in defaults (see src/components/home/search-form.tsx).
// The "Start From" dropdown is NOT configured here — it is derived live from destinations.

// `value` must match a backend contract, do not invent values:
//  - tour type   -> Tours.type slug
//  - duration    -> "min-max" day range (e.g. "6-10", "16-" for 16+)
//  - cruise night-> integer night count sent as ?nights=
//  - style       -> product-category slug (see scripts/seed.ts)
function optionList(name: string, label: string, valueHint: string): Field {
  return {
    name,
    type: "array",
    label,
    admin: { description: "Leave empty to use built-in defaults." },
    fields: [
      { name: "label", type: "text", required: true },
      { name: "value", type: "text", required: true, admin: { description: valueHint } }
    ]
  };
}

export const searchFormField: Field = {
  name: "searchForm",
  type: "group",
  label: "Homepage search form",
  admin: {
    description:
      "Tabs and dropdown options for the search box under the hero. Enable/disable the whole box in Homepage sections → search."
  },
  fields: [
    {
      name: "tabs",
      type: "array",
      label: "Tabs",
      admin: { description: "Header buttons. Leave empty for the default Tours / Halong / Mekong tabs." },
      fields: [
        { name: "label", type: "text", required: true, admin: { description: 'e.g. "Halong Bay Cruises"' } },
        {
          name: "target",
          type: "select",
          required: true,
          defaultValue: "tours",
          admin: { description: "Where the Search button sends the visitor." },
          options: [
            { label: "Tours search (/tours)", value: "tours" },
            { label: "Cruises search (/cruises)", value: "cruises" }
          ]
        }
      ]
    },
    optionList("tourTypes", "Tour types", 'Tours.type slug, e.g. "paid-private"'),
    optionList("tourDurations", "Tour durations", '"min-max" day range, e.g. "6-10" or "16-"'),
    optionList("cruiseNights", "Cruise durations", "Integer night count, e.g. \"2\""),
    optionList("styles", "Travel styles", 'product-category slug, e.g. "culture"')
  ]
};
