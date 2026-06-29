import config from "../payload.config";
import { getPayload, type Where } from "payload";

const POST_SLUG = "nguyen-dynasty-golden-throne-restored-thai-hoa-palace-2026";
const RELATED_TOUR_SLUG = "hue-imperial-small-group";
const RELATED_POST_SLUGS = [
  "exploring-hue-imperial-city",
  "guide-to-hoi-an-old-town",
  "quang-tri-dmz-travel-guide"
];
const AUTHOR = "Ngoc Tu Dinh";

const SAMPLE_COMMENTS = [
  {
    authorName: "Margaret Coleman",
    rating: 5,
    content:
      "Saw the restored throne in person last week — absolutely breathtaking. The gold leaf glows under the palace lighting. Worth the trip to Hue on its own."
  },
  {
    authorName: "David Brooks",
    rating: 5,
    content:
      "Such a moving restoration story. We booked the Hue Imperial small-group tour after reading this and our guide explained the whole 143-year history. Highly recommend."
  },
  {
    authorName: "Linh Pham",
    rating: 4,
    content:
      "Great write-up of the timeline. Tip for fellow travellers: go early morning to beat the crowds around Thai Hoa Palace."
  }
];

async function findId(collection: "posts" | "tours", slug: string): Promise<number | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection,
    where: { slug: { equals: slug } } as Where,
    limit: 1,
    depth: 0,
    overrideAccess: true
  });
  const doc = res.docs[0];
  return doc ? (doc.id as number) : null;
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const postId = await findId("posts", POST_SLUG);
  if (!postId) {
    throw new Error(`Post not found: ${POST_SLUG}`);
  }

  const tourId = await findId("tours", RELATED_TOUR_SLUG);
  const relatedPostIds: number[] = [];
  for (const slug of RELATED_POST_SLUGS) {
    const id = await findId("posts", slug);
    if (id) relatedPostIds.push(id);
  }

  await payload.update({
    collection: "posts",
    id: postId,
    overrideAccess: true,
    disableTransaction: true,
    data: {
      author: AUTHOR,
      ...(tourId ? { relatedTour: tourId } : {}),
      ...(relatedPostIds.length ? { relatedPosts: relatedPostIds } : {})
    }
  });
  console.log(`~ post ${POST_SLUG}: author + relatedTour=${tourId ?? "none"} + relatedPosts=[${relatedPostIds.join(",")}]`);

  // Create approved sample comments (skip if any already exist for this post).
  const existing = await payload.find({
    collection: "comments",
    where: { "target.value": { equals: postId } } as Where,
    limit: 1,
    depth: 0,
    overrideAccess: true
  });

  if (existing.totalDocs > 0) {
    console.log(`= comments already present for post (${existing.totalDocs}), skipping seed`);
  } else {
    for (const c of SAMPLE_COMMENTS) {
      await payload.create({
        collection: "comments",
        overrideAccess: true,
        disableTransaction: true,
        data: {
          authorName: c.authorName,
          content: c.content,
          rating: c.rating,
          status: "approved",
          target: { relationTo: "posts", value: postId }
        }
      });
      console.log(`+ comment by ${c.authorName} (${c.rating}★)`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
