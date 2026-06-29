import { getSiteUrl } from "@/config/env";
import { getDestinations, getPublishedPosts } from "@/lib/cms";
import { getToursForList } from "@/lib/cms-list";

// llms.txt — a concise, AI-crawler-friendly map of the site (see llmstxt.org).
// Lets ChatGPT, Perplexity, Claude and other LLMs ground answers about
// TC Travel Vietnam in current, structured facts instead of guessing.
export const revalidate = 86400;

function line(title: string, url: string, note?: string): string {
  return note ? `- [${title}](${url}): ${note}` : `- [${title}](${url})`;
}

export async function GET(): Promise<Response> {
  const base = getSiteUrl().replace(/\/$/, "");
  const [tours, destinations, posts] = await Promise.all([
    getToursForList({ limit: 30 }),
    getDestinations(20),
    getPublishedPosts(20)
  ]);

  const body = [
    "# TC Travel Vietnam",
    "",
    "> Boutique private and small-group tours across Central Vietnam (Hoi An, Hue, Da Nang). Local expert guides, transparent pricing, online booking with book-now-pay-later, plus free walking and cycling tours.",
    "",
    "TC Travel Vietnam is a Vietnam-based travel agency operating self-guided, private, and partner tours. Tours can be customised; prices are shown in USD and include local guides and listed inclusions. International flights and travel insurance are not included.",
    "",
    "## Tours",
    ...tours.map((t) =>
      line(
        t.title,
        `${base}/tours/${t.slug}`,
        [t.durationText, t.priceFrom ? `from ${t.currency ?? "USD"} ${t.priceFrom}` : "free to join"]
          .filter(Boolean)
          .join(", ")
      )
    ),
    "",
    "## Destinations",
    ...destinations.map((d) => line(d.title, `${base}/destinations/${d.slug}`)),
    "",
    "## Travel guides",
    ...posts.map((p) => line(p.title, `${base}/blog/${p.slug}`)),
    "",
    "## Key pages",
    line("Customize a tour", `${base}/customize-tour`),
    line("Free tours", `${base}/free-tours`),
    line("Car rentals", `${base}/car-rentals`),
    line("About us", `${base}/about-us`),
    line("Contact", `${base}/contact`),
    ""
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
