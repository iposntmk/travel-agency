import { jsonLdScriptContent, type JsonLdData } from "@/lib/structured-data";

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(data) }}
    />
  );
}
