# Blog Video Highlight + Travel Photos Gallery — Design

Date: 2026-06-28
Page: `/blog` (`src/app/(frontend)/blog/page.tsx`)
Goal: Add the two remaining izitour blog hub sections — **Video highlight** and **Travel photos gallery** — placed after "Last comments", before footer, matching the original izitour layout (stacked, full-width, centered headings).

## Scope

In:
- Payload schema: new `blogMedia` group on `SiteSettings`.
- DB migration for the new column + gallery array table.
- New fetcher `getBlogMedia()` (depth:1 so gallery uploads resolve).
- Two components: `blog-video.tsx` (server), `blog-gallery.tsx` (client, with lightbox).
- Wire both into `page.tsx` after `BlogRecentComments`.
- `payload-types.ts` regeneration.

Out:
- No homepage changes. No Laos/Cambodia content (Central Vietnam brand focus retained).
- Seed: leave `videoUrl` empty (user fills via admin); seed gallery optional with existing media.

## Schema — `SiteSettings.blogMedia`

New group field appended to `SiteSettings.fields` (after `freeProposalField`):

```
blogMedia (group)
├─ videoEyebrow  text      default "Video highlight"
├─ videoTitle    text      optional heading line
├─ videoSubtitle textarea  default "Explore the real captures of Central Vietnam through filming."
├─ videoUrl      text      YouTube URL or 11-char ID (empty → video section hidden)
├─ galleryEyebrow  text    default "Travel photos gallery"
├─ gallerySubtitle textarea default "A collection of amazing photos from Central Vietnam."
└─ gallery       array     (empty → gallery section hidden)
   └─ fields:
      ├─ image    upload → media (required)
      └─ caption  text (optional, used as lightbox/alt label)
```

Migration: new column(s) on `site_settings` + new table `site_settings_blog_media_gallery` (Payload array convention). Generate via `pnpm payload:migrate:create`, do NOT hand-write. DB is Neon cloud (push:false) — migration must be run with `pnpm payload:migrate` against live DB after merge.

## Data flow

`getSiteSettings()` uses `depth:0` — gallery uploads would not resolve to URLs. Add a dedicated fetcher:

```ts
// src/lib/cms.ts
async function fetchBlogMedia() {
  const payload = await getPayloadClient();
  const result = await payload.find({ collection: "site-settings", limit: 1, depth: 1 });
  return (result.docs[0] as SiteSetting | undefined)?.blogMedia ?? null;
}
// cached like getSiteSettings, tag "site-settings"
export function getBlogMedia(): Promise<NonNullable<SiteSetting["blogMedia"]> | null>
```

`page.tsx` adds `getBlogMedia()` to the existing `Promise.all`, passes `blogMedia` to the two components. Filtering branch (`isFiltering`) does NOT render these sections (matches current behavior of showing only the results grid).

## Components

### `blog-video.tsx` (server component)
- Props: `{ media: BlogMedia | null }`.
- Returns `null` if `!media?.videoUrl`.
- Parse YouTube ID from URL or raw ID (`youtu.be/`, `watch?v=`, `/embed/`, or bare 11-char). Invalid → return `null`.
- Section: `bg-mist py-12 md:py-16`, centered `SectionHead`-style heading (eyebrow/title/subtitle), then a centered `max-w-3xl` 16:9 wrapper containing
  `<iframe src="https://www.youtube-nocookie.com/embed/{id}" loading="lazy" allowfullscreen title=...>` with `aspect-video w-full rounded-2xl`.
- No client JS.

### `blog-gallery.tsx` (client component, `"use client"`)
- Props: `{ media: BlogMedia | null }`.
- Returns `null` if gallery empty.
- Resolve each `image` via `resolveImage` (already handles `Media | number | null`).
- Layout: centered heading, then a horizontal scroll-snap rail showing ~4 tiles on desktop (`snap-x` rail, fixed-width tiles) — matches izitour. Dot indicators below reflect tile count / scroll position (minimal `useState` for active index; clicking a dot scrolls the rail).
- Lightbox: clicking a tile opens a fixed overlay (`role="dialog"`, `aria-modal`) showing the large image + caption; close on backdrop click, Escape key, and a close button. Keep it self-contained in this file (small `useState` for open index). No external library.
- Accessibility: tiles are `<button>`; overlay traps Escape; images have alt from caption/title.

## Edge cases
- `videoUrl` empty or unparseable → video section absent (no empty frame).
- gallery 1–3 images → still renders; rail just shows fewer tiles, dots match count.
- Missing media upload (deleted) → `resolveImage` fallback placeholder, no crash.
- Both sections independent; one missing does not affect the other.

## Verification
- `pnpm payload:generate:types` → `payload-types.ts` gains `blogMedia`.
- `pnpm typecheck`, `pnpm lint` clean.
- Local: fill a `videoUrl` + 4 gallery images in admin (or seed) → both sections render after Last comments; lightbox opens/closes; video iframe loads.
- Migration + seed run against Neon is a post-merge manual step.

## Files touched
- `src/collections/payload/SiteSettings.ts` (or new `fields/blog-media-fields.ts` for cohesion)
- `src/lib/cms.ts` (`getBlogMedia`)
- `src/app/(frontend)/blog/blog-video.tsx` (new)
- `src/app/(frontend)/blog/blog-gallery.tsx` (new)
- `src/app/(frontend)/blog/page.tsx`
- `src/migrations/*` (generated)
- `src/payload-types.ts` (generated)
- `scripts/seed.ts` (optional gallery seed)
