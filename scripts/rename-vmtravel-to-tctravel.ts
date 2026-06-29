import config from "../payload.config";
import { getPayload } from "payload";

const FROM = "VM Travel";
const TO = "TC travel";

// Deep-replace FROM->TO in every string of a value, immutably.
function deepReplace(value: unknown): { value: unknown; changed: boolean } {
  if (typeof value === "string") {
    if (!value.includes(FROM)) return { value, changed: false };
    return { value: value.split(FROM).join(TO), changed: true };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((v) => {
      const r = deepReplace(v);
      if (r.changed) changed = true;
      return r.value;
    });
    return changed ? { value: next, changed } : { value, changed: false };
  }
  if (value && typeof value === "object") {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const r = deepReplace(v);
      if (r.changed) changed = true;
      next[k] = r.value;
    }
    return changed ? { value: next, changed } : { value, changed: false };
  }
  return { value, changed: false };
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const all = await payload.find({ collection: "posts", limit: 1000, depth: 0, pagination: false });

  let updated = 0;
  for (const post of all.docs) {
    const { value, changed } = deepReplace(post);
    if (!changed) continue;
    await payload.update({
      collection: "posts",
      id: post.id,
      data: value as never,
      overrideAccess: true
    });
    updated += 1;
    console.log(`Renamed in post #${post.id} — ${post.title}`);
  }

  console.log(`Done. Updated ${updated} of ${all.docs.length} posts.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
