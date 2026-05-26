# Tối ưu hiệu suất website — kế hoạch triển khai

> Tài liệu này hợp nhất Báo cáo phân tích hiệu suất `/tours` + đánh giá bổ sung. Mục tiêu: trang nhanh cho pax toàn cầu, ít rủi ro, triển khai theo từng phase độc lập.

---

## 1. Tổng quan

### 1.1. Bối cảnh

- Pax (khách hàng) truy cập website từ khắp nơi trên thế giới: US, EU, SEA, AU.
- Báo cáo gốc nhận định `/tours` chậm do thiếu DB index. Đúng nhưng chưa đủ — còn 3 vấn đề hệ thống lớn hơn: region/colocation, image optimization, function-level caching.
- Business operation ở Vietnam → backend đặt ở Singapore (`sin1`) là gần nhất, kết hợp Edge Network global của Vercel để phục vụ pax toàn cầu.

### 1.2. Mục tiêu hiệu suất

| Kịch bản | Mục tiêu TTFB | Mục tiêu LCP |
|---|---|---|
| Pax steady-state (page warm) | < 150ms toàn cầu | < 2.0s |
| Pax cache miss (sau revalidate) | < 600ms toàn cầu | < 3.5s |
| Form submit / booking action | < 500ms | n/a |

### 1.3. Triết lý thiết kế

1. **CDN edge cache global** (Vercel sẵn có) — pax bất kỳ đâu hit page đã warm → HTML từ POP gần nhất.
2. **Function + Neon DB colocated** ở `sin1` — giảm cross-region latency khi cache miss.
3. **Caching nhiều lớp** — React `cache()` (per-request dedup) + `unstable_cache()` (cross-request) + ISR (page) + CDN edge.
4. **DB index + giảm depth** — khi cache miss thật sự xảy ra, query phải nhanh.
5. **Image optimization qua Vercel CDN** — multi-region, mọi pax hưởng lợi.

---

## 2. Đánh giá báo cáo gốc

### 2.1. Phần ĐÚNG (giữ nguyên)

Đã verify trực tiếp với code:

| Claim báo cáo | Verify |
|---|---|
| `/tours` dùng `getTours` + `getDestinations`, filter `destination/type/season/operation/priceMax` | `src/app/(frontend)/tours/page.tsx:4,54-70` ✓ |
| `getTours` dùng `depth: 1` | `src/lib/cms.ts` ✓ |
| `getTourBySlug` dùng `depth: 2`, `getPostBySlug` dùng `depth: 2` | `src/lib/cms.ts:52` ✓ |
| Tours table thiếu index cho `status`, `tour_type`, `season`, `operation_type`, `is_featured_in_season`, `price_from` | `src/migrations/20260524_160728.ts:326-332` chỉ có 7 index — không có 6 cột trên ✓ |
| Posts table thiếu index cho `status` | migration lines 352-358 ✓ |
| `getTourBySlug`, `getDestinationBySlug`, `getPostBySlug` bị gọi 2 lần (generateMetadata + page body) | `tours/[slug]/page.tsx:35-37` & `:76` ✓ |
| Sitemap fetch 200+100+200 song song | `src/app/(frontend)/sitemap.ts:14-18` ✓ |
| `postgresAdapter` không tune pool/cache | `payload.config.ts:66-73` ✓ |

### 2.2. Phần THIẾU (báo cáo gốc không đề cập)

1. **`vercel.json` không set `regions`** → function default ở US, mọi pax kể cả Singapore đều đi xa. File hiện tại chỉ có 4 dòng config, không có `regions`.
2. **`<Image>` đặt `unoptimized={true}` ở 7 vị trí** → hero 3–5MB tải nguyên về device.
3. **Không có function-level cache** trong `src/lib/cms.ts` — chỉ có `revalidate = 300` ở page. Trong 1 request: `generateMetadata` + page = 2 DB query. Trong 1 cửa sổ revalidate: N request concurrent đều miss đồng thời.
4. **Neon connection không dùng pooler** — `payload.config.ts:69` chỉ truyền `connectionString: env.DATABASE_URL` trực tiếp cho `postgresAdapter`, không có pool tuning. Trong Vercel serverless, mỗi lambda instance có thể mở connection mới → nhanh chóng cạn Neon connection limit (default ~100) → 500 error hoặc handshake 100ms+ mỗi request.
5. **R2 upload không set `Cache-Control`** — `s3Storage` plugin trong `payload.config.ts:78-93` không cấu hình `putObjectOptions.CacheControl`. Vercel CDN/Image Optimizer fetch ảnh từ R2 phải re-fetch thường xuyên, tốn egress R2 và làm chậm cache warm.
6. **Không có `<link rel="preconnect">` cho R2 domain** — `src/app/(frontend)/layout.tsx` không khai báo preconnect. Pax xa (US/EU) tốn 50–100ms cho DNS + TLS handshake với R2 trước khi tải ảnh đầu tiên.
7. **Không có streaming UI / skeleton** cho `/tours` filter — pax mạng yếu thấy trang "khựng" khi áp filter, dù backend nhanh.

---

## 3. Danh sách 12 điểm cần làm

| # | Điểm | File chính | Impact | Phase |
|---|---|---|---|---|
| 1 | Vercel region pin Singapore | `vercel.json` | Mọi cache miss đi `sin1` thay vì US, colocate với Neon | P0 |
| 2 | Cache + dedup trong CMS getters | `src/lib/cms.ts` | Dedup request, -50% DB hits | P1 |
| 3 | Hook invalidation khi content đổi | `src/collections/payload/hooks/*.ts` + Tours/Destinations/Posts collections | Content refresh instant, không chờ revalidate 5 phút | P1 |
| 4 | Image optimization | `next.config.ts` + 7 pages | Hero < 200KB AVIF, -70% transforms | P1 |
| 5 | Nested data fetch riêng | `src/lib/cms.ts` + `tours/[slug]/page.tsx` | Depth 2 → 1, -30% payload | P2 |
| 6 | DB indexes cho filter columns | `src/migrations/<new>.ts` | Cache miss + ISR regen nhanh, không Seq Scan | P2 |
| 7 | Health check endpoint | `src/app/api/health/route.ts` | Verify region + DB latency liên tục | P3 |
| 8 | Neon Pooler URL + pool tuning | Vercel env + `payload.config.ts` | Connect DB <10ms thay vì ~100ms, hết lỗi connection exhaustion | P0 |
| 9 | R2 `Cache-Control` immutable | `payload.config.ts` (`s3Storage.putObjectOptions`) | Giảm R2 egress, Vercel CDN cache lâu | P1 |
| 10 | Preconnect R2 domain | `src/app/(frontend)/layout.tsx` | -50–100ms cho ảnh đầu tiên của pax US/EU | P2 |
| 11 | Streaming + skeleton cho `/tours` | `tours/page.tsx` + Suspense boundary | Perceived performance, hết "trang khựng" | P2 |
| 12 | Quy tắc bắt buộc cho third-party scripts | bất kỳ component nào nhúng GA/FB Pixel/HubSpot | Bảo vệ TBT/FID khi marketing thêm tracking | P3 |

---

## 4. Chi tiết kỹ thuật từng điểm

### Điểm 1 — Vercel region pin Singapore (P0)

**Vấn đề:** `vercel.json` hiện tại không có `regions` → Vercel deploy default US (`iad1` hoặc `sfo1`). Mọi pax (kể cả SG, AU) đều phải đi US round-trip cho cache miss.

**Hành động:** sửa `vercel.json`:

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "regions": ["sin1"]
}
```

**Tại sao single region:**
- Multi-region với Neon serverless tạo cross-region query cho region không phải SG → tệ hơn.
- Edge Network global đã cache HTML cho mọi pax. Function chỉ chạy khi ISR miss → tần suất thấp, chấp nhận latency từ vùng xa.
- Pin trong `vercel.json` để Git là nguồn config duy nhất, không lệ thuộc dashboard.

**Phụ thuộc:** Neon DB phải ở `ap-southeast-1`. Verify thủ công trên https://console.neon.tech trước khi deploy. Nếu Neon đang ở US, migrate trước (dump + restore sang project SG, downtime ~10 phút).

---

### Điểm 2 — Cache + dedup trong CMS getters (P1)

**Vấn đề:** trong cùng 1 request, `generateMetadata` và page body gọi `getTourBySlug(slug)` 2 lần → 2 query Neon riêng biệt. Trong cùng 1 cửa sổ revalidate 5 phút, N request concurrent cho cùng 1 slug → N query thật.

**Hành động:** trong `src/lib/cms.ts`, wrap mỗi getter bằng React `cache()` (dedup trong 1 render) + Next.js `unstable_cache()` (chia sẻ giữa request):

```ts
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';
import config from '@payload-config';

export const getTourBySlug = cache(
  unstable_cache(
    async (slug: string) => {
      const payload = await getPayload({ config });
      const res = await payload.find({
        collection: 'tours',
        where: { slug: { equals: slug }, status: { equals: 'active' } },
        depth: 1,
        limit: 1,
      });
      return res.docs[0] ?? null;
    },
    ['tour-by-slug'],
    { revalidate: 300, tags: ['tours'] },
  ),
);
```

Áp dụng pattern này cho: `getTourBySlug`, `getDestinationBySlug`, `getPostBySlug`, `getTours`, `getDestinations`, `getToursForDestination`, `getPublishedPosts`.

Tags gợi ý:
- Tours: `['tours']` (list) hoặc `['tours', \`tour-${slug}\`]` (chi tiết)
- Destinations: `['destinations']`, `['destinations', \`destination-${slug}\`]`
- Posts: `['posts']`, `['posts', \`post-${slug}\`]`

---

### Điểm 3 — Hook invalidation khi content đổi (P1)

**Vấn đề:** chỉ có `revalidate = 300` ở page → admin sửa nội dung phải chờ tới 5 phút.

**Hành động:** tạo Payload hooks gọi `revalidateTag()` khi content đổi.

**File mới** `src/collections/payload/hooks/revalidate-tours.ts`:

```ts
import { revalidateTag } from 'next/cache';
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

export const revalidateToursAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateTag('tours');
  if (doc?.slug) revalidateTag(`tour-${doc.slug}`);
};

export const revalidateToursAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateTag('tours');
  if (doc?.slug) revalidateTag(`tour-${doc.slug}`);
};
```

Tạo tương tự cho `revalidate-destinations.ts` và `revalidate-posts.ts`.

**Wire vào collection config** `src/collections/payload/Tours.ts`:

```ts
import { revalidateToursAfterChange, revalidateToursAfterDelete } from './hooks/revalidate-tours';

export const Tours: CollectionConfig = {
  slug: 'tours',
  // ... existing config
  hooks: {
    afterChange: [revalidateToursAfterChange],
    afterDelete: [revalidateToursAfterDelete],
  },
};
```

Tương tự cho `Destinations.ts` và `Posts.ts`.

**Lưu ý CLAUDE.md:** "Extract complex Payload lifecycle hooks into a `/hooks` subdirectory" — pattern này tuân thủ.

---

### Điểm 4 — Image optimization (P1)

**Vấn đề:** `<Image unoptimized />` xuất hiện ở 7 vị trí → ảnh tải nguyên full-res từ R2, không resize/format conversion. Hero 3–5MB.

**Hành động A — tune `next.config.ts`** (thêm `images` config):

```ts
const nextConfig: NextConfig = {
  // ... existing config
  images: {
    remotePatterns: buildRemotePatterns(),
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2_678_400, // 31 ngày
  },
};
```

**Hành động B — bỏ `unoptimized` ở 7 file:**

```
src/components/tour-card.tsx:32
src/app/(frontend)/destinations/page.tsx:48
src/app/(frontend)/destinations/[slug]/page.tsx:96
src/app/(frontend)/blog/page.tsx:50
src/app/(frontend)/tours/[slug]/page.tsx:134
src/app/(frontend)/tours/[slug]/page.tsx:144
src/app/(frontend)/blog/[slug]/page.tsx:83
```

Giữ nguyên `sizes` prop (đã có), thêm `priority` cho hero image của trang chi tiết.

**Trade-off chi phí:** Vercel Image Optimization tính theo "Image Transformations". `minimumCacheTTL` cao + `deviceSizes` hợp lý giảm ~70% transformations. Nếu vẫn cao, fallback là pipeline R2 + Sharp variants async (Layer 3 trong `docs/MEDIA_STRATEGY.md`) — dùng pre-rendered variants thay vì on-demand.

---

### Điểm 5 — Nested data fetch riêng (P2)

**Vấn đề:** `getTourBySlug` dùng `depth: 2` → 1 query Postgres kéo theo ~14 join (destination + partner + gallery[] media + addOns[] partner + addOn.partner.location + seo.ogImage). Cross-region làm tệ thêm.

**Hành động:** giảm `depth: 2 → 1` cho `getTourBySlug` (đã làm ở Điểm 2), fetch nested cần thiết riêng:

```ts
export const getTourGallery = cache(
  unstable_cache(
    async (tourId: string) => {
      const payload = await getPayload({ config });
      const tour = await payload.findByID({ collection: 'tours', id: tourId, depth: 2, select: { gallery: true } });
      return tour?.gallery ?? [];
    },
    ['tour-gallery'],
    { revalidate: 300, tags: ['tours'] },
  ),
);

export const getTourAddOns = cache(
  unstable_cache(
    async (tourId: string) => {
      // tương tự cho addOns
    },
    ['tour-addons'],
    { revalidate: 300, tags: ['tours'] },
  ),
);
```

Trong `src/app/(frontend)/tours/[slug]/page.tsx`, gọi parallel:

```ts
const tour = await getTourBySlug(slug);
if (!tour) notFound();

const [gallery, addOns] = await Promise.all([
  getTourGallery(tour.id),
  getTourAddOns(tour.id),
]);
```

Mỗi getter cached riêng → invalidate granular, payload nhỏ hơn ~30%.

---

### Điểm 6 — DB indexes (P2)

**Vấn đề:** khi cache miss (sau revalidate, sau deploy, filter combo lạ), query DB chạy Seq Scan trên `tours` và `posts` cho cột `status`, `tour_type`, `season`, `operation_type`, `is_featured_in_season`, `price_from`.

**Hành động:** tạo migration mới.

```bash
pnpm payload:migrate:create
```

Trong file migration vừa tạo, thêm:

```sql
CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status");
CREATE INDEX "tours_tour_type_idx" ON "tours" USING btree ("tour_type");
CREATE INDEX "tours_season_idx" ON "tours" USING btree ("season");
CREATE INDEX "tours_operation_type_idx" ON "tours" USING btree ("operation_type");
CREATE INDEX "tours_is_featured_in_season_idx" ON "tours" USING btree ("is_featured_in_season");
CREATE INDEX "tours_price_from_idx" ON "tours" USING btree ("price_from");
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");
```

Composite indexes (chỉ thêm sau khi `EXPLAIN ANALYZE` cho thấy combo phổ biến):

```sql
CREATE INDEX "tours_status_destination_idx" ON "tours" USING btree ("status", "destination_id");
CREATE INDEX "tours_status_type_season_idx" ON "tours" USING btree ("status", "tour_type", "season");
```

Chạy:

```bash
pnpm payload:migrate
```

Dùng `CREATE INDEX CONCURRENTLY` nếu DB đang có traffic production và muốn no-lock — nhưng cần chạy ngoài transaction.

---

### Điểm 8 — Neon Pooler URL + pool tuning (P0)

**Vấn đề:** `payload.config.ts:66-73` truyền `connectionString: env.DATABASE_URL` trực tiếp, không có pool config và không bắt buộc dùng pooler URL của Neon. Mỗi lambda cold start mở connection mới → handshake TCP + TLS + Postgres auth ~100ms; concurrent traffic dễ chạm Neon connection limit (~100 connection cho free/launch tier) → 500 hoặc timeout.

**Hành động A — đổi env `DATABASE_URL`:** trên Vercel dashboard (cả Preview + Production), thay URL bằng dạng pooler của Neon:

```
postgresql://<user>:<pwd>@<project>-pooler.<region>.aws.neon.tech/<db>?sslmode=require
```

(Neon Console → Connection Details → chọn "Pooled connection"). Pooler dùng PgBouncer mode `transaction` → an toàn cho serverless.

**Hành động B — tune pool trong `payload.config.ts`:**

```ts
db: postgresAdapter({
  migrationDir: path.resolve(dirname, "src/migrations"),
  pool: {
    connectionString: env.DATABASE_URL,
    max: 5,                  // mỗi lambda instance, không cần lớn vì Fluid Compute reuse
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  },
  prodMigrations: migrations,
  push: false,
}),
```

**Lưu ý migrations:** PgBouncer transaction mode KHÔNG hỗ trợ `LISTEN/NOTIFY` và một số DDL pattern. Khi chạy `pnpm payload:migrate`, dùng **direct URL** (không pooler) qua env riêng `DATABASE_URL_UNPOOLED` nếu migration fail.

**BẮT BUỘC cập nhật schema Zod trong `src/config/env.ts`:** hiện tại có 2 schema cần thêm key mới — `envSchema` (line 7) và `payloadConfigEnvSchema` (line 30). Nếu không thêm, runtime đọc `env.DATABASE_URL_UNPOOLED` sẽ là `undefined` và TypeScript không complain → bug âm thầm.

```ts
// src/config/env.ts
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),              // pooler — runtime
  DATABASE_URL_UNPOOLED: z.string().url().optional(), // direct — migration
  // ... rest unchanged
});

export const payloadConfigEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: z.string().url().optional(),
  // ... rest unchanged
});
```

Đồng thời cập nhật `.env.example` và Vercel env (Preview + Production) để có biến mới.

**Hành động C — force migrate qua URL unpooled:** trong `payload.config.ts`, khi chạy command CLI (`process.env.PAYLOAD_MIGRATING === 'true'` hoặc detect qua `process.argv`), swap connection string. Vì env schema đã có `DATABASE_URL_UNPOOLED` (cập nhật ở trên), TypeScript biết key này tồn tại:

```ts
const isMigrating = process.argv.some((a) => a.includes('migrate'));
const dbUrl = isMigrating
  ? (env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL)
  : env.DATABASE_URL;

db: postgresAdapter({
  migrationDir: path.resolve(dirname, "src/migrations"),
  pool: {
    connectionString: dbUrl,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  },
  prodMigrations: migrations,
  push: false,
}),
```

Tránh lỗi "prepared statement \"s1\" does not exist" khi lỡ tay chạy migrate qua pooler.

**Verify:** sau deploy, gọi `/api/health` (Điểm 7) → `dbPingMs` phải < 30ms. Nếu vẫn 100ms+, kiểm tra URL có thật sự là `-pooler` không.

---

### Điểm 9 — R2 `Cache-Control` immutable (P1)

**Vấn đề:** `s3Storage` plugin trong `payload.config.ts:78-93` không truyền `putObjectOptions`. Khi Payload upload ảnh lên R2, object không có header `Cache-Control` → Vercel CDN và Image Optimizer dùng default ngắn → re-fetch thường xuyên, tốn egress R2 + làm chậm cache warm cho pax xa.

**Hành động:** thêm `putObjectOptions` vào `s3Storage` config:

```ts
s3Storage({
  bucket: storageEnv.R2_BUCKET,
  clientUploads: true,
  collections: {
    media: {
      // truyền options vào per-collection để chỉ áp cho media
    },
  },
  config: { /* ... */ },
  // áp cho tất cả PUT
  putObjectOptions: {
    CacheControl: 'public, max-age=31536000, immutable',
  },
}),
```

Ảnh là content-addressed (filename Payload chứa hash hoặc Payload thay file khi user re-upload) → an toàn dùng `immutable`. Nếu admin replace file giữ tên, cần force purge R2 object riêng — Payload đã handle bằng cách generate filename mới nếu collision.

**Phụ thuộc:** Điểm này chỉ áp dụng cho file upload **MỚI**. Object cũ trong R2 phải patch header thủ công bằng `rclone` hoặc script S3 SDK `CopyObject` (copy lên chính nó với metadata mới). Một-time job.

**Verify:** `curl -I https://<r2-public-url>/<file>` → thấy `cache-control: public, max-age=31536000, immutable`.

---

### Điểm 10 — Preconnect R2 domain (P2)

**Vấn đề:** `src/app/(frontend)/layout.tsx` không có `<link rel="preconnect">`. Pax ở US/EU lần đầu load page phải DNS lookup + TLS handshake với R2 domain trước khi tải ảnh đầu tiên → tốn 50–100ms cho LCP.

**Hành động:** thêm preconnect vào `<head>` của root layout. Vì Next.js App Router không có `<head>` tag tường minh, dùng metadata API hoặc inline trong `<html>`:

```tsx
// src/app/(frontend)/layout.tsx
export default function FrontendLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const r2PublicHost = process.env.NEXT_PUBLIC_R2_PUBLIC_HOST; // ví dụ: media.tctravel.vn hoặc pub-xxx.r2.dev
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {r2PublicHost && (
            <>
              <link rel="preconnect" href={`https://${r2PublicHost}`} crossOrigin="anonymous" />
              <link rel="dns-prefetch" href={`https://${r2PublicHost}`} />
            </>
          )}
        </head>
        <body>
          {/* ... */}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**Lưu ý:** R2 public URL phụ thuộc commit gần đây "Serve Payload media from R2 public URLs" — kiểm tra `NEXT_PUBLIC_R2_PUBLIC_HOST` (hoặc tên biến tương đương) đang dùng host nào, preconnect đúng host đó. Nếu media đi qua Vercel Image Optimizer (`/_next/image`) thì preconnect Vercel domain không cần thiết (cùng origin) — chỉ cần preconnect cho upstream (R2).

**⚠️ Cân nhắc bỏ Điểm 10 hoàn toàn:** sau khi triển khai Điểm 4 (bỏ `unoptimized`), MỌI ảnh đi qua `/_next/image` proxy. **Server Vercel** mới là bên kết nối R2, không phải browser pax → preconnect ở browser thành vô tác dụng và làm "rác" `<head>`. Chỉ giữ Điểm 10 nếu pax tải trực tiếp từ R2 cái gì đó (video, PDF brochure tour, ảnh OG cho social share, hoặc fallback `<img>` không qua next/image). Quyết định cuối: liệt kê asset nào còn fetch trực tiếp R2 — nếu danh sách rỗng → bỏ Điểm 10 khỏi roadmap.

---

### Điểm 11 — Streaming + skeleton cho `/tours` (P2)

**Vấn đề:** `/tours` SSR đầy đủ → khi pax đổi filter (server-side navigation), trang trắng đến khi fetch xong. Pax mạng yếu cảm thấy app "khựng" dù backend đã nhanh.

**Hành động A — tách filter UI và list ra:**

```tsx
// src/app/(frontend)/tours/page.tsx
import { Suspense } from 'react';
import { TourFilters } from './_components/tour-filters';
import { TourList } from './_components/tour-list';
import { TourListSkeleton } from './_components/tour-list-skeleton';

export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  return (
    <main>
      <TourFilters />
      <Suspense key={JSON.stringify(sp)} fallback={<TourListSkeleton />}>
        <TourList searchParams={sp} />
      </Suspense>
    </main>
  );
}
```

`TourList` là async Server Component gọi `getTours(...)`. `key={JSON.stringify(sp)}` để Suspense reset skeleton khi filter đổi.

**Hành động B — skeleton grid:**

```tsx
// _components/tour-list-skeleton.tsx
export function TourListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-slate-100" style={{ aspectRatio: '4/3' }} />
      ))}
    </div>
  );
}
```

**Lưu ý CLS:** skeleton phải có cùng kích thước (hoặc gần đúng) với card thật → khi card load không bị "đẩy" layout. Đặt `aspectRatio` cố định cho ảnh trong card thật.

---

### Điểm 12 — Quy tắc bắt buộc cho third-party scripts (P3)

**Vấn đề:** pax overseas thường đi kèm yêu cầu tracking (Google Analytics, Facebook Pixel, HubSpot chat, Hotjar). Mỗi script chèn "ngây thơ" qua `<script src="...">` trong `layout.tsx` sẽ chạy đồng bộ trước hydration → tăng TBT/FID đáng kể, làm giảm hết công sức tối ưu ở Điểm 1–11.

**Hành động:** quy định trong CLAUDE.md (hoặc `docs/CODING_GUIDELINES.md`) — MỌI script tracking BẮT BUỘC dùng `next/script` với strategy hợp lý:

```tsx
import Script from 'next/script';

// GA, FB Pixel — load sau khi page interactive
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXX"
  strategy="afterInteractive"
/>

// Hotjar, chat widget, heatmap — chỉ load khi browser idle
<Script
  src="https://static.hotjar.com/c/hotjar-xxx.js"
  strategy="lazyOnload"
/>
```

**Chiến lược chọn:**
- `beforeInteractive`: chỉ dùng cho polyfill thiết yếu — KHÔNG dùng cho tracking.
- `afterInteractive`: GA4, Facebook Pixel, GTM — load sau hydration nhưng vẫn capture được pageview đầu tiên.
- `lazyOnload`: chat widget (Intercom, Crisp), heatmap (Hotjar, FullStory) — chỉ chạy khi browser rảnh.
- `worker` (experimental): dùng Partytown move script sang web worker — cân nhắc cho GTM nặng nhiều tag.

**Cấm:**
- `<script>` raw tag trong JSX hoặc `dangerouslySetInnerHTML`.
- Inject qua GTM container kéo theo 10+ tag không kiểm soát.
- Đặt script tracking trong Server Component (chạy mỗi request, tốn function time).

**Verify:** Lighthouse mobile — "Reduce the impact of third-party code" và TBT < 200ms. Nếu PM/marketing yêu cầu thêm tag, PR phải có review kèm Lighthouse diff trước/sau.

---

### Điểm 7 — Health check endpoint (P3)

**Vấn đề:** không có cách verify region + latency liên tục → khó phát hiện regression.

**Hành động:** tạo `src/app/api/health/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  let dbPingMs: number | null = null;
  let dbOk = false;

  try {
    const payload = await getPayload({ config });
    const t0 = Date.now();
    await payload.find({ collection: 'tours', limit: 1, depth: 0 });
    dbPingMs = Date.now() - t0;
    dbOk = true;
  } catch (err) {
    dbOk = false;
  }

  return NextResponse.json({
    ok: dbOk,
    region: process.env.VERCEL_REGION ?? 'unknown',
    dbPingMs,
    durationMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  });
}
```

Dùng để:
- Smoke test sau mỗi deploy.
- Cron job ping mỗi 5 phút (Upstash QStash hoặc Vercel Cron) → alert nếu region lệch hoặc `dbPingMs` > 100ms.
- Verify Neon + Vercel colocate.

Endpoint **không xác thực** — chỉ trả thông tin vô hại (region + latency). Không expose secrets.

---

## 5. Verification

### Sau Điểm 1 (region)
1. Vercel dashboard → Functions tab → confirm region `sin1`.
2. `/api/health` (sau khi có Điểm 7) → `region: "sin1"`.
3. WebPageTest từ US/EU/SG → cache miss TTFB phải giảm cho EU/US (đi tới SG ngắn hơn US).

### Sau Điểm 2 (cache + dedup)
1. Thêm `console.log('getTourBySlug', slug)` tạm → load `/tours/[slug]` 1 lần → log in 1 lần (trước đây 2).
2. Load lại trong 5 phút → log không in.

### Sau Điểm 3 (hook invalidation)
1. Mở `/tours/[slug]` ở browser.
2. Vào Payload admin sửa title của tour đó, save.
3. Refresh public page → thấy title mới ngay (không phải chờ 5 phút).

### Sau Điểm 4 (image)
1. DevTools Network → request `/_next/image?url=...` xuất hiện.
2. Hero image < 200KB AVIF/WebP, không phải 3–5MB JPEG.
3. Lighthouse mobile: LCP < 2.5s từ SG, < 4s từ US.

### Sau Điểm 5 (nested fetch)
1. Bật Payload debug log (hoặc Postgres `log_statement = 'all'`) → đếm SQL/page render → ~5–7 thay vì ~14.

### Sau Điểm 6 (DB index)
1. Neon SQL editor:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM tours WHERE status='active' AND tour_type='private';
   ```
   Plan phải là `Index Scan`, không `Seq Scan`.
2. So query time trước/sau: mục tiêu -50% với DB > 1000 rows.

### Sau Điểm 7 (health check)
1. `curl https://<site>/api/health` → `{ ok: true, region: "sin1", dbPingMs: <number>, ... }`.
2. `dbPingMs` < 30ms = colocate OK.
3. `dbPingMs` > 100ms = mismatch region — debug ngay.

### Smoke test tổng

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm dev
```

Manual: click `/tours`, áp filter từng cái, mở chi tiết, submit booking test.

---

## 6. Roadmap triển khai

### Giai đoạn 0 — Verify (Day 0, không code)
- [ ] Verify Neon project region = `ap-southeast-1` trên dashboard.
- [ ] Baseline TTFB/LCP từ US, EU, SG bằng WebPageTest.
- [ ] Nếu Neon ở US → schedule migration trước, KHÔNG triển khai Điểm 1 cho tới khi xong.

### Giai đoạn 1 — P0 region + DB pooler (Day 1, < 2h)
- [ ] Điểm 1: pin `regions: ["sin1"]` trong `vercel.json`, deploy, verify trên dashboard.
- [ ] Điểm 8: đổi `DATABASE_URL` trên Vercel sang Neon pooler URL, thêm pool tuning vào `payload.config.ts`. Test migration qua URL unpooled.

### Giai đoạn 2 — P1 caching + image + R2 (Day 2–3)
- [ ] Điểm 2: wrap CMS getters với `cache()` + `unstable_cache()`, giảm `depth: 2 → 1` cho tour/post by slug.
- [ ] Điểm 3: tạo hooks revalidate cho Tours/Destinations/Posts, wire vào collection.
- [ ] Điểm 4: tune `next.config.ts` images, bỏ `unoptimized` ở 7 file, thêm `priority` cho hero, đảm bảo width/height/aspectRatio để tránh CLS.
- [ ] Điểm 9: thêm `putObjectOptions.CacheControl` vào `s3Storage`; backfill header cho object cũ trên R2 bằng script `CopyObject`.

### Giai đoạn 3 — P2 nested + index + UX (Day 4)
- [ ] Điểm 5: tách `getTourGallery`, `getTourAddOns` riêng, refactor `tours/[slug]/page.tsx` Promise.all.
- [ ] Điểm 6: tạo migration với 7 indexes (status, tour_type, season, operation_type, is_featured_in_season, price_from, posts.status), chạy `pnpm payload:migrate`.
- [ ] Điểm 10: thêm `<link rel="preconnect">` cho R2 public host vào `src/app/(frontend)/layout.tsx`.
- [ ] Điểm 11: refactor `/tours` page với Suspense boundary + skeleton grid.

### Giai đoạn 4 — P3 monitoring + guardrails (Day 5)
- [ ] Điểm 7: tạo `/api/health` endpoint.
- [ ] Setup Vercel Cron hoặc Upstash QStash ping `/api/health` mỗi 5 phút.
- [ ] Điểm 12: thêm quy tắc "MỌI tracking script dùng `next/script` strategy `afterInteractive`/`lazyOnload`" vào `CLAUDE.md` hoặc `docs/CODING_GUIDELINES.md`. Audit tất cả `<script>` raw hiện có (nếu có) → migrate sang `next/script`.

### Giai đoạn 5 — Verify & iterate (Day 6+)
- [ ] WebPageTest lại, so với baseline.
- [ ] Monitor Vercel Analytics, Sentry (nếu bật), Neon dashboard query stats trong 1 tuần.
- [ ] Composite index (Điểm 6 bổ sung) sau khi phân tích query thật.

---

## 7. Rủi ro & ghi chú

- **Neon region mismatch**: nếu Neon ở US mà pin Vercel `sin1`, mọi query cross-region 200ms+ → tệ hơn current. KHÔNG triển khai Điểm 1 nếu Giai đoạn 0 chưa pass.
- **`unstable_cache` API**: tên có `unstable_` nhưng đã production-stable trong Next.js 15. Next 16 có thể đổi sang `cacheTag/cacheLife` directives — cần update khi upgrade.
- **Image transformation cost**: monitor Vercel billing tab tuần đầu sau bật. Nếu vượt ngân sách → switch sang Sharp variants pre-rendered (Layer 3 pipeline).
- **`generateStaticParams` của destinations** đang gọi `getDestinations(50)` — sau Điểm 2 sẽ cached, không vấn đề.
- **Composite index**: chỉ thêm sau khi có data thật về query pattern. Index thừa làm chậm write.
- **Neon Pooler vs Direct**: pooler (PgBouncer transaction mode) không hỗ trợ một số DDL/feature (LISTEN/NOTIFY, prepared statements bền vững). Runtime dùng pooler, **migration phải dùng direct URL** — tách `DATABASE_URL_UNPOOLED` riêng. Nếu `pnpm payload:migrate` báo "prepared statement does not exist" → chắc chắn migration đang đi qua pooler.
- **R2 `Cache-Control: immutable`**: chỉ an toàn khi filename Payload không bị reuse. Nếu admin upload file mới đè tên cũ → CDN giữ bản cũ 1 năm. Payload mặc định auto-rename khi collision, kiểm tra `Media.ts` collection config có giữ behavior này không trước khi bật immutable.
- **Preconnect**: chỉ preconnect domain thật sự dùng — preconnect domain không cần làm chậm trang vì tốn TCP slot. Nếu media đi qua `/_next/image` proxy thì không cần preconnect R2 (cùng origin với site).
- **Suspense + skeleton CLS**: skeleton phải có cùng aspect ratio với card thật. Nếu lệch, Lighthouse phạt CLS dù LCP tốt.
- **Clerk TBT (Total Blocking Time)**: `ClerkProvider` đang bao quanh toàn bộ frontend trong `src/app/(frontend)/layout.tsx`. Trang công khai (`/`, `/tours`, `/destinations`, `/blog`) không cần session → Clerk script load không cần thiết, ảnh hưởng TBT mobile. **Hành động:** tránh gọi `auth()` / `currentUser()` ở layout hoặc trong code chạy mỗi request của trang public; nếu admin-only routes nằm tách biệt, cân nhắc move `ClerkProvider` xuống layout con để trang public load gọn hơn. Đo bằng Lighthouse mobile trước khi tách — nếu TBT < 200ms thì không cần đụng.
- **Typography**: hiện `globals.css` dùng `Arial, Helvetica, sans-serif` (system font) — tốt nhất về hiệu suất (0ms font load, không CLS). Nếu sau này đổi sang Google Fonts cho "premium look" (Montserrat, Playfair Display, etc.) → BẮT BUỘC dùng `next/font/google` để self-host + `font-display: swap` + preload, không bao giờ `<link href="fonts.googleapis.com">` trực tiếp.

---

## 8. Thứ tự ưu tiên "sống còn"

Nếu chỉ có 1 ngày, triển khai theo thứ tự này:

1. **Điểm 1 — Pin region Singapore** → Vercel & Neon "nói chuyện" nhanh nhất.
2. **Điểm 8 — Neon Pooler** → tránh sập site khi traffic đột ngột.
3. **Điểm 2 — Cache + dedup CMS** → giảm tải DB ngay lập tức.

Ba điểm này giải quyết 70% vấn đề. Các điểm còn lại là tinh chỉnh lớp trên.
