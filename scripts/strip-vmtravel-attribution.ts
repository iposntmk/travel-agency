import config from "../payload.config";
import { getPayload } from "payload";

// Exact phrase to scrub from blog content (leading space optional).
const PHRASE =
  "This article is adapted from VM Travel (vmtravel.com.vn) for reference and expanded content.";

type LexNode = {
  type?: string;
  text?: string;
  children?: LexNode[];
  [key: string]: unknown;
};

type LexContent = { root?: LexNode } | null | undefined;

function isWhitespace(text: string): boolean {
  return text.trim().length === 0;
}

// Returns [newNode | null, changed]. null => node should be dropped.
function scrubNode(node: LexNode): [LexNode | null, boolean] {
  let changed = false;
  let next: LexNode = node;

  if (typeof node.text === "string" && node.text.includes(PHRASE)) {
    const stripped = node.text.split(PHRASE).join("").replace(/\s{2,}/g, " ").trim();
    next = { ...node, text: stripped };
    changed = true;
    if (stripped.length === 0) return [null, true];
  }

  if (Array.isArray(node.children)) {
    const newChildren: LexNode[] = [];
    let childChanged = false;
    for (const child of node.children) {
      const [scrubbed, c] = scrubNode(child);
      if (c) childChanged = true;
      if (scrubbed !== null) newChildren.push(scrubbed);
    }
    if (childChanged) {
      changed = true;
      next = { ...next, children: newChildren };
      // Drop now-empty block-level container (paragraph/heading) that held only the phrase.
      const isContainer = next.type === "paragraph" || next.type === "heading";
      const onlyWhitespace =
        newChildren.length === 0 ||
        newChildren.every((c) => typeof c.text === "string" && isWhitespace(c.text));
      if (isContainer && onlyWhitespace) return [null, true];
    }
  }

  return [next, changed];
}

function scrubContent(content: LexContent): { content: LexContent; changed: boolean } {
  if (!content?.root) return { content, changed: false };
  const [root, changed] = scrubNode(content.root);
  if (!changed || root === null) return { content, changed: false };
  return { content: { ...content, root }, changed: true };
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const all = await payload.find({
    collection: "posts",
    limit: 1000,
    depth: 0,
    pagination: false
  });

  let updated = 0;
  for (const post of all.docs) {
    const { content, changed } = scrubContent(post.content as LexContent);
    if (!changed) continue;
    await payload.update({
      collection: "posts",
      id: post.id,
      data: { content: content as never },
      overrideAccess: true
    });
    updated += 1;
    console.log(`Scrubbed post #${post.id} — ${post.title}`);
  }

  console.log(`Done. Scrubbed ${updated} of ${all.docs.length} posts.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
