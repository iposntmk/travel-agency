# Kế Hoạch Triển Khai Netlify Free

**Ngày:** 2026-06-30  
**Phạm vi:** Triển khai ứng dụng Travel Agency hiện tại lên Netlify Free như một phương án production chi phí thấp trong giai đoạn website còn ít traffic, ít pax và doanh thu chưa đủ để trả Vercel Pro.

## Quyết Định

Netlify Free đáng để test trước khi trả tiền Vercel Pro hoặc mua VPS.

Lý do chính để rời Vercel Hobby là chính sách sử dụng, không phải kỹ thuật: website bán tour có mục tiêu thương mại, không nên chạy production trên Vercel Hobby. Netlify Free có thể là đường launch tiết kiệm nếu app vượt qua các bước kiểm tra bên dưới.

Chưa nên mua VPS ngay, trừ khi Netlify fail sau một lần deploy test thật, hoặc owner chủ động chọn vận hành Docker/Coolify để tối ưu chi phí dài hạn.

## Mức Độ Phù Hợp Của Codebase Hiện Tại

Frontend public hiện đã đi theo hướng cache-first khá tốt:

- Nhiều route public dùng `revalidate = 300`.
- CMS reads dùng `unstable_cache()` và React `cache()` trong `src/lib/cms.ts`, `src/lib/cms-list.ts`, `src/lib/cms-navigation.ts`, `src/lib/cms-sitemap.ts`, và `src/lib/cms-cruises.ts`.
- Sitemap dùng field chọn lọc và `revalidate = 86400`.
- Nền SEO đã có: metadata, canonical URLs, robots, sitemap, JSON-LD, OpenGraph, và `/llms.txt`.
- Chiến lược media tránh đẩy traffic ảnh public qua app functions: ảnh nằm trên Cloudflare R2 và render từ R2/Cloudflare variants.

Rủi ro admin/backend có thể chấp nhận vì Payload admin chỉ owner dùng. Admin cold start chậm vẫn được nếu dữ liệu đúng và thao tác ổn định.

Quy tắc quan trọng: traffic của pax không được phụ thuộc vào Payload function cold start ở mọi request. Đường cache hit phải nhanh.

## Kiến Trúc Mục Tiêu

```text
Pax/browser
  -> Netlify CDN / Next.js public pages
  -> cached HTML / cached RSC data nếu có thể
  -> Cloudflare R2 public media URLs

Admin/owner
  -> Payload admin trên Netlify function
  -> Neon Postgres
  -> Cloudflare R2
  -> QStash background image processing endpoint

Hệ thống ngoài
  -> Clerk webhook
  -> QStash media-process callback
  -> Resend booking emails
  -> Upstash Redis rate limiting
```

## Tiêu Chí Được Phép Launch Trên Netlify Free

Netlify chỉ phù hợp cho MVP production nếu tất cả kiểm tra này pass:

- `pnpm install --frozen-lockfile` chạy được trên Netlify.
- `pnpm build` pass trên Netlify.
- Function bundle size nằm trong giới hạn Netlify/AWS Lambda.
- `/` homepage public trả 200 với cold/warm TTFB chấp nhận được.
- `/tours`, `/tours/[slug]`, `/destinations/[slug]`, `/blog/[slug]`, `/customize-tour`, `/contact`, `/llms.txt`, `/sitemap.xml`, và `/robots.txt` trả đúng output.
- Payload admin `/admin` load được, login được, tạo/sửa content được.
- Payload `afterChange` hooks revalidate tags đúng sau khi sửa content.
- R2 upload flow chạy được từ admin.
- QStash callback `/api/qstash/media-process` verify signature và xử lý variants.
- Booking/custom inquiry Server Actions tạo record đúng một lần, rate-limit đúng, gửi Resend emails.
- Clerk webhook vẫn sync customer data.
- `NEXT_PUBLIC_SITE_URL` trỏ về domain Netlify/custom thật trước khi smoke test production.
- `ALLOW_INDEXING` vẫn là false cho đến khi checklist launch cuối cùng hoàn tất.

## Cấu Hình Netlify Cần Có

Dùng Netlify UI hoặc `netlify.toml` trong tương lai. Không thêm config đoán mò trước lần test đầu tiên.

Build:

- Build command: `pnpm build`
- Package manager: `pnpm`
- Install command: `pnpm install --frozen-lockfile`
- Publish directory: để Netlify/OpenNext tự detect Next.js output.
- Node version: khớp với docs dự án. Docs hiện ghi Node.js 23+, nhưng phải verify Netlify support. Nếu Netlify không hỗ trợ version này sạch, cần chủ động đồng bộ lại docs/runtime.

Functions:

- Dùng region gần Neon production nhất, ưu tiên Singapore/APAC nếu có.
- Public pages phải dựa vào cache. Không biến mọi request thành dynamic.
- Không xử lý ảnh lớn đồng bộ trong admin request, Server Action, hoặc page render.

Domain:

- Gắn custom domain trước khi mở indexing.
- Set toàn bộ env canonical/SEO về domain đó.
- Kiểm tra lại `robots.txt`, `sitemap.xml`, OpenGraph URLs, và `/llms.txt`.

## Biến Môi Trường

Mirror production envs từ Vercel, nhưng đổi URL sang Netlify/custom domain.

Core:

- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://<production-domain>`
- `PAYLOAD_SECRET`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `ALLOW_INDEXING=false` cho đến khi ký duyệt launch

Payload/DB:

- `DATABASE_URL` nên dùng Neon pooled connection cho runtime.
- `DATABASE_URL_UNPOOLED` nên dùng direct Neon connection cho migrations.
- Neon production nên tắt scale-to-zero và bật prewarming nếu ngân sách cho phép.

Media/R2:

- `R2_ACCOUNT_ID`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_URL`

QStash:

- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`

Auth/email/rate limit:

- Clerk publishable/secret keys và webhook signing secret
- Resend API key
- `RESEND_FROM_EMAIL`
- `BOOKING_SALES_EMAIL`
- Upstash Redis REST URL/token

Optional/observability:

- Gỡ hoặc thay Vercel Analytics/Speed Insights trước khi dựa vào số liệu production.
- Chỉ thêm Sentry/GA4/Plausible/PostHog qua consent strategy.

## Các Phần Đặc Thù Vercel Cần Audit

Repo hiện có các phần gắn với Vercel:

- `vercel.json` set framework, region `sin1`, install command, và build command.
- `src/app/(frontend)/layout.tsx` import `@vercel/analytics/next` và `@vercel/speed-insights/next`.
- `src/app/api/health/route.ts` report `VERCEL_REGION`, không có ý nghĩa trên Netlify.
- `docs/DEPLOYMENT_GUIDE.md`, `docs/TECH_STACK.md`, và `docs/CURRENT_STATUS.md` vẫn mô tả Vercel là production hosting.

Khi test Netlify, các điểm này chưa chắc là blocker. Khi migration chính thức, phải cập nhật docs và observability để người vận hành không đọc hướng dẫn Vercel đã lỗi thời.

## Danh Sách Rủi Ro

### 1. Function bundle size

Mức rủi ro: cao.

Payload, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`, migrations, collections, Lexical, và `sharp` có thể làm server function bundle quá lớn.

Cách kiểm tra:

- Deploy branch test lên Netlify.
- Xem build logs và generated function sizes.
- Kiểm tra admin/API functions có vượt giới hạn không.

Tiêu chí fail:

- Netlify không deploy được vì function package vượt size limit.
- Việc trim bundle trở nên mong manh hoặc phải chống lại OpenNext internals.

Fallback:

- Giữ frontend trên Netlify.
- Chuyển Payload sang Render/Railway/Fly/VPS Docker.
- Nếu cần, cho frontend gọi Payload/API origin tách riêng.

### 2. Sharp native binary

Mức rủi ro: cao cho media processing, thấp cho page view bình thường.

Repo import `sharp` trong `payload.config.ts` và `src/services/media-processor.ts`. Netlify phải cài đúng Linux binary.

Cách kiểm tra:

- Upload ảnh từ Payload admin.
- Complete media upload.
- QStash gọi `/api/qstash/media-process`.
- Variants được tạo trong R2.
- Payload media status chuyển thành `ready`.

Fallback:

- Giữ R2 storage.
- Chuyển Sharp processor sang Cloud Run, Fly, VPS worker, hoặc service persistent khác.
- Không chạy Sharp đồng bộ trong request public page.

### 3. Cold start và DB connection latency

Mức rủi ro: trung bình-cao.

Payload cold start cộng với Neon connection có thể làm request chưa cache bị chậm. Admin chậm được; public cache miss phải đo kỹ.

Cách kiểm tra:

- Đo cold/warm TTFB trên `/`, `/tours`, `/tours/[slug]`, `/blog/[slug]`.
- So sánh cache hit với request đầu tiên sau deploy/revalidate.
- Kiểm tra DB latency qua `/api/health`, nhưng sau này cần sửa region reporting cho Netlify.

Fallback:

- Tăng cache coverage.
- Giữ Neon ở region gần nhất.
- Dùng pooled runtime URL.
- Tách Payload khỏi frontend nếu public cache miss vẫn quá chậm.

### 4. Revalidation behavior

Mức rủi ro: trung bình.

App dùng Payload `afterChange` hooks với `revalidateTag()`. Netlify/OpenNext hiện hỗ trợ tag/path revalidation, nhưng phải test bằng sửa content thật trong Payload.

Cách kiểm tra:

- Sửa title của một tour trong Payload.
- Xác nhận `/tours/[slug]`, `/tours`, sitemap/list surfaces cập nhật sau revalidation.
- Xác nhận stale data không bị kẹt vô thời hạn.

Fallback:

- Tạm dùng time-based `revalidate` ngắn hơn.
- Thêm explicit webhook revalidate endpoint nếu cần.
- Tách CMS và trigger frontend rebuild/revalidate riêng.

### 5. Pricing và quota Free

Mức rủi ro: trung bình.

Netlify Free dùng credit-based limits cho plan mới. Traffic, functions, bandwidth, và builds đều tiêu credit. Website du lịch nhiều ảnh phải giữ media trên R2/Cloudflare và tránh public requests gọi function quá nhiều.

Cách kiểm tra:

- Theo dõi Netlify usage sau test deploy.
- Theo dõi function invocations sau khi crawler vào site.
- Giữ ảnh public ngoài Netlify bandwidth nếu có thể.

Fallback:

- Tạm nâng Netlify paid.
- Quay về Vercel Pro.
- Dùng VPS/Coolify nếu cần chi phí tháng ổn định hơn.

### 6. SEO/GEO/AI crawler readiness

Mức rủi ro: trung bình.

Repo đã có nền tốt, nhưng indexing đang cố ý tắt cho đến khi content và domain production sẵn sàng.

Cách kiểm tra trước launch:

- Chỉ set `ALLOW_INDEXING=true` sau final sign-off.
- Xác nhận public pages không còn `X-Robots-Tag: noindex`.
- Xác nhận `<meta name="robots">` là index/follow.
- Xác nhận `/robots.txt` allow public content và block admin/API/booking/internal/query URLs.
- Xác nhận `/sitemap.xml` dùng production domain.
- Xác nhận `/llms.txt` dùng production domain và liệt kê tours/destinations/posts hiện tại.
- Xác nhận JSON-LD hợp lệ trên home, tour detail, destination detail, blog detail, và tours list.

Fallback:

- Giữ `ALLOW_INDEXING=false` đến khi sửa xong.
- Không submit sitemap cho đến khi canonical domain đã final.

## Quy Tắc Cho Dev / AI Agent Khi Làm Netlify

Luôn theo root `AGENTS.md` trước:

- Dùng output ngắn gọn.
- Chạy `memory_recall` project `Travel-Agency` trước khi chạm code.
- Dùng `codegraph_explore` trước khi sửa symbol.
- Chỉ dùng `pnpm`.
- Không đọc `process.env` ngoài `src/config/env.ts`.
- Không sửa `src/app/(payload)/` trừ khi task nhắm cụ thể vào Payload admin.
- Không tạo Route Handler cho internal form mutations.
- Không chạy local production deploy commands trừ khi owner yêu cầu.
- Không commit `.env*`, `.vercel/`, `.netlify/`, hoặc file chứa secret.

Quy tắc riêng cho Netlify:

- Không giả định hành vi Vercel giống Netlify. Phải verify build output và runtime behavior.
- Không bỏ caching để "cho chạy được"; tốc độ frontend public phụ thuộc vào cache.
- Không chuyển image processing vào public request path.
- Không thay R2/Cloudflare media delivery bằng Netlify bandwidth-heavy delivery nếu chưa review cost rõ ràng.
- Không bật indexing trên Netlify subdomain tạm.
- Không set `NEXT_PUBLIC_SITE_URL` về preview domain cho production.
- Không thêm `netlify.toml` đoán mò khi chưa test defaults hiện tại của Netlify/OpenNext.
- Không xem `included_files` là cách giảm bundle size. Nó thường dùng để include file; không phải công cụ exclude dependency lớn.
- Nếu function size fail, phân tích bundle output trước. Sau đó mới quyết định trim deps, tách Payload, hoặc chuyển processor/backend.
- Tách bạch admin owner-only với frontend pax-facing. `/admin` chậm có thể chấp nhận; public tour pages chậm thì không.

## Quy Trình Test Netlify Lần Đầu

1. Tạo Netlify site từ test branch, không dùng `master`.
2. Thêm toàn bộ env vars cần thiết với `ALLOW_INDEXING=false`.
3. Set build command là `pnpm build`.
4. Deploy lần đầu không thêm custom Netlify config trừ khi bắt buộc.
5. Xem build logs: OpenNext adapter, function size, native dependency warnings, và route/function mapping.
6. Smoke test public pages:
   - `/`
   - `/tours`
   - `/tours/<known-slug>`
   - `/destinations/<known-slug>`
   - `/blog/<known-slug>`
   - `/customize-tour`
   - `/contact`
   - `/sitemap.xml`
   - `/robots.txt`
   - `/llms.txt`
7. Smoke test admin/backend:
   - `/admin` login
   - sửa một test content field
   - verify revalidation
   - upload một ảnh
   - verify QStash media processing
8. Smoke test lead flow:
   - submit một booking inquiry
   - verify chỉ tạo một booking row
   - verify customer/sales emails
   - verify rate limit không false-positive
9. Ghi lại cold/warm TTFB cho public pages và admin.
10. Quyết định:
    - Pass: gắn domain thật và smoke test lại.
    - Fail vì Payload/Sharp: tách backend/processor.
    - Fail vì public performance: tăng cache/static generation hoặc dùng Vercel Pro/VPS.

## Checklist Go-Live

- Real domain đã connect.
- `NEXT_PUBLIC_SITE_URL` dùng real domain.
- Payload `serverURL`, CORS, và CSRF allow real domain.
- Clerk webhook endpoint đổi sang real Netlify/custom domain.
- QStash callback URL resolve về real domain.
- Resend sender/domain đã cấu hình.
- Neon runtime URL dùng pooler.
- R2 public URL/custom media domain chạy tốt toàn cầu.
- Netlify usage limits/alerts đã review.
- Chỉ set `ALLOW_INDEXING=true` sau khi booking/email/content/canonical checks pass.
- Submit sitemap lên Google Search Console và Bing Webmaster Tools sau khi indexing được bật.

## Khi Nào Nên Dừng Thử Netlify Free

Dừng và chuyển kiến trúc nếu có một trong các tình huống này:

- Function bundle size không thể fix sạch.
- Payload admin/API không ổn định, không chỉ là chậm.
- Sharp processing fail lặp lại trên Netlify functions.
- Public cache misses quá chậm cho SEO/pax experience.
- Revalidation không đáng tin sau khi sửa Payload content.
- Netlify Free credits bị tiêu nhanh bởi traffic/crawler bình thường.
- Debug issue đặc thù Netlify tốn thời gian hơn trả Vercel Pro vài tháng.

Thứ tự fallback ưu tiên:

1. Frontend trên Netlify hoặc Vercel, Payload/worker trên Render/Railway/Fly/VPS.
2. Full app trên Vercel Pro để launch ổn định nhanh nhất.
3. Full app trên VPS/Coolify nếu chi phí dự đoán được và quyền kiểm soát quan trọng hơn devops đơn giản.

## Tóm Tắt

Netlify Free là thử nghiệm MVP hợp lý vì frontend pax-facing đã thiên về cache và media đã offload sang R2/Cloudflare.

Rủi ro lớn nhất không phải SEO frontend hay Next.js 15. Rủi ro lớn là Payload function bundle size, Sharp native processing, cold start, DB region/pooling, và setup env/domain production chính xác.

Chỉ dùng Netlify Free nếu frontend vẫn nhanh và backend đúng. Admin chậm được. Public tour pages chậm thì không được.
