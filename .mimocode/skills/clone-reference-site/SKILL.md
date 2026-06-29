---
name: clone-reference-site
description: Clone a reference website's UI/UX into this Next.js project — extract styles, compare screenshots, implement matching components, verify responsive layout.
---

# Clone Reference Site Skill

Systematic workflow for cloning a reference website's UI/UX into this Travel-Agency Next.js project. Used when the user wants to match an existing site's design, layout, colors, spacing, animations, and responsive behavior.

## When to Use

- User says "clone", "match", "giống trang gốc", "theo trang gốc", "design like [site]"
- User provides a reference URL or local source path
- User shares screenshots of the target design

## Prerequisites

- Reference source accessible (URL, local path, or screenshots)
- Target pages identified in `src/app/(frontend)/`
- `pnpm` available (never npm/yarn)

## Workflow

### Phase 1: Reconnaissance

1. **Identify reference source**
   - URL: use Playwright (`pnpm exec playwright`) for DOM inspection — webfetch truncates large HTML
   - Local path: read source files directly
   - Screenshots: examine provided images

2. **Extract reference data**
   - CSS values: colors, fonts, spacing, borders, shadows
   - Layout: grid structure, column counts, breakpoints
   - Components: section hierarchy, interaction patterns
   - Images: catalog all image assets with paths, dimensions, alt text
   - Behaviors: scroll-driven, click-driven, hover effects

3. **Save extraction artifacts** (optional, for complex pages)
   - `docs/research/` directory for screenshots, JSON data, DOM dumps

### Phase 2: Planning

1. **Map section topology** — list every section top-to-bottom with names and interaction models
2. **Identify shared components** — reuse existing (Header, Footer, FloatingWidgets, Section, ImageCard, etc.)
3. **Create implementation plan** — phases ordered by dependency, file-by-file changes
4. **Get user approval** before implementing

### Phase 3: Implementation

1. **Foundation** — update `globals.css` with design tokens, add CSS variables if needed
2. **Component-by-component** — implement in phase order
   - Keep components under 150 lines (extract sub-components)
   - Use `"use client"` only for interactive parts; keep Server Components where possible
   - Match izitour/design tokens exactly: `#00947d` (teal), `#fb6a00` (orange CTA), etc.
3. **Responsive** — implement mobile-first, then desktop enhancements
   - Single column mobile, multi-column desktop
   - Touch targets ≥ 44px on mobile
   - Text ≥ 12px minimum

### Phase 4: Verification

1. **Visual comparison** — screenshot comparison with reference (Playwright if available)
2. **Responsive audit** — test at 375px, 768px, 1024px+, 1440px
3. **Code quality** — `pnpm typecheck`, `pnpm test`, `pnpm lint`
4. **Fix differences** — iterate until pixel-perfect match

## Key Patterns

### Color Tokens (izitour reference)
```css
--izitour-primary: #00947d;    /* teal/green — active tabs, highlights */
--izitour-orange: #fb6a00;     /* orange — booking CTAs */
--izitour-text: #333333;       /* headings */
--izitour-text-light: #777777; /* secondary text */
--izitour-border: #e5e7eb;     /* borders */
--izitour-tab-bg: #0f2421;     /* dark tab background */
--izitour-tab-border: #1a3834; /* tab dividers */
```

### Tailwind Quirk
Tailwind JIT may not render arbitrary hex values (`bg-[#0f2421]`) correctly in some contexts. Use CSS variables via inline style as fallback:
```tsx
style={{ background: "var(--izitour-tab-bg)" }}
```

### Section Spacing
User prefers `py-12 md:py-16` over `py-20 md:py-24` (found latter too large).

### Client/Server Split
- `page.tsx` stays as Server Component
- Interactive sections (tabs, gallery, accordion, forms) extracted to `"use client"` components
- Same pattern as reference sites using single-file client components

### File Size Limits
- UI components: 150 lines max
- Server Actions/Services: 250 lines max
- Payload collection configs: 200 lines max

## Common Gotchas

- **Server Components cannot have event handlers** — extract interactive parts into separate client components
- **ImageCard `wide` prop adds `col-span-2`** — breaks 4-column grids; use `tall` only for consistent grids
- **`bg-brand-orange` doesn't exist** — use hardcoded `bg-[#fb6a00]` or CSS variable
- **Edit tool requires Read first** — after renaming/moving files, must Read the new path before Edit works
- **`.next` cache stale types** — after route renames, clear `.next` directory before typecheck
