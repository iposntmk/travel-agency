# Tối ưu hiệu suất website — kế hoạch triển khai

> Tài liệu này hợp nhất Báo cáo phân tích hiệu suất `/tours` + đánh giá bổ sung. Mục tiêu: trang nhanh cho pax toàn cầu, ít rủi ro, triển khai theo từng phase độc lập.

> **Trạng thái hiện tại — 2026-05-27:** file backlog này đã được chuyển vào `docs/toiuu.md` và root `toiuu.md` được xóa khỏi repo. Codebase đang ở **Layer 7 - Trust + Engagement started**. Layer 5 booking lead engine đã persist booking vào Payload/Postgres (`d25cedd`), Clerk customer sync đã có route/service/tests (`8dae33e`), Redis/Resend production-readiness đã land (`e8553df`), và public image focal-point rendering đã land (`e7ef37f`). Xem `docs/CURRENT_STATUS.md` trước khi chọn task tiếp theo từ backlog này.

> **Việc còn cần làm ngay:** verify Vercel Production envs + redeploy, cấu hình Clerk webhook live, submit thử booking production để kiểm tra Payload booking `Pending`, customer/internal email, Redis rate limit, và customer sync `clerkUserId`.

> **⚠️ Lưu ý SEO/indexing — đang cố ý tắt hoàn toàn:** site đang `noindex,nofollow,noarchive,nosnippet` cho mọi bot (Google, Bing, AI crawler). Lý do: chưa launch chính thức, không muốn Google index bản MVP với content seed. Cơ chế: `ALLOW_INDEXING` chưa set trên Vercel → `next.config.ts` gửi `X-Robots-Tag: noindex...` + `(frontend)/layout.tsx` set `<meta robots="noindex">`. **KHÔNG bật `ALLOW_INDEXING=true`** khi tối ưu SEO ở Section 9-10 trừ khi đã pass checklist trong `docs/CURRENT_STATUS.md → "Search Engine Indexing — Currently Disabled"`. JSON-LD, canonical, sitemap, hreflang vẫn nên triển khai sẵn để khi mở indexing là Google crawl ngon ngay.

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
5. **Image pipeline phải chốt 1 hướng** — hoặc Vercel Image Optimization, hoặc pre-rendered R2 variants theo `docs/MEDIA_STRATEGY.md`; không chạy song song cả hai.

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

1. **`vercel.json` không set `regions`** → function default ở **`iad1` (Washington D.C., us-east-1)** theo Vercel Functions docs (https://vercel.com/docs/functions/configuring-functions/region). Mọi pax kể cả Singapore đều đi xa. File hiện tại chỉ có 4 dòng config, không có `regions`.
2. **`<Image>` đặt `unoptimized={true}` ở 7 vị trí** → hero 3–5MB tải nguyên về device.
3. **Không có function-level cache** trong `src/lib/cms.ts` — chỉ có `revalidate = 300` ở page. Trong 1 request: `generateMetadata` + page = 2 DB query. Trong 1 cửa sổ revalidate: N request concurrent đều miss đồng thời.
4. **Neon connection không dùng pooler** — `payload.config.ts:69` chỉ truyền `connectionString: env.DATABASE_URL` trực tiếp cho `postgresAdapter`, không có pool tuning. Trong Vercel serverless, mỗi lambda instance có thể mở connection mới → nhanh chóng cạn Neon connection limit (default ~100) → 500 error hoặc handshake 100ms+ mỗi request.
5. **R2 upload không set `Cache-Control`** — repo có 3 đường upload cần audit: Payload S3 storage, signed PUT (`src/lib/r2.ts:createSignedPutUrl`) và server-side variant upload (`r2PutObject`). Custom helpers hiện chưa gửi `CacheControl`; Payload docs không document `putObjectOptions`, nên phải verify API plugin trước khi cấu hình.
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
| 7 | Health check endpoint | `src/app/api/health/route.ts` | Verify region + Payload/DB latency liên tục | P3 |
| 8 | Neon Pooler URL + pool tuning | Vercel env + `payload.config.ts` | Connect DB <10ms thay vì ~100ms, hết lỗi connection exhaustion | P0 |
| 9 | R2 `Cache-Control` immutable | `src/lib/r2.ts` + verify `payload.config.ts` storage path | Giảm R2 egress, CDN cache lâu | P1 |
| 10 | Preconnect R2 domain | `src/app/(frontend)/layout.tsx` | -50–100ms cho ảnh đầu tiên của pax US/EU | P2 |
| 11 | Streaming + skeleton cho `/tours` | `tours/page.tsx` + Suspense boundary | Perceived performance, hết "trang khựng" | P2 |
| 12 | Quy tắc bắt buộc cho third-party scripts | bất kỳ component nào nhúng GA/FB Pixel/HubSpot | Bảo vệ TBT/FID khi marketing thêm tracking | P3 |

---

## 4. Chi tiết kỹ thuật từng điểm

### Điểm 1 — Vercel region pin Singapore (P0)

**Vấn đề:** `vercel.json` hiện tại không có `regions` → Vercel Functions default ở Washington D.C. (`iad1`) theo docs chính thức. Mọi pax (kể cả SG, AU) đều phải đi US round-trip cho cache miss.

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

**⚠️ Bẫy cần tránh trước khi viết code:** `src/lib/cms.ts` hiện đang `try/catch` và return `[]` / `null` khi DB lỗi. Nếu bọc nguyên hàm bằng `unstable_cache`, kết quả fallback rỗng sẽ bị cache 300s — DB phục hồi rồi nhưng pax vẫn thấy "không có tour". **PHẢI throw lại lỗi DB từ trong getter trước khi wrap cache**, để cache layer không poison kết quả lỗi. Catch + log có thể đặt ở caller (page) nếu cần UI fallback.

**Hành động:** trong `src/lib/cms.ts`, thêm `server-only` (theo `docs/CODING_GUIDELINES.md:136`), bỏ catch trả fallback, rồi wrap mỗi getter bằng React `cache()` (dedup trong 1 render) + Next.js `unstable_cache()` (chia sẻ giữa request):

```ts
import "server-only";
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getPayloadClient } from '@/lib/payload';

export const getTourBySlug = cache(
  unstable_cache(
    async (slug: string) => {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: 'tours',
        where: { slug: { equals: slug }, status: { equals: 'active' } },
        depth: 1,
        limit: 1,
      });
      // KHÔNG try/catch ở đây — để lỗi bubble lên cache layer skip cache.
      return res.docs[0] ?? null;
    },
    ['tour-by-slug'],
    { revalidate: 300, tags: ['tours'] },
  ),
);
```

Áp dụng pattern này cho: `getTourBySlug`, `getDestinationBySlug`, `getPostBySlug`, `getTours`, `getDestinations`, `getToursForDestination`, `getPublishedPosts`.

**`server-only` cho các module data/service liên quan:** `src/lib/cms.ts`, `src/lib/payload.ts`, `src/lib/r2.ts`, `src/services/media-processor.ts`. Theo guideline repo (`docs/CODING_GUIDELINES.md:20`) — chặn rò rỉ vào client bundle.

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

**Hành động — bước 1: khai báo `index: true` trong Payload collection fields** (KHÔNG hand-write SQL ngay, để schema config và DB không lệch):

```ts
// src/collections/payload/Tours.ts
fields: [
  { name: 'status', type: 'select', options: [...], index: true },
  { name: 'tourType', type: 'select', options: [...], index: true },
  { name: 'season', type: 'select', options: [...], index: true },
  { name: 'operationType', type: 'select', options: [...], index: true },
  { name: 'isFeaturedInSeason', type: 'checkbox', index: true },
  { name: 'priceFrom', type: 'number', index: true },
  // ...
],
```

Tương tự thêm `index: true` cho `status` trong `src/collections/payload/Posts.ts`.

**Bước 2: generate migration từ schema đã sửa:**

```bash
pnpm payload:migrate:create
```

Payload sẽ tự sinh `CREATE INDEX` cho các field đánh dấu `index: true`. Kiểm tra file migration — content phải tương đương:

```sql
CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status");
CREATE INDEX "tours_tour_type_idx" ON "tours" USING btree ("tour_type");
CREATE INDEX "tours_season_idx" ON "tours" USING btree ("season");
CREATE INDEX "tours_operation_type_idx" ON "tours" USING btree ("operation_type");
CREATE INDEX "tours_is_featured_in_season_idx" ON "tours" USING btree ("is_featured_in_season");
CREATE INDEX "tours_price_from_idx" ON "tours" USING btree ("price_from");
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");
```

**Composite indexes** không hỗ trợ qua `index: true` đơn lẻ — chỉ thêm sau khi `EXPLAIN ANALYZE` cho thấy combo phổ biến, lúc đó mới hand-write SQL trong migration tiếp theo:

```sql
CREATE INDEX "tours_status_destination_idx" ON "tours" USING btree ("status", "destination_id");
CREATE INDEX "tours_status_type_season_idx" ON "tours" USING btree ("status", "tour_type", "season");
```

**Bước 3: chạy migration:**

```bash
pnpm payload:migrate
```

Dùng `CREATE INDEX CONCURRENTLY` nếu DB đang có traffic production và muốn no-lock — nhưng cần chạy ngoài transaction, tách migration riêng.

**Lý do làm theo thứ tự này:** nếu hand-write SQL không có `index: true` trong collection config, `pnpm payload:generate-types` hoặc lần `migrate:create` tiếp theo có thể detect schema drift và sinh migration "DROP INDEX" làm mất index vừa tạo.

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

**BẮT BUỘC cập nhật schema Zod trong `src/config/env.ts`:** hiện tại có 2 schema cần thêm key mới — `envSchema` (line 6) và `payloadConfigEnvSchema` (line 28). Nếu không thêm, runtime đọc `env.DATABASE_URL_UNPOOLED` sẽ là `undefined` và TypeScript không complain → bug âm thầm.

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

**Hành động C — force migrate qua URL unpooled:** trong `payload.config.ts`, dùng `process.argv` để detect migration command. Đọc env qua `getPayloadConfigEnv()` (per repo rule — không đọc trực tiếp `process.env`):

```ts
import { getPayloadConfigEnv } from '@/config/env';

const env = getPayloadConfigEnv();
// process.argv ở scope CLI, không phải secret — dùng được trực tiếp
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

**Lưu ý repo rule (`CLAUDE.md`):** mọi env access phải qua `src/config/env.ts` helpers (`getEnv`, `getPayloadConfigEnv`, `getNextConfigEnv`). KHÔNG đọc `process.env.X` trong module khác. `process.argv` không phải env nên dùng trực tiếp được — nếu muốn ép sạch, đưa logic detect migrate vào một helper riêng trong `src/config/env.ts`.

Tránh lỗi "prepared statement \"s1\" does not exist" khi lỡ tay chạy migrate qua pooler.

**Verify:** sau deploy, gọi `/api/health` (Điểm 7) → `payloadPingMs` phải < 30ms nếu Payload + DB colocate tốt. Nếu vẫn 100ms+, kiểm tra URL có thật sự là `-pooler` không.

---

### Điểm 9 — R2 `Cache-Control` immutable (P1)

**Vấn đề:** repo upload R2 qua **3 đường khác nhau**, cả 3 đều thiếu `Cache-Control`:

1. `s3Storage` plugin từ Payload (`payload.config.ts:78-93`) — upload từ admin UI.
2. `createSignedPutUrl()` (`src/lib/r2.ts:30`) — signed PUT URL cho client upload trực tiếp R2.
3. `r2PutObject()` (`src/lib/r2.ts:42`) — server-side put cho Sharp variant (media processor).

Object không có `Cache-Control` → CDN hoặc Image Optimizer dùng TTL ngắn/default → re-fetch thường xuyên, tốn egress R2.

**Hành động — phải sửa cả 3 đường:**

**A. Custom S3 helpers** (`src/lib/r2.ts`) — thêm `CacheControl` vào `PutObjectCommand`:

```ts
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

export async function createSignedPutUrl(key: string, mimeType: string, expiresIn = 300): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: r2Bucket(),
    Key: key,
    ContentType: mimeType,
    CacheControl: IMMUTABLE_CACHE,   // ← thêm
  });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

export async function r2PutObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const cmd = new PutObjectCommand({
    Bucket: r2Bucket(),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: IMMUTABLE_CACHE,   // ← thêm
  });
  await getClient().send(cmd);
}
```

**Lưu ý signed URL:** khi `CacheControl` nằm trong signed command, client upload buộc phải gửi đúng header `Cache-Control: public, max-age=31536000, immutable` trong request PUT — nếu không signature sẽ fail. Cần đồng bộ ở client uploader.

**B. Payload `s3Storage` plugin** — verify API trước khi viết. Payload docs hiện tại (https://payloadcms.com/docs/upload/storage-adapters) KHÔNG document `putObjectOptions` cho `@payloadcms/storage-s3`. Lựa chọn:
- Đọc source `@payloadcms/storage-s3` xem có hook `beforeUpload`/`config.s3Options` không.
- Nếu không có, chuyển flow upload admin sang custom signed PUT (đi qua đường A) và disable `clientUploads: true`.
- Backup option: dùng Cloudflare R2 bucket rule "Object Lifecycle" hoặc Worker để inject header sau upload.

**KHÔNG copy-paste `putObjectOptions: { CacheControl: … }` mà chưa verify** — version hiện tại của plugin có thể bỏ qua silent.

**C. Backfill object cũ:** script S3 SDK `CopyObject` (copy lên chính nó với metadata mới) hoặc `rclone copyto --header-upload`. Một-time job.

**Immutable an toàn vì:** Payload auto-rename file nếu trùng tên — verify `src/collections/payload/Media.ts` không override behavior này trước khi bật `immutable`. Nếu tên có thể bị reuse, đổi sang `public, max-age=31536000` (bỏ `immutable`) + soft purge khi update.

**Verify:** `curl -I https://<r2-public-url>/<file>` → thấy `cache-control: public, max-age=31536000, immutable`. Test cả 3 path upload (admin, signed PUT, server-side variant).

---

### Điểm 10 — Preconnect R2 domain (P2, **CONDITIONAL**)

**Trạng thái phụ thuộc Điểm 4:** preconnect chỉ có tác dụng khi BROWSER trực tiếp fetch R2.

| Tình huống | Có cần preconnect R2? |
|---|---|
| Hiện tại — `<Image unoptimized />` ở 7 vị trí | ✅ Có ích — browser fetch thẳng R2 → preconnect tiết kiệm 50–100ms |
| Sau khi hoàn tất Điểm 4 (bỏ `unoptimized`) | ❌ Không — `/_next/image` chạy server-side, browser không kết nối R2 |
| OG image, PDF brochure, video direct, `<img>` không qua next/image | ✅ Có — vẫn fetch trực tiếp |

**Vấn đề:** `src/app/(frontend)/layout.tsx` không có `<link rel="preconnect">`. Pax US/EU tốn 50–100ms DNS + TLS handshake với R2 trước khi tải ảnh đầu tiên — ÁP DỤNG cho code hiện tại trước khi Điểm 4 land.

**Hành động — đọc env qua helper (KHÔNG `process.env`):**

```tsx
// src/app/(frontend)/layout.tsx
import { getNextConfigEnv } from '@/config/env';

export default function FrontendLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { R2_PUBLIC_URL } = getNextConfigEnv();
  const r2Host = R2_PUBLIC_URL ? new URL(R2_PUBLIC_URL).host : undefined;
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {r2Host && (
            <>
              <link rel="preconnect" href={`https://${r2Host}`} crossOrigin="anonymous" />
              <link rel="dns-prefetch" href={`https://${r2Host}`} />
            </>
          )}
        </head>
        <body>{/* ... */}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Quyết định triển khai:**
1. Nếu Điểm 4 sẽ làm trong cùng phase với Điểm 10 → **bỏ Điểm 10** (preconnect sẽ thừa ngay khi Điểm 4 xong).
2. Nếu Điểm 4 hoãn (vd. budget Vercel Image transform) → giữ Điểm 10 (quick win 50–100ms).
3. Audit assets fetch trực tiếp R2 (OG image, brochure PDF, video): nếu có → preconnect cho host đó vẫn ích sau khi Điểm 4 xong.

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

**Hành động:** repo đã có rule trong `docs/CODING_GUIDELINES.md` về lazy third-party + consent gate; phần cần làm là enforce bằng checklist/review. MỌI script tracking BẮT BUỘC dùng `next/script` với strategy hợp lý:

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

**Verify:** audit không còn raw `<script>` tracking trong JSX, consent gate vẫn chạy trước analytics/ads, Lighthouse mobile không regress mục "Reduce the impact of third-party code" và TBT < 200ms. Nếu PM/marketing yêu cầu thêm tag, PR phải có review kèm Lighthouse diff trước/sau.

---

### Điểm 7 — Health check endpoint (P3)

**Vấn đề:** không có cách verify region + latency liên tục → khó phát hiện regression.

**Hành động:** tạo `src/app/api/health/route.ts`. Vì `VERCEL_REGION` là biến runtime do Vercel inject (không phải app env), thêm helper vào `src/config/env.ts` thay vì đọc trực tiếp:

```ts
// src/config/env.ts — thêm helper
export function getRuntimeRegion(): string {
  return process.env.VERCEL_REGION ?? 'unknown';
}
```

```ts
// src/app/api/health/route.ts
import "server-only";
import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';
import { getRuntimeRegion } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  let payloadPingMs: number | null = null;
  let payloadOk = false;

  try {
    const payload = await getPayloadClient();
    const t0 = Date.now();
    await payload.find({ collection: 'tours', limit: 1, depth: 0 });
    payloadPingMs = Date.now() - t0;
    payloadOk = true;
  } catch (err) {
    payloadOk = false;
  }

  return NextResponse.json({
    ok: payloadOk,
    region: getRuntimeRegion(),
    payloadPingMs,
    durationMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  });
}
```

Dùng để:
- Smoke test sau mỗi deploy.
- Cron job ping mỗi 5 phút (Upstash QStash hoặc Vercel Cron) → alert nếu region lệch hoặc `payloadPingMs` > 100ms. Chỉ số này đo Payload Local API + DB query nhẹ, không phải raw Postgres ping.
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
1. `curl https://<site>/api/health` → `{ ok: true, region: "sin1", payloadPingMs: <number>, ... }`.
2. `payloadPingMs` < 30ms = colocate OK cho Payload Local API + DB query nhẹ.
3. `payloadPingMs` > 100ms = mismatch region hoặc pooler chưa đúng — debug ngay.

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

### Giai đoạn 0 — Verify + P0 quick fix (Day 0, < 30 phút code)
- [ ] **Xóa `src/app/robots.ts`** (đang `disallow: "/"` block toàn bộ Google bot — bug critical, không phụ thuộc gì khác). Chi tiết Điểm 17 / Section 10.
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
- [ ] Điểm 9: thêm `CacheControl` cho `createSignedPutUrl`/`r2PutObject`; verify riêng Payload S3 storage path trước khi cấu hình; backfill header cho object cũ trên R2 bằng script `CopyObject`.

### Giai đoạn 3 — P2 nested + index + UX (Day 4)
- [ ] Điểm 5: tách `getTourGallery`, `getTourAddOns` riêng, refactor `tours/[slug]/page.tsx` Promise.all.
- [ ] Điểm 6: tạo migration với 7 indexes (status, tour_type, season, operation_type, is_featured_in_season, price_from, posts.status), chạy `pnpm payload:migrate`.
- [ ] Điểm 10: chỉ thêm `<link rel="preconnect">` cho R2 public host nếu browser còn fetch trực tiếp R2; bỏ nếu Điểm 4 chuyển ảnh qua `/_next/image`.
- [ ] Điểm 11: refactor `/tours` page với Suspense boundary + skeleton grid.

### Giai đoạn 4 — P3 monitoring + guardrails (Day 5)
- [ ] Điểm 7: tạo `/api/health` endpoint.
- [ ] Setup Vercel Cron hoặc Upstash QStash ping `/api/health` mỗi 5 phút.
- [ ] Điểm 12: enforce rule third-party script đã có trong `docs/CODING_GUIDELINES.md` bằng checklist/review; audit tất cả `<script>` raw hiện có (nếu có) → migrate sang `next/script`.

### Giai đoạn 5 — Verify & iterate (Day 6+)
- [ ] WebPageTest lại, so với baseline.
- [ ] Monitor Vercel Analytics, Sentry (nếu bật), Neon dashboard query stats trong 1 tuần.
- [ ] Composite index (Điểm 6 bổ sung) sau khi phân tích query thật.

---

## 7. Rủi ro & ghi chú

- **Neon region mismatch**: nếu Neon ở US mà pin Vercel `sin1`, mọi query cross-region 200ms+ → tệ hơn current. KHÔNG triển khai Điểm 1 nếu Giai đoạn 0 chưa pass.
- **`unstable_cache` API**: hoạt động tốt với Next.js 15 (repo đang dùng). Theo Next.js docs (https://nextjs.org/docs/app/api-reference/functions/unstable_cache), Next 16 thay thế bằng `"use cache"` directive + `cacheTag()` / `cacheLife()`. **Khi upgrade Next 16 sẽ cần migration cache strategy bắt buộc** — `unstable_cache` không phải drop-in compatible. Plan migration ngay khi nâng version, không treat là "có thể đổi".
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

---

## 9. Bổ sung — SEO quốc tế + Mobile + Monitoring

> Phần này bổ sung 13 điểm chưa được cover ở Section 3 (1–12): SEO cho pax quốc tế, tối ưu mobile/low-bandwidth, và monitoring liên tục. Đã verify trực tiếp với codebase trước khi đưa vào.

### 9.1. Findings từ verify trực tiếp

- ⚠️ **Có 2 file `robots.ts`**: `src/app/robots.ts` đang **`disallow: "/"`** (block toàn bộ crawler!) tồn tại song song với `src/app/(frontend)/robots.ts` (allow `/`, disallow `/admin`, `/api`). Cả hai cùng target `/robots.txt`, tạo route conflict/ambiguity và có thể làm Google bị chặn crawl hoàn toàn. **PHẢI xóa `src/app/robots.ts` ngay** trước khi triển khai bất cứ SEO point nào dưới đây.
- Không có JSON-LD, canonical, alternates ở bất kỳ page frontend nào.
- `sitemap.ts` fetch toàn bộ tour/destination/post field, không `select`, không cache function-level.
- `ClerkProvider` bao toàn bộ `src/app/(frontend)/layout.tsx` — pax public load Clerk SDK không cần thiết (đã đề cập note 685, chưa fix).

### 9.2. Danh sách 13 điểm bổ sung

| # | Điểm | Impact | Phase |
|---|---|---|---|
| 13 | hreflang / đa ngôn ngữ | SEO quốc tế — tránh duplicate cross-language | P2 |
| 14 | Structured data (JSON-LD) | Rich snippet travel — CTR +5–15% | P1 |
| 15 | Canonical URLs cho filter/param | Tránh duplicate content penalty, bảo vệ crawl budget | P1 |
| 16 | Sitemap optimization (`select` + `lastmod` + cache) | Crawl budget hiệu quả | P2 |
| 17 | robots.ts — xóa duplicate + chặn query param | Ngăn bot crawl URL rác; fix bug block Google | **P0** |
| 18 | Bundle size / JS payload audit | 3G/4G load time cho pax SEA, Ấn Độ | P2 |
| 19 | Payload response size — `select` fields | Giảm 50–80% payload mỗi cache miss | P1 |
| 20 | Cold start mitigation | Request đầu tiên sau deploy không chậm 200–500ms | P3 |
| 21 | LCP breakdown ngoài ảnh (font, CSS) | LCP text block, không chỉ ảnh | P2 |
| 22 | Mobile performance target riêng | Lighthouse mobile ≥ 90 | P2 |
| 23 | Tách Clerk khỏi public layout | Giảm 100–200KB JS cho 90% traffic public | P1 |
| 24 | Core Web Vitals monitoring liên tục | RUM từ pax thật, không chỉ synthetic | P3 |
| 25 | Geographic test matrix cụ thể | Test đúng thị trường/thiết bị/network | P3 |

---

## 10. Chi tiết kỹ thuật điểm 13–25

### Điểm 13 — hreflang / đa ngôn ngữ (P2)

**Vấn đề:** site hiện chỉ tiếng Anh. Nếu sau này thêm `/vi`, `/ja`, `/ko`, `/zh`, Google cần biết quan hệ giữa các bản qua `hreflang`. Thiếu → coi mỗi bản là duplicate.

**Hành động (baseline ngay bây giờ):** làm sau Điểm 26 (`metadataBase`) và tránh set canonical global sai. Với site hiện chỉ có tiếng Anh, chỉ cần nền `metadataBase`; nếu muốn thêm baseline `x-default` + `en`, đặt ở route/page có canonical đúng thay vì ép mọi page canonical về homepage:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    languages: { en: '/', 'x-default': '/' },
  },
};
```

**Khi triển khai i18n thật:** route `[lang]/...`, mỗi page tự khai báo canonical + alternate tương ứng (`/tours/foo`, `/vi/tours/foo`, ...). Không làm hreflang nửa vời (thiếu reciprocal link là lỗi phổ biến nhất).

---

### Điểm 14 — Structured data / JSON-LD (P1)

**Vấn đề:** Google hỗ trợ rich result cho `Product` + `Offer` (price/availability/review). `TouristTrip` đúng ngữ nghĩa travel hơn nhưng không phải rich-result type mạnh bằng `Product`. Hiện không có JSON-LD nào → mất cơ hội CTR và Google hiểu entity kém hơn.

**Hành động — tour detail:**

```tsx
// tours/[slug]/page.tsx
const image = resolveImage(tour.featuredImage, tour.title);
const description =
  tour.seo?.metaDescription?.trim() ||
  lexicalToPlainText(tour.description) ||
  `Book ${tour.title} with TC Travel Vietnam.`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  additionalType: 'https://schema.org/TouristTrip',
  name: tour.title,
  description,
  image: image.isFallback ? undefined : image.url,
  url: `${getSiteUrl()}/tours/${tour.slug}`,
  offers: tour.priceFrom != null ? {
    '@type': 'Offer',
    price: tour.priceFrom,
    priceCurrency: tour.currency ?? 'USD',
    availability: 'https://schema.org/InStock',
  } : undefined,
};

return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    {/* page content */}
  </>
);
```

| Trang | Schema |
|---|---|
| `/tours/[slug]` | `Product` + `Offer` + `additionalType: TouristTrip` + `AggregateRating` (nếu có review hợp lệ) |
| `/destinations/[slug]` | `TouristDestination` |
| `/blog/[slug]` | `Article` hoặc `BlogPosting` |
| `/booking/confirmation` | `EventReservation` |
| Mọi page | `BreadcrumbList` |
| `/tours` (list) | `ItemList` |
| FAQ section | `FAQPage` |

**Verify:** Google Rich Results Test — paste URL, schema không warning.

---

### Điểm 15 — Canonical URLs cho filter/param (P1)

**Vấn đề:** `/tours?destination=halong&type=private&season=summer` là URL khác `/tours` nhưng content chỉ là subset. Không có `rel="canonical"` → duplicate content penalty cho `/tours`.

**Hành động A — canonical filter URL về `/tours`:**

```tsx
// tours/page.tsx
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const hasFilters = Object.keys(sp).length > 0;
  return {
    alternates: { canonical: hasFilters ? '/tours' : undefined },
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}
```

**Hành động B — nếu muốn index filter (SEO landing):** canonical về chính nó + content unique (title, H1, meta riêng cho từng combo). Không nửa vời.

Kết hợp với Điểm 17 (robots) để chặn crawl filter param.

---

### Điểm 16 — Sitemap optimization (P2)

**Vấn đề:** `src/app/(frontend)/sitemap.ts` fetch 200+100+200 docs full field, không cache function-level. Sau Điểm 2 (cache CMS getters) thì OK, nhưng thiếu `select`, `priority`, `changeFrequency` còn cải thiện tiếp.

**Hành động:**

```ts
// src/app/(frontend)/sitemap.ts
export const revalidate = 86400; // sitemap không cần real-time

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, posts] = await Promise.all([
    getTours({ limit: 200, select: { slug: true, updatedAt: true } }),
    getDestinations(100, { select: { slug: true, updatedAt: true } }),
    getPublishedPosts(200, { select: { slug: true, updatedAt: true } }),
  ]);
  // … build entries with lastmod, priority, changeFrequency
}
```

**Nếu tours > 500:** dùng Next.js `generateSitemaps` để tách sitemap index (`sitemap-tours-0.xml`, …).

---

### Điểm 17 — robots.ts dọn dẹp + chặn query param (P0)

**Bug critical:** `src/app/robots.ts` đang `disallow: "/"` → **block toàn bộ Google bot**. Đồng thời tồn tại `src/app/(frontend)/robots.ts` allow `/`. Hai metadata route cùng resolve ra `/robots.txt` tạo route conflict/ambiguity; dù build chọn file nào thì risk vẫn quá cao cho SEO.

**Hành động (làm NGAY, không chờ phase nào):**

1. **Xóa `src/app/robots.ts`** — file gốc disallow toàn bộ, có thể là sót khi scaffold.
2. **Sửa `src/app/(frontend)/robots.ts`** cộng thêm rule chặn filter param:

```ts
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/booking/", "/*?*"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

**Lưu ý:** `/*?*` block MỌI query param. Nếu sau này có filter landing page muốn index, thêm `allow` cụ thể TRƯỚC disallow.

**Verify:** `curl https://tctravel.vn/robots.txt` → đúng rule mong muốn, KHÔNG còn `Disallow: /`.

---

### Điểm 18 — Bundle size / JS payload audit (P2)

**Vấn đề:** pax SEA, Ấn Độ, Nam Mỹ dùng 3G/4G (1–5 Mbps). JS bundle 500KB+ mất 5–8s tải.

**Hành động A — audit:**

```bash
pnpm add -D @next/bundle-analyzer
ANALYZE=true pnpm build
```

**Hành động B — code splitting component nặng:**

```tsx
const TourMap = dynamic(() => import('./_components/tour-map'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-slate-200 rounded-lg" />,
});
```

**Hành động C — check tree-shaking:**
- Rich text renderer (slate/lexical) — chỉ import editor cần.
- shadcn/ui — không import `@radix-ui/*` trực tiếp.
- `date-fns` — `import { format } from 'date-fns/format'` thay vì `import { format } from 'date-fns'`.

**Target:** `/tours` JS < 150KB gzipped, tour detail < 200KB gzipped.

---

### Điểm 19 — Payload response size — `select` fields (P1)

**Vấn đề:** `getTours` fetch toàn bộ field (`description`, `itinerary` JSON dài, `seo`, `gallery[]` media). `TourCard` hiện chỉ cần title, slug, featured image, destination title, price/currency, tourType, season và một vài badge → payload 2–5x lớn hơn cần thiết.

**Hành động:** thêm getter dành riêng cho list view trong `src/lib/cms.ts`:

```ts
export const getToursForList = cache(
  unstable_cache(
    async (filters: TourFilters) => {
      const payload = await getPayload({ config });
      return payload.find({
        collection: 'tours',
        where: buildTourWhereClause(filters),
        depth: 1,
        limit: 12,
        select: {
          title: true,
          slug: true,
          featuredImage: true,
          destination: true,
          priceFrom: true,
          currency: true,
          tourType: true,
          season: true,
          operationType: true,
          isFeaturedInSeason: true,
          minPax: true,
          currentPax: true,
        },
      });
    },
    ['tours-list'],
    { revalidate: 300, tags: ['tours'] },
  ),
);
```

Giữ `getTours` cũ cho sitemap/admin.

**Lưu ý:** với relationship field, `depth > 0` vẫn kéo full object liên quan dù có `select` — test trước khi tin số liệu.

**Target:** response size cho `/tours` giảm 50–80%.

---

### Điểm 20 — Cold start mitigation (P3)

**Vấn đề:** sau deploy hoặc traffic thấp → instance scale-to-zero → cold start 200–500ms.

**Lưu ý quan trọng:** Vercel Fluid Compute (default từ 2025) reuse instance giữa request → cold start gần như biến mất. Verify trên Vercel dashboard xem project đã bật Fluid chưa. Nếu bật → có thể bỏ qua điểm này hoàn toàn.

**Nếu vẫn cần keep-warm:**

```json
// vercel.json
{
  "crons": [
    { "path": "/api/health", "schedule": "*/5 * * * *" }
  ]
}
```

Cron ping `/api/health` (Điểm 7) mỗi 5 phút.

---

### Điểm 21 — LCP breakdown ngoài ảnh (P2)

**Vấn đề:** Điểm 4 đã cover ảnh hero. Nhưng LCP còn là text block: font load, CSS blocking, layout shift, không inline critical CSS.

**Hành động A — font strategy:** giữ system font hiện tại (`Arial, Helvetica, sans-serif`) — tốt nhất performance. Nếu sau này đổi sang Google Fonts:

```ts
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});
```

**Hành động B — inline CSS (chỉ thử nghiệm có đo đạc):**

```ts
// next.config.ts
experimental: { inlineCss: true }
```

Next docs hiện tại gọi flag này là `experimental.inlineCss` và ghi rõ chưa khuyến nghị production. Chỉ bật trong branch thử nghiệm nếu thấy LCP/FCP bị CSS request waterfall, chạy `pnpm build` + Lighthouse/WebPageTest trước/sau, và rollback nếu HTML bloat hoặc returning visitor mất lợi ích cache stylesheet.

---

### Điểm 22 — Mobile performance target riêng (P2)

**Vấn đề:** Section 1.2 đặt target generic, không tách mobile 3G/4G. Lighthouse desktop 95+ dễ đạt, nhưng mobile mới là thước đo cho pax quốc tế.

**Target mobile (Moto G4, 4G throttled):**

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP | < 2.5s |
| TBT | < 200ms |
| CLS | < 0.1 |
| Speed Index | < 3.0s |

**Test tool:** Lighthouse CI mobile preset, WebPageTest Moto G4 4G từ Singapore + Dulles VA.

**Enforce:** Lighthouse CI trong pipeline — block PR nếu mobile score giảm > 5 điểm.

---

### Điểm 23 — Tách Clerk khỏi public layout (P1)

**Vấn đề:** `ClerkProvider` bao toàn bộ `src/app/(frontend)/layout.tsx` → tải Clerk script (~100–200KB) ngay cả trên `/`, `/tours`, `/destinations`, `/blog` — nơi 90% traffic không cần auth. Tăng TBT, chậm hydration mobile. (Đã được note 685 đề cập, đây là phương án triển khai cụ thể.)

**Hành động — tách route group:**

```
src/app/(frontend)/
├── layout.tsx              ← public, KHÔNG có ClerkProvider
├── (public)/{page,tours,destinations,blog}/...
└── (auth)/
    ├── layout.tsx          ← CÓ ClerkProvider
    └── {account,booking}/...
```

**Nếu cần Clerk session ở public page (hiển thị "My Bookings" link):** dùng API route nhẹ `GET /api/auth/me` thay vì load toàn bộ Clerk SDK trong layout.

```ts
// src/app/api/auth/me/route.ts
import { auth } from '@clerk/nextjs/server';
export async function GET() {
  const { userId } = await auth();
  return Response.json({ isLoggedIn: !!userId });
}
```

**Trade-off:** tách layout = public/auth không share React tree, navigation giữa 2 nhóm unmount/remount. Với travel site (đa số traffic public browse), tách layout có lợi.

---

### Điểm 24 — Core Web Vitals monitoring liên tục (P3)

**Vấn đề:** Điểm 7 (health check) + WebPageTest manual không đo CWV từ pax thật. Synthetic test không phản ánh network thực tế.

**Hành động A — Vercel Analytics Web Vitals (free):**

```tsx
import { Analytics } from '@vercel/analytics/react';
// trong layout
<Analytics />
```

Dashboard → Analytics → Web Vitals: LCP/CLS/INP/FCP theo country/device/page.

**Hành động B — Sentry Performance (nếu đã dùng Sentry):**

```ts
Sentry.init({
  dsn: env.SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
});
```

**Hành động C — alert:** Vercel Analytics không có alert built-in. Build thủ công hoặc dùng SpeedCurve / Checkly.

**Target monitoring:**
- LCP p75 mobile < 3s (mọi country)
- CLS p75 < 0.1
- INP p75 < 200ms

---

### Điểm 25 — Geographic test matrix cụ thể (P3)

**Vấn đề:** Section 5 nói "WebPageTest từ US/EU/SG" nhưng không định nghĩa location + device + network. Mỗi thị trường có đặc thù riêng.

**Test matrix cố định:**

| # | Thị trường | Location | Device | Network | LCP target |
|---|---|---|---|---|---|
| 1 | Vietnam | Singapore EC2 | Moto G4 | 4G (9/0.8 Mbps) | < 2.5s |
| 2 | SEA | Singapore EC2 | Moto G4 | 3G Slow (0.4/0.4) | < 4.5s |
| 3 | US East | Dulles VA EC2 | Desktop emu | Cable (5/1) | < 2.0s |
| 4 | US West | San Jose EC2 | Moto G4 | 4G | < 3.0s |
| 5 | Europe | London EC2 | Moto G4 | 4G | < 3.0s |
| 6 | Australia | Sydney EC2 | Moto G4 | 4G | < 3.0s |
| 7 | India | Mumbai EC2 | Moto G4 | 3G Slow | < 5.0s |

Tích hợp vào CI post-deploy qua WebPageTest API hoặc Lighthouse CI multi-config.

---

## 11. Roadmap bổ sung (Day 3–7)

### Giai đoạn 6 — P0 SEO fix (ĐÃ ĐƯA LÊN GIAI ĐOẠN 0)
- [x] **Điểm 17 (phần xóa)**: xóa `src/app/robots.ts` — đã đưa lên Giai đoạn 0 trong roadmap chính (Section 6) để fix ngay trước mọi phase khác.

### Giai đoạn 7 — P1 SEO + payload size (Day 3–4)
- [ ] **Điểm 26 (metadataBase + canonical an toàn)**: setup nền tảng SEO trước khi làm canonical từng page (xem dưới).
- [ ] **Điểm 15**: canonical URLs cho filter param trên `/tours`, `/destinations`.
- [ ] **Điểm 14**: JSON-LD cho tour detail, destination, blog, breadcrumb.
- [ ] **Điểm 19**: `getToursForList` với `select` fields — giảm payload list view.
- [ ] **Điểm 23**: tách Clerk khỏi public layout — route group `(public)` / `(auth)`.
- [ ] **Điểm 27 (media variants reconciliation)**: đồng bộ `docs/MEDIA_STRATEGY.md` với implementation — mặc định dùng pre-rendered R2 variants đã được docs chọn, hoặc đổi rõ sang Vercel Image Optimization (xem dưới).

### Giai đoạn 8 — P2 Mobile + SEO depth (Day 5–6)
- [ ] **Điểm 18**: bundle analyzer audit + dynamic import map/itinerary.
- [ ] **Điểm 21**: giữ system font; chỉ thử `experimental.inlineCss` trong branch đo đạc nếu CSS waterfall làm LCP/FCP chậm.
- [ ] **Điểm 22**: Lighthouse CI mobile ≥ 90 trong pipeline.
- [ ] **Điểm 16**: sitemap `select` + `lastmod` + `revalidate = 86400`.
- [ ] **Điểm 17 (phần rule)**: `/*?*` + `/booking/` vào disallow.
- [ ] **Điểm 13**: hreflang baseline `x-default` + `en` chỉ ở page/route có canonical đúng.

### Giai đoạn 9 — P3 Monitoring (Day 7+)
- [ ] **Điểm 24**: Vercel Analytics Web Vitals + Sentry Performance (sample 10%).
- [ ] **Điểm 25**: WebPageTest matrix automation post-deploy.
- [ ] **Điểm 20**: chỉ làm nếu Fluid Compute chưa bật — cron `/api/health` 5 phút.
- [ ] **Điểm 28**: cập nhật `CLAUDE.md` để phản ánh collection/media pipeline hiện tại trước phase implementation lớn.

### Giai đoạn 10 — Security + booking production readiness (trước khi nhận booking thật)
- [ ] **Điểm 29**: sanitize/normalize user text, production rate limit, hooks cho Bookings/Comments/Reviews.
- [ ] **Điểm 30**: CSP/security headers report-only trước, enforce sau khi verify Clerk/Payload/R2/analytics.
- [ ] **Điểm 32**: thay in-memory booking repository bằng Payload/Postgres, idempotency DB-backed, transaction/slot locking.
- [ ] **Điểm 34**: hoàn thiện media hardening — focal point, size policy, variant rendering, Cache-Control path.

### Giai đoạn 11 — Auth/payment/i18n expansion
- [ ] **Điểm 31**: Clerk webhook sync `customers.clerkUserId` sau khi booking persist ổn định.
- [ ] **Điểm 33**: Stripe/VNPay/MoMo Phase 5 — PaymentIntent/webhook/idempotency/audit.
- [ ] **Điểm 35**: chỉ thử PPR trong branch đo đạc; không đưa vào P0/P1.
- [ ] **Điểm 36**: i18n runtime decision (`next-intl`/Payload localization/route model) trước khi thêm locale.
- [ ] **Điểm 37**: hoàn thiện structured data travel sau metadataBase/canonical.

---

## 12. Ưu tiên "sống còn" bổ sung

Kết hợp với 3 điểm P0 gốc (Điểm 1, 8, 2), 4 điểm bổ sung cấp thiết nhất:

1. **Điểm 17 — Xóa `src/app/robots.ts`** → fix bug block Google ngay (P0 tuyệt đối, không có lý do hoãn).
2. **Điểm 15 — Canonical filter URL** → ngăn duplicate content penalty cho `/tours`.
3. **Điểm 19 — Payload `select` cho list** → giảm 50–80% payload mỗi request.
4. **Điểm 23 — Tách Clerk** → giảm 100–200KB JS cho 90% traffic public.

3 điểm P0 gốc + 4 điểm bổ sung này = 7 điểm giải quyết ~85% vấn đề.

---

## 13. Bổ sung — Foundation SEO + Pipeline decision

> 2 điểm prerequisite mà các Điểm 14, 15, 4 đều phụ thuộc. Phải làm/quyết định trước khi triển khai SEO chi tiết và image pipeline.

### Điểm 26 — `metadataBase` + canonical an toàn (P1)

**Vấn đề:** Điểm 15 (canonical filter URL) và Điểm 14 (JSON-LD URLs) đều cần biết base URL của site. Hiện `src/app/(frontend)/layout.tsx` không khai báo `metadataBase` → URL metadata tương đối dễ bị warning/lỗi build và social crawler resolve sai. Phải set foundation trước khi làm canonical từng page.

**Hành động:**

```ts
// src/app/(frontend)/layout.tsx
import type { Metadata } from 'next';
import { getSiteUrl } from '@/config/env';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'TC Travel Vietnam',
    template: '%s | TC Travel Vietnam',
  },
  openGraph: {
    type: 'website',
    siteName: 'TC Travel Vietnam',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
};
```

**Không set `alternates.canonical: '/'` ở root layout.** Next metadata merge là shallow merge; canonical ở layout có thể làm các route con inherit canonical về homepage nếu page không override. Canonical phải đặt ở từng page/segment có URL rõ ràng:

```ts
export const metadata: Metadata = {
  alternates: { canonical: '/tours' },
};
```

**Tại sao trước Điểm 14/15:**
- Điểm 14 (JSON-LD) cần absolute URL trong `url` field của schema. Without `metadataBase`, dev dễ hardcode `'https://tctravel.vn'` rải rác — duplicate sự thật.
- Điểm 15 (canonical filter) ở page-level sẽ dùng `alternates.canonical`; nếu root đã canonical `'/'`, rất dễ tạo canonical sai cho trang chưa override.
- `getSiteUrl()` đã sẵn trong `src/config/env.ts:124` — tận dụng helper, không hardcode.

**Verify:** view source `/`, `/tours`, `/tours/[slug]` → canonical đúng từng URL, `<meta property="og:url">` absolute URL nếu có khai báo.

---

### Điểm 27 — Media variants pipeline reconciliation (P1, blocking Điểm 4)

**Trạng thái 2026-05-27:** đã chọn tiếp hướng **Phương án B — Pre-rendered R2 variants** cho MVP. `resolveImage()` hiện ưu tiên `media.variants.thumb/card/hero` trước `publicUrl`/original, và public renders vẫn dùng `<Image unoptimized />` để không đi qua Vercel Image Optimizer. Chưa có responsive `<picture>`/`srcset` nhiều size hơn 3 preset, nên Điểm 4 chưa được tick hoàn toàn.

**Vấn đề còn lại:** repo vẫn dùng `<Image unoptimized />` ở public renders. Đây là chủ đích nếu giữ R2 variants, nhưng cần hoàn tất Cache-Control/preconnect audit và đo LCP thật sau khi media production đã có đủ variants. Không bật Vercel Image Optimization cùng lúc khi chưa đổi `docs/MEDIA_STRATEGY.md`, để tránh vừa tạo R2 variants vừa trả phí transform on-demand.

**Phải reconcile docs với implementation TRƯỚC khi làm Điểm 4:** `docs/MEDIA_STRATEGY.md` đã chọn R2 + Sharp variants + Cloudflare CDN làm hướng MVP. Nếu muốn đổi sang Vercel Image Optimization, phải cập nhật doc đó rõ ràng; nếu giữ quyết định hiện tại, tiếp tục hoàn thiện variant rendering thay vì bỏ `unoptimized` một cách máy móc.

**Phương án A — Vercel Image Optimization on original (đổi hướng so với `docs/MEDIA_STRATEGY.md`)**
- Bỏ `unoptimized` ở 7 vị trí (Điểm 4).
- `resolveImage()` trả `media.url` (original R2 URL) → `next/image` transform on-demand qua `/_next/image`.
- Disable Sharp variant pipeline trong `media-processor.ts` (hoặc giữ nhưng không reference).
- **Chi phí:** Vercel Image Transformations tính theo số transform. Với pax toàn cầu + nhiều device size, có thể vượt quota Pro tier nhanh.

**Phương án B — Pre-rendered R2 variants (đúng với `docs/MEDIA_STRATEGY.md`)**
- Giữ `<Image unoptimized />` HOẶC dùng `<img>` thường — không qua Vercel Image Optimizer.
- Sửa `resolveImage()` để pick variant phù hợp từ `media.variants[]` theo viewport hint (server) hoặc client với `srcset`.
- Sharp pipeline (QStash + media-processor) tạo AVIF + WebP cho 5–6 device sizes lưu lên R2.
- **Chi phí:** Sharp processing 1 lần lúc upload + R2 storage (cheap) + egress R2 (cheap với Cache-Control immutable từ Điểm 9). Không tính transform mỗi request.
- **Trade-off:** logic chọn variant phức tạp hơn; client phải handle responsive selection (`<picture>` với multiple `<source>`).

**Phương án C — Hybrid (KHÔNG khuyến nghị, dễ nhầm lẫn)**
- Vercel Image cho ảnh có sẵn, R2 variants cho ảnh upload mới. Quá phức tạp, debug khó.

**Đề xuất:**
1. Mặc định chọn Phương án B vì repo docs đã quyết định R2 + Sharp variants, và code đã có `media-processor.ts` + `variants` field.
2. Chỉ chọn Phương án A nếu muốn đổi strategy để lấy quick win; khi đó phải update `docs/MEDIA_STRATEGY.md`, tắt/hoãn variant pipeline để tránh dead code, và theo dõi Vercel Image Transformations 2 tuần đầu.

**Acceptance criteria trước khi tick Điểm 4:**
- `docs/MEDIA_STRATEGY.md` khớp với hướng triển khai thực tế (giữ B hoặc sửa rõ sang A).
- `resolveImage()` được audit: dùng original (A) hay variants (B), không phải "đôi khi cái này, đôi khi cái kia".
- Vercel Image quota baseline được ghi nhận trước khi bỏ `unoptimized`.

---

### Điểm 28 — Repo docs hygiene trước khi implement (P3)

**Vấn đề:** `CLAUDE.md` đang stale so với repo: phần "Current Build State" vẫn nói Payload chỉ live `Users`/`Media`, nhưng `payload.config.ts` đã wire `Destinations`, `Tours`, `Customers`, `Bookings`, `Posts`, `Comments`, `Reviews`, `Promotions`, `Payments`. Agent/dev mới đọc doc này có thể đánh giá sai blast radius khi sửa performance/SEO.

**Hành động:** trước khi bắt đầu phase implementation lớn, cập nhật `CLAUDE.md` cho khớp hiện trạng collection và media pipeline. Đây không phải performance win trực tiếp, nhưng giảm rủi ro làm sai kiến trúc hoặc bỏ sót test.

---

## 14. Review bổ sung — Security, Booking, Payment, i18n

> Đối chiếu các checklist security/booking/media/payment với repo hiện tại. Nguồn kế hoạch layer chính: `docs/DEVELOPMENT_APPROACH.md`. Các điểm dưới đây bổ sung vào `docs/toiuu.md` để không bị sót khi triển khai hiệu suất/SEO.

### 14.1. Trạng thái hiện tại theo hạng mục

| Hạng mục | Website đã có? | Kế hoạch/layer hiện tại | Gap cần bổ sung |
|---|---|---|---|
| Zod Server Action validation | **Có một phần** — `src/app/actions/submit-booking.ts` dùng `bookingSubmitSchema.safeParse()` và trả typed union | Layer 5 — Booking Lead Engine | UI `react-hook-form` chưa thấy trong `src`; Payload hooks chưa enforce sanitize/business limit cho booking/comment/review |
| Form sanitization | **Có cho booking** — `submitBooking` sanitizes `specialRequest` as plain text; comments/reviews still need the same policy | Layer 5 cho booking, Layer 7 cho comments/reviews | Add hooks/tests for `Comments.content` and `Reviews.comment` before public UGC |
| Rate limit | **Có production path** — `src/services/rate-limit.ts` uses Upstash Redis REST with local fallback; tests cover Redis allow/reject/fallback | Layer 5 | Verify Vercel Production envs and submit flow uses Redis across instances |
| CORS/CSRF | **Có** — `payload.config.ts` có `cors` và `csrf` allowlist từ env; `next.config.ts` has CSP report-only/security headers | Layer 1/2 | Verify CSP reports with Clerk/Payload/R2/analytics before enforcing |
| Auth | **Có nền + sync route** — ClerkProvider ở public layout + Payload Auth; Clerk webhook route/service syncs `customers.clerkUserId` | Layer 1, Layer 7 | Configure Clerk webhook live in dashboard and verify production customer sync |
| Collections travel agency | **Có** — `payload.config.ts` đã wire Tours, Destinations, Bookings, Customers, Reviews, Posts, Media, Partners, Promotions, Payments | Layer 2 | `CLAUDE.md` stale; docs hygiene đã đưa vào Điểm 28 |
| Access control Bookings/Payments | **Có cơ bản** — `Bookings.read/update` staff-only, delete admin-only; `Payments` staff-only/admin delete | Layer 2 | Booking `create: () => true` phải đi qua Server Action + rate limit/idempotency; cần test public không đọc booking người khác |
| Booking status enum | **Có, nhưng khác đề xuất lowercase** — repo dùng business enum `Pending`, `Confirmed - Pay Later`, `Confirmed - Paid`, `Completed`, `Cancelled` | Layer 2/5 | Không đổi sang `pending | confirmed | paid | cancelled`; giữ state machine hiện tại để không mất nghĩa Pay Later |
| Idempotency | **Có DB-backed booking idempotency** — `Bookings.idempotencyKey` unique and repository recovers duplicate races | Layer 5 | Capacity/slot mutations still need transaction/row lock if inventory is affected |
| Slot locking / availability transaction | **Chưa có** | Layer 5 | Cần transaction khi booking ảnh hưởng `currentPax`, capacity hoặc available date |
| Payments online | **Chưa có runtime** — có `Payments` collection + `paymentReadySchema`, nhưng không có Stripe package, PaymentIntent, webhook route | Layer 9 — Online Payment | Bổ sung Stripe/VNPay/MoMo sau khi Pay Later flow ổn định |
| Media signed URL | **Có** — `/api/media/signed-upload`, auth required, signed PUT expires 600s | Layer 3 | Cần Cache-Control (Điểm 9), verify upload ownership/idempotency đầy đủ |
| Media variants | **Có một phần** — Sharp tạo thumb/card/hero AVIF+WebP và OG JPEG qua QStash; `resolveImage()` uses variants; public renders respect `focalX`/`focalY` | Layer 3 | Need Cache-Control/preconnect audit and real LCP check on production media |
| File validation | **Có server-side** — MIME jpeg/png/webp, size max 20MB, dimension max 8000px trong processor | Layer 3 | Nếu muốn policy 8MB thì đổi schema; client validation/uploader chưa thấy |
| SEO metadata | **Có nền tốt** — dynamic metadata, sitemap, robots, canonical/filter handling, and JSON-LD components for key detail pages | Layer 4 | Hreflang/i18n remains future work |
| i18n | **Chưa có runtime** — không có `next-intl`, Payload locale chưa bật; docs yêu cầu i18n-ready | Layer 10 Polish + Production | Cần quyết định route model và Payload localization trước khi public nhiều ngôn ngữ |
| Partial Prerendering | **Chưa có** — `next.config.ts` không có `experimental.ppr`, route không có `experimental_ppr` | Layer 4/10 thử nghiệm | Next 15 PPR vẫn experimental/canary theo docs; không đưa vào P0, chỉ thử sau cache/streaming |

### Điểm 29 — Form sanitization + production rate limit (P1/P2)

**Trạng thái 2026-05-27:** booking `specialRequest` sanitization and Upstash Redis REST rate limiting have landed. Comments/reviews sanitization is still open.

**Trạng thái:** Action-level Zod đã có. Booking input uses plain-text sanitization without adding `sanitize-html`/`DOMPurify`; keep that approach unless business explicitly needs rich text.

**Quyết định kỹ thuật:** với `specialRequest`, `comments.content`, `reviews.comment`, mặc định coi user input là **plain text**. Không render bằng `dangerouslySetInnerHTML`. Nếu business thật sự cần rich text từ user, mới cho allowlist HTML hẹp.

**Hành động Layer 5 (booking):**
- Thêm `src/lib/sanitize.ts` hoặc collection hooks riêng để normalize user text: trim, strip/control chars, giới hạn newline, optionally strip HTML tags.
- Trong `submitBooking`, sanitize `specialRequest` sau `safeParse` trước khi persist. **Done.**
- Public create luôn enforce `status = "Pending"` và repository ghi Payload/Postgres. **Done.**
- Đổi rate limit từ in-memory Map sang Upstash Redis/KV theo key IP + email. **Done với Upstash Redis REST; còn cần production manual QA.**

**Hành động Layer 7 (comments/reviews):**
- Thêm `beforeValidate` hooks cho `Comments.content` và `Reviews.comment`.
- Nếu render user-generated HTML client-side, dùng DOMPurify/isomorphic DOMPurify trước render. Nếu render text thường, không cần DOMPurify.
- Không cho user upload HTML/JS; media upload giữ MIME allowlist image-only.

**Tests cần có:**
- `specialRequest` chứa `<script>` không được lưu/render thành HTML executable.
- Comments/reviews strip hoặc escape HTML.
- Rate limit hoạt động qua nhiều request và duplicate idempotencyKey không tạo booking trùng.

### Điểm 30 — CSP + security headers (P1 before go-live)

**Trạng thái:** `payload.config.ts` đã có CORS/CSRF allowlist. `next.config.ts` chưa có `headers()` và repo chưa set CSP, HSTS, Referrer-Policy, Permissions-Policy.

**Hành động:** thêm security headers trong `next.config.ts` (repo dùng `.ts`, không phải `next.config.mjs`). Next docs hỗ trợ `async headers()` trong config.

**Triển khai an toàn:**
1. Bắt đầu bằng `Content-Security-Policy-Report-Only` cho public routes để đo breakage.
2. Tách policy public site và Payload admin nếu admin cần inline/script behavior khác.
3. Sau khi verify Clerk, Next/Image, R2/Cloudflare, Vercel Analytics/Sentry hoạt động, chuyển public CSP sang enforce.

**Header baseline đề xuất:**
- `Content-Security-Policy`: `default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; img-src 'self' data: blob: https:; connect-src 'self' https:; script-src 'self' ...`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
- `Strict-Transport-Security` chỉ bật production HTTPS ổn định.

**Lưu ý:** CSP quá strict có thể làm hỏng Clerk, Payload admin, analytics hoặc social embeds. Không copy policy mẫu rồi enforce ngay production.

### Điểm 31 — Clerk ↔ Payload customer sync (Layer 7, P2)

**Trạng thái 2026-05-27:** route webhook/service/tests đã có:
- `src/app/api/webhooks/clerk/route.ts`
- `src/services/clerk-customer-sync.ts`
- `tests/api/clerk-webhook.test.ts`
- `tests/services/clerk-customer-sync.test.ts`

Vẫn còn cần cấu hình Clerk Dashboard endpoint live và Vercel Production env/redeploy. `src/app/(frontend)/layout.tsx` còn bọc toàn bộ public site bằng `ClerkProvider` (đã có Điểm 23 để tách).

**Hành động:**
- Tạo route handler external webhook, ví dụ `src/app/api/webhooks/clerk/route.ts`. **Done.**
- Verify signature theo Clerk webhook secret. **Done in route/tests.**
- On `user.created` / `user.updated`: upsert `customers` theo `clerkUserId` và email. **Done.**
- Manual QA: create/update Clerk user in production and verify Payload `customers.clerkUserId`.
- Không sync PII dư thừa vào analytics; chỉ lưu field cần cho booking/account.

**Layer:** Layer 7 Trust + Engagement, sau khi Layer 5 booking persist vào Payload ổn định.

### Điểm 32 — Booking persistence + transaction/slot locking (Layer 5, P0 cho booking thật)

**Trạng thái 2026-05-27:** booking submit now persists through Payload/Postgres with DB-backed idempotency, public `Pending` enforcement, sanitized `specialRequest`, Redis rate limiting, and Resend emails. Remaining concern is transaction/slot locking only if bookings mutate capacity, `currentPax`, or available dates.

**Hành động bắt buộc trước khi nhận booking thật:**
- Thay `createBookingOnce()` in-memory bằng repository ghi Payload/Postgres. **Done.**
- Public submit luôn tạo `status: "Pending"` bất kể input gửi gì. **Done.**
- Dùng unique `idempotencyKey` ở DB để duplicate submit trả booking cũ. **Done.**
- Khi booking ảnh hưởng capacity (`currentPax`, `availableDates`, slot tour), dùng transaction + row lock. Verify Payload transaction API trước; nếu không đủ, isolate raw Postgres transaction trong repository.
- Append `statusHistory[]` cho mọi status change; admin reverse phải có reason.

**Không đổi enum status theo đề xuất lowercase.** Repo đang có state machine Pay Later rõ nghĩa hơn:
`Pending → Confirmed - Pay Later → Confirmed - Paid → Completed | Cancelled`.

**Tests Layer 5:**
- Valid submit tạo Payload booking `Pending`.
- Duplicate idempotencyKey trả existing booking.
- Hai submit concurrent cùng slot không overbook.
- Status transition sai bị reject; statusHistory append-only.

### Điểm 33 — Payment provider implementation (Layer 9, P2/P3)

**Trạng thái:** `Payments` collection và `paymentReadySchema` đã chuẩn bị Phase 5. Chưa có Stripe dependency, PaymentIntent, checkout UI, webhook, signature verification, hay booking status update từ webhook.

**Hành động Layer 9:**
- Chọn provider đầu tiên: Stripe cho khách quốc tế; VNPay/MoMo sau.
- Thêm env schema cho provider keys/webhook secrets trong `src/config/env.ts`.
- Tạo PaymentIntent/Checkout Session sau khi booking hợp lệ, không trước validation/availability.
- Route handler webhook riêng, verify signature, idempotent theo provider event id.
- Payment success tạo/cập nhật `payments`, rồi transition booking hợp lệ sang `Confirmed - Paid`.
- Payment fail/cancel không xóa booking; Pay Later vẫn hoạt động song song.

**Tests:** invalid signature, duplicate event, missing booking, amount mismatch, retry event, transition audit.

### Điểm 34 — Media hardening: focal point, upload policy, variant usage (Layer 3, P1)

**Trạng thái đã có:**
- Signed upload auth required.
- Signed URL expires 600s (nằm trong khoảng 5-10 phút).
- MIME allowlist `image/jpeg`, `image/png`, `image/webp`.
- Sharp variants: thumb/card/hero AVIF+WebP, OG JPEG.
- QStash callback verifies signature và job idempotent theo media status.
- `resolveImage()` prefers `thumb`/`card`/`hero` variants.
- Public cropped images use Payload `focalX`/`focalY` as CSS `object-position`.

**Gap:**
- Upload size hiện là 20MB, không phải 8MB.
- Client-side upload validation/uploader UI chưa thấy trong repo.
- `r2PutObject`/signed PUT chưa có `CacheControl` (đã có Điểm 9).

**Hành động:**
- Nếu muốn policy 8MB, đổi `maxMediaUploadSize` trong `src/schemas/media.ts` và test.
- Cập nhật `resolveImage()`/component render để dùng `variants` theo quyết định ở Điểm 27. **Done for fixed presets.**
- Dùng focal point/crop metadata trong public rendering. **Done for `focalX`/`focalY`.**
- Thêm blur placeholder/dominant color metadata nếu muốn polish LCP.

### Điểm 35 — PPR không phải quick win hiện tại (Layer 4/10, experimental)

**Trạng thái:** chưa bật PPR. Repo đã dùng ISR (`revalidate = 300`) cho tour/destination/blog detail và có kế hoạch cache/streaming trong các điểm trước.

**Khuyến nghị:** không đưa Partial Prerendering vào P0/P1. Next 15 docs vẫn mô tả PPR là experimental/canary và cần opt-in `experimental.ppr = "incremental"` + `experimental_ppr` theo route. Với website này, ưu tiên theo thứ tự:
1. Fix region/pooler/cache/image/robots.
2. Streaming + skeleton cho `/tours` (Điểm 11).
3. Chỉ thử PPR trong branch đo đạc nếu route có static shell lớn + dynamic filter/booking widget rõ ràng.

**Acceptance:** PPR chỉ được merge nếu `pnpm build`, Lighthouse/WebPageTest, và regression test route dynamic đều pass.

### Điểm 36 — i18n runtime decision (Layer 10, P2)

**Trạng thái:** docs đã yêu cầu i18n-ready, nhưng repo chưa có `next-intl`, chưa có locale routes, chưa bật Payload localization, sitemap/hreflang chưa sinh theo locale.

**Hành động trước khi thêm ngôn ngữ thật:**
- Chốt route model: `/en`, `/vi`, `/fr`, `/de`, `/ko`, `/ja` hay English không prefix.
- Chọn thư viện (`next-intl` nếu cần routing/messages) hoặc Next native + Payload localization nếu muốn tối giản.
- Bật localization cho content fields cần dịch: title, slug, rich content, SEO.
- Fallback locale rõ ràng khi bản dịch thiếu.
- Sitemap/hreflang/canonical phải sinh reciprocal links.

**Layer:** Layer 10 Polish + Production. Không block MVP tiếng Anh, nhưng không nên hardcode URL/copy làm khó migration.

### Điểm 37 — SEO travel structured data completion (Layer 4/10, P1)

**Trạng thái:** dynamic metadata đã có cho tour/destination/blog detail; sitemap đã có. Chưa có JSON-LD trong page output.

**Kế hoạch hiện có:** Điểm 14, 15, 17, 26 trong `docs/toiuu.md` cover JSON-LD, canonical/filter, robots, metadataBase; phần lớn nền này đã land, nhưng i18n/hreflang vẫn là backlog sau.

**Bổ sung:** với travel tour, ưu tiên `Product + Offer + additionalType: TouristTrip` cho tour detail nếu muốn Google Product rich result eligibility; dùng `TouristDestination` cho destination; `BlogPosting` cho blog; `BreadcrumbList` và `ItemList` cho navigation/listing. Không dùng `TouristAttraction` cho mọi tour một cách máy móc vì tour là sản phẩm/dịch vụ, không luôn là điểm tham quan.
