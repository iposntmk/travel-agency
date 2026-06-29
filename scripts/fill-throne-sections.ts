import config from "../payload.config";
import { getPayload, type Where } from "payload";

const POST_SLUG = "nguyen-dynasty-golden-throne-restored-thai-hoa-palace-2026";
// Marker heading used for idempotency.
const MARKER_HEADING = "Visiting the Golden Throne: Dos & Don'ts";

type Lex = Record<string, unknown>;

function text(value: string, bold = false): Lex {
  return {
    type: "text",
    version: 1,
    text: value,
    format: bold ? 1 : 0,
    style: "",
    mode: "normal",
    detail: 0
  };
}

function heading(tag: "h2" | "h3", value: string): Lex {
  return {
    type: "heading",
    tag,
    version: 1,
    children: [text(value)],
    direction: "ltr",
    format: "",
    indent: 0
  };
}

function paragraph(value: string): Lex {
  return {
    type: "paragraph",
    version: 1,
    children: [text(value)],
    direction: "ltr",
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: ""
  };
}

function listItem(value: string, index: number): Lex {
  return {
    type: "listitem",
    version: 1,
    value: index + 1,
    checked: undefined,
    children: [text(value)],
    direction: "ltr",
    format: "",
    indent: 0
  };
}

function bulletList(items: string[]): Lex {
  return {
    type: "list",
    tag: "ul",
    listType: "bullet",
    start: 1,
    version: 1,
    children: items.map((it, i) => listItem(it, i)),
    direction: "ltr",
    format: "",
    indent: 0
  };
}

const NEW_NODES: Lex[] = [
  heading("h2", MARKER_HEADING),
  paragraph(
    "Thai Hoa Palace is an active national monument with fragile, irreplaceable artifacts. A little etiquette keeps the experience open and enjoyable for everyone."
  ),
  heading("h3", "Do"),
  bulletList([
    "Arrive early (the citadel opens at 8:00) to photograph the throne before tour groups fill the hall.",
    "Stay behind the marked glass barrier and keep a respectful distance from the dais.",
    "Dress modestly — shoulders and knees covered — as this is a site of national and spiritual significance.",
    "Hire a licensed guide or join a small-group tour to understand the 143 years of history behind the throne."
  ]),
  heading("h3", "Don't"),
  bulletList([
    "Never touch, lean on, or attempt to climb onto the throne or its platform.",
    "Don't use flash photography or tripods inside the palace interior.",
    "Avoid loud conversation, eating, or drinking inside the ceremonial halls.",
    "Don't ignore staff instructions or step over rope and glass barriers for a closer shot."
  ]),
  heading("h2", "Trip Ideas: Fitting the Throne Into Your Hue Itinerary"),
  paragraph(
    "The Golden Throne sits at the heart of the Imperial Citadel, so it slots naturally into any Hue visit. Here is how to plan around it depending on how much time you have."
  ),
  heading("h3", "1 Day in Hue"),
  paragraph(
    "Spend the morning inside the Imperial Citadel: start at Ngo Mon Gate, walk straight to Thai Hoa Palace to see the restored throne, then explore the Forbidden Purple City and royal reading pavilions. In the afternoon, take a short Perfume River boat ride to Thien Mu Pagoda before sunset."
  ),
  heading("h3", "2 Days in Hue"),
  paragraph(
    "Day one as above. On day two, visit the royal tombs — Minh Mang and Khai Dinh are the most striking — then browse Dong Ba Market and finish with a bowl of bun bo Hue. This pace lets you linger at the throne hall without rushing the rest of the citadel."
  ),
  heading("h3", "3 Days in Hue"),
  paragraph(
    "Add a third day for the wider region: the Hai Van Pass and Lang Co Beach to the south, or the DMZ and Vinh Moc Tunnels to the north. With three days you can return to the citadel in the quiet late afternoon for a second, crowd-free look at the throne."
  )
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: "posts",
    where: { slug: { equals: POST_SLUG } } as Where,
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  const post = found.docs[0];
  if (!post) throw new Error(`Post not found: ${POST_SLUG}`);

  const content = post.content as { root?: { children?: Lex[] } } | null;
  const children = content?.root?.children;
  if (!content?.root || !Array.isArray(children)) {
    throw new Error("Post content has no lexical root children");
  }

  const exists = children.some(
    (n) =>
      n.type === "heading" &&
      Array.isArray((n as Lex).children) &&
      ((n as Lex).children as Lex[]).some((c) => (c as Lex).text === MARKER_HEADING)
  );
  if (exists) {
    console.log("= sections already present, skipping");
    console.log("Done.");
    process.exit(0);
  }

  const next = [...children, ...NEW_NODES];
  const newContent = { ...content, root: { ...content.root, children: next } };

  await payload.update({
    collection: "posts",
    id: post.id,
    overrideAccess: true,
    disableTransaction: true,
    data: { content: newContent as never }
  });
  console.log(`~ appended ${NEW_NODES.length} nodes (Dos/Don'ts + Trip Ideas + H3 sub-sections)`);
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
