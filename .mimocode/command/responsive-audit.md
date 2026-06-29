---
description: Run a systematic mobile responsiveness audit across all pages — check touch targets, text sizes, overflow, padding, and layout at mobile breakpoints.
---

# Responsive Mobile Audit

Systematic audit of all pages for mobile CSS bugs. Run this when the user asks to check responsive behavior or fix mobile issues.

## Audit Checklist

### 1. Touch Targets (≥44px minimum)
Check all interactive elements:
- [ ] Pagination dots/buttons
- [ ] Navigation arrows (carousel prev/next)
- [ ] Filter buttons and dropdown triggers
- [ ] Star rating buttons
- [ ] Social share icons
- [ ] Close/toggle buttons (hamburger, modal close)
- [ ] Form inputs and selects
- [ ] CTA buttons

**Fix pattern:** Add `min-h-[44px] min-w-[44px]` wrapper or increase `size-*` to `size-11` (44px).

### 2. Text Sizes (≥12px minimum)
Check all text elements:
- [ ] Badges (source, category, status)
- [ ] Review meta (author, date)
- [ ] Card labels (vehicle type, route, stats)
- [ ] Tab text
- [ ] Filter option text

**Fix pattern:** Change `text-[10px]` or `text-[11px]` → `text-[12px]`.

### 3. Horizontal Overflow
Check for elements exceeding viewport:
- [ ] Body `overflow-x-hidden` masking real overflow
- [ ] Pagination with many pages
- [ ] Dropdown menus near viewport edge
- [ ] Tables without `overflow-x-auto` wrapper
- [ ] Fixed-width elements

**Fix pattern:** Add `overflow-x-auto` wrapper or `overflow-hidden` to parent.

### 4. Image Dimensions
Check all `<img>` tags:
- [ ] Have explicit `width` and `height` attributes
- [ ] Use `next/image` `<Image>` component with `fill` + `sizes`
- [ ] Have `object-cover` or `object-contain` as appropriate

### 5. Mobile Padding
Check all page containers:
- [ ] Minimum 16px padding on mobile (`px-4`)
- [ ] No content touching viewport edges
- [ ] Consistent padding across pages

## Page-by-Page Audit

Scan these directories:
```
src/app/(frontend)/**/*.tsx
src/components/**/*.tsx
```

For each page, test at:
- **375px** (iPhone SE small)
- **768px** (iPad)
- **1024px** (desktop)

## Output Format

Report findings as:
```
[FILE:LINE] Category — Description — Fix
```

Example:
```
[src/components/TourCards.tsx:259] Touch target — pagination dots h-2 (8px) — increase to min-h-[44px]
[src/app/car-rentals/page.tsx:264] Tiny text — stats label text-[11px] — change to text-[12px]
```
