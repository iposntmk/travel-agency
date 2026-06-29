import type { Field } from "payload";

export const blogMediaField: Field = {
  name: "blogMedia",
  type: "group",
  label: "Blog video & gallery",
  fields: [
    { name: "videoEyebrow", type: "text", defaultValue: "Video highlight" },
    { name: "videoTitle", type: "text" },
    {
      name: "videoSubtitle",
      type: "textarea",
      defaultValue: "Explore the real captures of Central Vietnam through filming."
    },
    {
      name: "videoUrl",
      type: "text",
      admin: { description: "YouTube URL or 11-char video ID. Empty hides the video section." }
    },
    { name: "galleryEyebrow", type: "text", defaultValue: "Travel photos gallery" },
    {
      name: "gallerySubtitle",
      type: "textarea",
      defaultValue: "A collection of amazing photos from Central Vietnam."
    },
    {
      name: "gallery",
      type: "array",
      admin: { description: "Photos shown in the gallery carousel. Empty hides the gallery section." },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" }
      ]
    }
  ]
};
