import config from "../payload.config";
import { getPayload, type Where } from "payload";

const POST_SLUG = "nguyen-dynasty-golden-throne-restored-thai-hoa-palace-2026";

// Heading text (exact) -> media id to insert as an inline image right after it.
const IMAGE_AFTER_HEADING: Record<string, number> = {
  "The Restoration: Two Weeks of Meticulous Craftsmanship": 9,
  "Return to Thai Hoa Palace: June 4, 2026": 10,
  "A Living Witness to 143 Years of Imperial History": 8
};

interface LexNode {
  type?: string;
  tag?: string;
  text?: string;
  children?: LexNode[];
  [k: string]: unknown;
}

function plainText(children: LexNode[] | undefined): string {
  if (!children) return "";
  let out = "";
  for (const c of children) {
    if (c.type === "text" && c.text) out += c.text;
    if (c.children) out += plainText(c.children);
  }
  return out.trim();
}

function uploadNode(mediaId: number): LexNode {
  return {
    type: "upload",
    relationTo: "media",
    value: mediaId,
    fields: null,
    format: "",
    version: 3
  };
}

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
  const postId = post.id as number;

  // 1) Delete the pending automated-test comment.
  const testComments = await payload.find({
    collection: "comments",
    where: {
      and: [{ "target.value": { equals: postId } }, { authorName: { equals: "Test Reviewer" } }]
    } as Where,
    limit: 50,
    depth: 0,
    overrideAccess: true
  });
  for (const c of testComments.docs) {
    await payload.delete({ collection: "comments", id: c.id, overrideAccess: true });
    console.log(`- deleted test comment ${c.id}`);
  }
  if (testComments.docs.length === 0) console.log("= no test comment to delete");

  // 2) Insert inline images into the lexical content (idempotent).
  const content = post.content as { root?: { children?: LexNode[] } } | null;
  const children = content?.root?.children;
  if (!content?.root || !Array.isArray(children)) {
    throw new Error("Post content has no lexical root children");
  }

  const alreadyHasImages = children.some((n) => n.type === "upload");
  if (alreadyHasImages) {
    console.log("= inline images already present, skipping insertion");
    console.log("Done.");
    process.exit(0);
  }

  const next: LexNode[] = [];
  let inserted = 0;
  for (const node of children) {
    next.push(node);
    if (node.type === "heading") {
      const mediaId = IMAGE_AFTER_HEADING[plainText(node.children)];
      if (mediaId) {
        next.push(uploadNode(mediaId));
        inserted += 1;
      }
    }
  }

  const newContent = { ...content, root: { ...content.root, children: next } };

  await payload.update({
    collection: "posts",
    id: postId,
    overrideAccess: true,
    disableTransaction: true,
    data: { content: newContent as never }
  });
  console.log(`~ inserted ${inserted} inline image(s) into post ${POST_SLUG}`);

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
