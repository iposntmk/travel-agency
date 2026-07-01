# Đa ngôn ngữ (i18n) — TC Travel Vietnam (as-built)

Kiến trúc: **Payload CMS `localized: true`** cho nội dung + **`next-intl`** cho UI strings + **`[locale]` path prefix** routing. Triển khai 2026-06-30.

> Mục tiêu: bán tours/dịch vụ đa thị trường quốc tế. Toàn bộ nội dung (UI, tour, blog, dịch vụ) đổi theo ngôn ngữ user chọn; content thêm sau trong CMS tự dịch được.

## 1. Locales

8 locale (BCP-47, khớp giữa Payload và next-intl):

| Code | Ngôn ngữ | Thị trường |
|------|----------|-----------|
| `en` (default) | English | US/UK/PH/SG/MY/IN |
| `fr` | Français | Pháp/EU |
| `es` | Español | Tây Ban Nha/Latam |
| `de` | Deutsch | Đức |
| `it` | Italiano | Ý |
| `pt` | Português | Bồ Đào Nha/Brazil |
| `zh-Hans` | 简体中文 | Trung Quốc |
| `zh-Hant` | 繁體中文 | Đài Loan |

Nguyên tắc: locale = NGÔN NGỮ, không phải quốc gia. Các nước nói tiếng Anh (PH/SG/MY/Ấn) dùng chung `en`. `fallback: true` → locale chưa dịch hiển thị bản `en`.

Thêm locale mới: thêm code vào **cả** `payload.config.ts` (`localization.locales`) **và** `src/i18n/routing.ts` (`locales`), tạo `src/i18n/messages/<code>/common.json`, chạy migration + generate-types.

## 2. Payload backend — `localized: true`

`payload.config.ts` bật `localization: { locales: [...8], defaultLocale: "en", fallback: true }`.

Field text/richText/array-text được đánh `localized: true` ở: Tours, Posts, Destinations, Attractions, CarRentals, Cruises, ProductCategories (title/slug/description/seo... + array highlights/inclusions/itinerary/faqs/cabinTypes/tags), Navigation (label item + child), SiteSettings (footer.legalText/address, trust.summary, social.label).

KHÔNG dịch: number/boolean/enum/relationship/upload (priceFrom, durationDays, status, destination, featuredImage...), và Reviews/Comments/TeamMembers/Currencies (user-generated hoặc trung lập ngôn ngữ).

**Slug**: `unique: true` → đổi thành `index: true, localized: true` (Payload unique không đúng cross-locale). Mỗi locale có thể có slug riêng.

### Migration (CRITICAL — cẩn thận mất data)
`payload migrate:create` cho localization tự sinh migration **PHÁ DATA**: drop hết cột text gốc mà KHÔNG copy sang bảng `*_locales`, và `ADD COLUMN _locale NOT NULL` trên bảng array có data (Postgres từ chối). Migration `20260630_151020_i18n_localization.ts` đã **sửa tay**:
1. Array `_locale` thêm `NOT NULL DEFAULT 'en'` rồi `DROP DEFAULT` (backfill row cũ).
2. `INSERT INTO <t>_locales (...) SELECT ...,'en',id FROM <t>` cho 11 bảng locale **TRƯỚC** khi drop cột gốc.
3. `down()` backfill ngược từ `_locales` trước khi drop.

Lệnh: `node --env-file=.env node_modules/payload/bin.js migrate:create <name>` → **review + sửa SQL** → `... migrate`. Đã apply PROD (verify data nguyên: 12 tours/84 posts/9 destinations).

## 3. next-intl routing

- `src/i18n/routing.ts` — 8 locale, `defaultLocale: "en"`, **`localePrefix: "always"`** (mọi locale có prefix, kể cả `/en` — giống izitour.com).
- `src/i18n/request.ts` — load messages, merge `en/common.json` base + file locale (key thiếu fallback en).
- `src/i18n/navigation.ts` — `createNavigation(routing)` → Link/useRouter/usePathname locale-aware.
- `src/i18n/messages/<locale>/common.json` — `en` đầy đủ, 7 locale khác `{}` (dịch dần).
- `src/middleware.ts` — `createMiddleware(routing)` thuần (Clerk chỉ webhook, không cần compose). Matcher loại `api|admin|internal|_next|_vercel|files`.
- `next.config.ts` — wrap `createNextIntlPlugin("./src/i18n/request.ts")`.
- `src/lib/locale-path.ts` — `localizedPath/localizedUrl/buildAlternates(+x-default)/isAppLocale`.

## 4. Routing layer

`src/app/(frontend)/*` → **`src/app/[locale]/*`**. `sitemap.ts` ra `src/app/sitemap.ts` (root, ngoài locale).

Mỗi page:
```tsx
interface PageProps { params: Promise<{ locale: string; /* slug? */ }> }

export async function generateStaticParams() {
  // detail pages: routing.locales × slugs
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: { canonical: localizedUrl(siteUrl, locale, path), languages: buildAlternates(siteUrl, path) } };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);              // giữ static rendering
  const data = await getThing(slug, locale);
  // ...
}
```

`layout.tsx`: `generateStaticParams` (locales), `hasLocale` guard → `notFound()`, `setRequestLocale`, `<html lang={locale}>`, `<NextIntlClientProvider>`, og:locale động (map en→en_US, zh-Hans→zh_CN, zh-Hant→zh_TW...).

## 5. Data layer — locale param + cache-key

Mọi getter trong `src/lib/cms.ts`, `cms-list.ts`, `cms-cruises.ts`, `cms-sitemap.ts` nhận `locale?: string`, truyền vào `payload.find({ locale })` và thêm locale vào **cache-key VÀ tags** của `unstable_cache`:
```ts
unstable_cache(fn, ["cms", "tour", slug, locale], { tags: ["tours", `tour-${slug}`, `${locale}-tour-${slug}`] })
```
Type: Payload `find` locale là union hẹp `Config["locale"]`; giữ param public loose `string`, cast tại find: `asLocale = (l) => l as Config["locale"] | undefined`.

`cms-navigation.ts` dùng `getLocale()` (next-intl/server) trong wrapper vì SiteHeader/Footer không nhận locale qua props.

## 6. UI — language switcher + strings

- `src/components/language-switcher.tsx` (client) — `<select>` 8 locale, `router.replace(pathname, { locale })` giữ nguyên trang. Gắn trong `site-topbar.tsx`.
- UI strings: `useTranslations()` (client) / `getTranslations()` (server) đọc từ `messages/<locale>/common.json`. (Phần lớn UI chữ tĩnh chưa convert sang t() — làm dần.)

## 7. SEO multilingual

- **hreflang + x-default**: `buildAlternates(siteUrl, path)` trong `generateMetadata.alternates.languages` mọi indexable page.
- **canonical** per-locale: `localizedUrl(siteUrl, locale, path)`.
- **sitemap** (`src/app/sitemap.ts`): 1 entry/locale + `alternates.languages` (gồm x-default). 973 URL.
- **og:locale** động trong layout.
- JSON-LD: URL locale-prefixed (breadcrumb/itemList). `inLanguage` per-locale = TODO nhỏ.

## 8. Seed bản dịch

`scripts/seed-localizations.ts` (npm `seed:localizations`) — copy field `en` sang 7 locale khác cho content team có điểm bắt đầu. **Idempotent**: chỉ seed locale đang trống (đọc `fallbackLocale:false`), không ghi đè bản dịch có sẵn. Chưa chạy (fallback đã hiển thị en; chạy khi muốn pre-populate để dịch).

## 9. Trạng thái + việc còn lại

✅ Backend localized + migrated PROD · routing `[locale]` · 19 pages thread locale · data layer · language switcher · sitemap/hreflang/canonical · build xanh (973 trang).

TODO: (a) dịch content CMS + messages 7 locale (đang fallback en); (b) convert UI chữ tĩnh sang `t()`; (c) JSON-LD `inLanguage`; (d) slug riêng per-locale nếu muốn URL bản địa.

## Tham khảo
- https://payloadcms.com/docs/configuration/localization
- https://next-intl.dev/docs/getting-started/app-router
- https://developers.google.com/search/docs/specialty/international/localized-versions
