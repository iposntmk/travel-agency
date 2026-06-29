# Blog Video Highlight + Travel Photos Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add izitour-style "Video highlight" and "Travel photos gallery" sections to `/blog`, CMS-driven via a new `SiteSettings.blogMedia` group.

**Architecture:** Schema group on SiteSettings → migration → depth:1 fetcher `getBlogMedia()` → one server component (video iframe) + one client component (gallery rail + lightbox) wired into `page.tsx` after Last comments. Each section auto-hides when its data is empty.

**Tech Stack:** Payload CMS, Next.js App Router (server + client components), Tailwind, Vitest.

## Global Constraints

- Central Vietnam brand only — no Laos/Cambodia copy.
- DB is Neon cloud, `push:false` — migrations generated then run with `pnpm payload:migrate`.
- Immutability, explicit types on public APIs, no `any` (ECC rules).
- YouTube embeds use `youtube-nocookie.com` + `loading="lazy"`.
- Section auto-hide: video hidden when `videoUrl` empty/unparseable; gallery hidden when array empty.

---

### Task 1: YouTube ID parser util (TDD)

**Files:**
- Create: `src/lib/youtube.ts`
- Test: `tests/lib/youtube.test.ts`

**Interfaces:**
- Produces: `export function parseYouTubeId(input: string | null | undefined): string | null`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { parseYouTubeId } from "@/lib/youtube";

describe("parseYouTubeId", () => {
  it("extracts id from watch URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extracts id from youtu.be short URL", () => {
    expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("extracts id from embed URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("accepts a bare 11-char id", () => {
    expect(parseYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("returns null for empty or invalid", () => {
    expect(parseYouTubeId("")).toBeNull();
    expect(parseYouTubeId(null)).toBeNull();
    expect(parseYouTubeId("https://example.com/x")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `pnpm vitest run tests/lib/youtube.test.ts`
Expected: FAIL (module not found / parseYouTubeId undefined)

- [ ] **Step 3: Implement**

```ts
const ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (ID_RE.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return ID_RE.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
    }
  } catch {
    return null;
  }
  return null;
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `pnpm vitest run tests/lib/youtube.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit** (deferred — repo committed in one final commit per user)

---

### Task 2: SiteSettings `blogMedia` schema + migration

**Files:**
- Create: `src/collections/payload/fields/blog-media-fields.ts`
- Modify: `src/collections/payload/SiteSettings.ts` (import + append `blogMediaField` to `fields`)
- Generated: `src/migrations/*`, `src/payload-types.ts`

**Interfaces:**
- Produces: `export const blogMediaField` (Payload group field named `blogMedia`); type `SiteSetting["blogMedia"]`.

- [ ] **Step 1: Create the field module**

```ts
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
```

- [ ] **Step 2: Wire into SiteSettings**

In `src/collections/payload/SiteSettings.ts`: add `import { blogMediaField } from "./fields/blog-media-fields";` and append `blogMediaField` to the `fields` array (after `freeProposalField`).

- [ ] **Step 3: Generate types**

Run: `pnpm payload:generate-types`
Expected: `SiteSetting` interface in `src/payload-types.ts` gains `blogMedia?`.

- [ ] **Step 4: Generate migration**

Run: `pnpm payload:migrate:create blog_media`
Expected: new files in `src/migrations/` adding `blog_media_*` column(s) + `site_settings_blog_media_gallery` table. Do NOT hand-edit.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

---

### Task 3: `getBlogMedia()` fetcher

**Files:**
- Modify: `src/lib/cms.ts`

**Interfaces:**
- Consumes: `getPayloadClient`, `SiteSetting` (already imported in cms.ts), `cache`, `unstable_cache`.
- Produces: `export function getBlogMedia(): Promise<NonNullable<SiteSetting["blogMedia"]> | null>`

- [ ] **Step 1: Add fetcher** (place near `getSiteSettings`, mirror its caching)

```ts
async function fetchBlogMedia(): Promise<NonNullable<SiteSetting["blogMedia"]> | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({ collection: "site-settings", limit: 1, depth: 1 });
  const doc = result.docs[0] as SiteSetting | undefined;
  return doc?.blogMedia ?? null;
}

const getBlogMediaCached = cache(() =>
  unstable_cache(() => fetchBlogMedia(), ["cms", "blog-media"], {
    tags: ["site-settings"]
  })()
);

export function getBlogMedia(): Promise<NonNullable<SiteSetting["blogMedia"]> | null> {
  return getBlogMediaCached();
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

---

### Task 4: `BlogVideo` server component

**Files:**
- Create: `src/app/(frontend)/blog/blog-video.tsx`

**Interfaces:**
- Consumes: `parseYouTubeId` (Task 1), `SiteSetting["blogMedia"]` (Task 2).
- Produces: `export function BlogVideo({ media }: { media: NonNullable<SiteSetting["blogMedia"]> | null })`

- [ ] **Step 1: Implement**

```tsx
import type { SiteSetting } from "@/payload-types";
import { parseYouTubeId } from "@/lib/youtube";

interface BlogVideoProps {
  media: NonNullable<SiteSetting["blogMedia"]> | null;
}

export function BlogVideo({ media }: BlogVideoProps) {
  const id = parseYouTubeId(media?.videoUrl);
  if (!id) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-page px-4 text-center">
        {media?.videoEyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
            {media.videoEyebrow}
          </p>
        ) : null}
        {media?.videoTitle ? (
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-950 md:text-3xl">
            {media.videoTitle}
          </h2>
        ) : null}
        {media?.videoSubtitle ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-navy-600">{media.videoSubtitle}</p>
        ) : null}
        <div className="mx-auto mt-8 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-navy-950 shadow-elevated">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={media?.videoTitle || "Travel video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

---

### Task 5: `BlogGallery` client component (rail + dots + lightbox)

**Files:**
- Create: `src/app/(frontend)/blog/blog-gallery.tsx`

**Interfaces:**
- Consumes: `resolveImage` (`@/lib/media`), `SiteSetting["blogMedia"]`, `next/image`.
- Produces: `export function BlogGallery({ media }: { media: NonNullable<SiteSetting["blogMedia"]> | null })`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { resolveImage } from "@/lib/media";
import type { SiteSetting } from "@/payload-types";

interface BlogGalleryProps {
  media: NonNullable<SiteSetting["blogMedia"]> | null;
}

export function BlogGallery({ media }: BlogGalleryProps) {
  const items = media?.gallery ?? [];
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  if (items.length === 0) return null;

  const scrollToTile = (index: number) => {
    setActive(index);
    const rail = railRef.current;
    const tile = rail?.children[index] as HTMLElement | undefined;
    tile?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section className="bg-mist py-12 md:py-16">
      <div className="mx-auto max-w-page px-4">
        <div className="text-center">
          {media?.galleryEyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-500">
              {media.galleryEyebrow}
            </p>
          ) : null}
          {media?.gallerySubtitle ? (
            <p className="mx-auto mt-2 max-w-2xl text-sm text-navy-600">{media.gallerySubtitle}</p>
          ) : null}
        </div>

        <div
          ref={railRef}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => {
            const image = resolveImage(item.image, item.caption ?? "Travel photo", { variant: "card" });
            return (
              <button
                key={item.id ?? index}
                type="button"
                onClick={() => setLightbox(index)}
                className="group relative aspect-[4/3] w-[80%] flex-none snap-start overflow-hidden rounded-2xl bg-navy-50 shadow-card sm:w-[45%] lg:w-[23.5%]"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 80vw"
                  className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.05]"
                />
                {item.caption ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/70 to-transparent p-3 text-left text-sm font-semibold text-white">
                    {item.caption}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {items.length > 1 ? (
          <div className="mt-5 flex justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.id ?? index}
                type="button"
                aria-label={`Go to photo ${index + 1}`}
                onClick={() => scrollToTile(index)}
                className={`h-2.5 rounded-full transition-all ${
                  active === index ? "w-6 bg-navy-700" : "w-2.5 bg-navy-300 hover:bg-navy-400"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {lightbox !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {(() => {
            const item = items[lightbox];
            const image = resolveImage(item.image, item.caption ?? "Travel photo", { variant: "hero" });
            return (
              <figure className="relative max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <img
                  src={image.url}
                  alt={image.alt}
                  className="mx-auto max-h-[85vh] w-auto rounded-2xl object-contain"
                />
                {item.caption ? (
                  <figcaption className="mt-3 text-center text-sm text-white/90">{item.caption}</figcaption>
                ) : null}
              </figure>
            );
          })()}
        </div>
      ) : null}
    </section>
  );
}
```

Note: confirm `resolveImage` accepts a `{ variant: "hero" }` option; if its signature differs, use the same variant the codebase uses for large images. The `useCallback` import is `import { useCallback, ... }` from "react".

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS (0 errors).

---

### Task 6: Wire sections into `page.tsx`

**Files:**
- Modify: `src/app/(frontend)/blog/page.tsx`

**Interfaces:**
- Consumes: `getBlogMedia` (Task 3), `BlogVideo` (Task 4), `BlogGallery` (Task 5).

- [ ] **Step 1: Imports**

Add:
```ts
import { getBlogMedia } from "@/lib/cms"; // extend existing cms import
import { BlogVideo } from "./blog-video";
import { BlogGallery } from "./blog-gallery";
```
(Merge `getBlogMedia` into the existing `@/lib/cms` import line.)

- [ ] **Step 2: Fetch in parallel**

Change the `Promise.all` to include blog media:
```ts
const [posts, destinations, comments, blogMedia] = await Promise.all([
  getPublishedPosts(24),
  getDestinations(12),
  getRecentPostComments(6),
  getBlogMedia()
]);
```

- [ ] **Step 3: Render after comments** (only in the non-filtering return)

```tsx
      <BlogRecentComments comments={comments} />
      <BlogVideo media={blogMedia} />
      <BlogGallery media={blogMedia} />
    </main>
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

---

### Task 7: Seed gallery sample + verify in browser

**Files:**
- Modify: `scripts/seed.ts` (add `blogMedia` to the site-settings upsert: leave `videoUrl` empty, set `gallery` to 4–6 existing media references; set eyebrow/subtitle defaults). Match the existing seed pattern for referencing media docs.

- [ ] **Step 1: Add blogMedia to seed**

In the site-settings create/update payload, add (using already-seeded media ids/vars the script holds):
```ts
blogMedia: {
  videoEyebrow: "Video highlight",
  videoSubtitle: "Explore the real captures of Central Vietnam through filming.",
  videoUrl: "",
  galleryEyebrow: "Travel photos gallery",
  gallerySubtitle: "A collection of amazing photos from Central Vietnam.",
  gallery: galleryMedia.map((m) => ({ image: m.id }))
}
```
(Use whatever media collection variable the seed already builds; pick 4–6.)

- [ ] **Step 2: Full verification**

Run: `pnpm typecheck && pnpm lint && pnpm vitest run tests/lib/youtube.test.ts`
Expected: all PASS.

- [ ] **Step 3: Migrate + seed live DB** (manual, user-run)

Run: `pnpm payload:migrate` then `pnpm seed`
Then load `http://localhost:3000/blog`, scroll past Last comments:
- Gallery renders rail + dots; clicking a tile opens lightbox; Escape/backdrop/X closes.
- Video section absent until a `videoUrl` is set in admin (expected).

---

## Self-Review notes
- Spec coverage: schema (T2), migration (T2), fetcher depth:1 (T3), video component (T4), gallery+lightbox (T5), wiring+auto-hide (T6), seed (T7), YouTube parse edge cases (T1). All covered.
- Type consistency: `getBlogMedia` return type, `BlogVideo`/`BlogGallery` `media` prop type identical (`NonNullable<SiteSetting["blogMedia"]> | null`).
- Open verification: `resolveImage` variant options — confirm against `src/lib/media.ts` during Task 5; adjust variant name if needed.
