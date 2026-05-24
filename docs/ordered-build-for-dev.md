
  # Hướng Dẫn Build Từng Bước Cho Dev

  ## Tóm Tắt

  Build theo 10 layer, đi tuần tự để tránh debug chồng chéo. Mỗi layer chỉ chuyển sang layer tiếp theo khi đạt exit criteria. Stack
  mặc định: Next.js 15 App Router, TypeScript strict, Payload CMS, pnpm, Neon, Vercel, Cloudflare R2, QStash, Clerk, Resend,
  Tailwind, shadcn/ui.

  Nguyên tắc cố định:

  - Inquiry mới luôn tạo booking Pending.
  - Không payment online ở MVP.
  - Mọi collection Payload phải có access control.
  - Env vars chỉ đọc qua Zod env loader tập trung.
  - Booking submit, webhook, signed upload, background job phải idempotent.
  - CI phải chạy pnpm typecheck, pnpm lint, pnpm test, pnpm build.
  - Mobile-first là luật sản phẩm: mọi UI public, booking và admin phải thiết kế từ mobile trước, desktop chỉ là enhancement.
  - Không coi một UI layer là xong nếu chưa kiểm tra mobile: text đọc được, CTA bấm được, form dùng được, không overflow ngang, không overlap.

  ## Các Bước Build

  ### Bước 1: Foundation

  Trạng thái hiện tại:

  - Đang thực hiện.
  - Đã xong: Next.js 15.4.x App Router, TypeScript strict, pnpm, Tailwind base, shadcn/ui base config, Vitest, source layout, Zod env loader, smoke/domain tests, local/mobile dev server, CI gate.
  - Đã xong: Payload CMS colocated trong Next app ở `/admin` và `/api`, Postgres adapter cho Neon qua `DATABASE_URL`, Payload type generation, Clerk provider base.
  - Đã xong: Neon `.env` local, baseline Payload migration, migration chạy thành công trên Neon, Payload admin hiện màn hình create-first-user.
  - Chưa xong để đóng layer: tạo user/admin thật trong `/admin`, Vercel Preview validated.

  Tạo app:

  npx create-payload-app@latest travel-agency
  cd travel-agency
  pnpm install
  cp .env.example .env

  Thiết lập ngay:

  - Next.js 15 App Router + TypeScript strict.
  - Payload CMS colocated trong Next app.
  - Tailwind + shadcn/ui.
  - Neon database.
  - Clerk auth base.
  - Vitest.
  - Vercel Preview.
  - .env.example đầy đủ biến: DATABASE_URL, PAYLOAD_SECRET, Clerk, R2, QStash, Resend, NEXT_PUBLIC_SITE_URL.

  Tạo source layout chuẩn:

  src/app
  src/app/actions
  src/collections
  src/components
  src/config
  src/lib
  src/schemas
  src/services
  src/jobs
  tests/schemas
  tests/services
  tests/actions
  tests/collections
  tests/fixtures

  Exit criteria:

  - pnpm dev chạy local.
  - pnpm build pass.
  - pnpm test có smoke test đầu tiên.
  - Env loader Zod fail fast khi thiếu biến.
  - Mobile-first rules đã được ghi vào coding rules và áp dụng cho các layer UI tiếp theo.
  - Vercel Preview deploy được.

  ### Bước 2: Core Data Models + Access Control

  Tạo Payload collections:

  - users
  - media
  - destinations
  - tours
  - customers
  - bookings
  - posts
  - comments
  - reviews
  - partners
  - promotions
  - payments

  Booking contract:

  Pending
  Confirmed - Pay Later
  Confirmed - Paid
  Completed
  Cancelled

  Allowed transitions:

  New -> Pending
  Pending -> Confirmed - Pay Later
  Pending -> Cancelled
  Confirmed - Pay Later -> Confirmed - Paid
  Confirmed - Pay Later -> Cancelled
  Confirmed - Paid -> Completed

  Implement:

  - Payload access control cho từng collection.
  - Zod schemas cho booking, customer, partner, env.
  - Booking transition service trong src/services, không đặt logic trong UI.
  - Payload migrations baseline.
  - Seed script với Hội An, Huế, Đà Nẵng, 4 tour mẫu, 3 booking mẫu, 2 post, 2 partners.

  Exit criteria:

  - Migration chạy được.
  - Seed chạy được.
  - Test Zod schemas pass.
  - Test booking transitions pass.
  - Test access control public/auth/admin pass.

  ### Bước 3: Media Pipeline + Admin UX

  Implement media theo MEDIA_STRATEGY.md:

  - Browser/admin upload original trực tiếp lên Cloudflare R2 qua signed URL.
  - App chỉ cấp signed URL, tạo media doc, enqueue QStash job.
  - Sharp variants chạy background, không chạy trong request.
  - Media status: uploading, processing, ready, failed.
  - Next Image render từ R2/Cloudflare URL.

  Admin cần quản lý được:

  - Tours
  - Destinations
  - Posts
  - Partners
  - Media

  Exit criteria:

  - Upload ảnh không đi qua Vercel request body.
  - Ảnh ready render được.
  - Ảnh failed có fallback, không vỡ layout.
  - Media job idempotent theo media/job key.

  ### Bước 4: Public Pages

  Build public UI bằng Server Components mặc định:

  - Homepage.
  - Tour listing + filters.
  - Tour detail.
  - Destinations listing/detail.
  - Blog listing/detail.
  - Basic SEO metadata.
  - OG image dùng media variant og.
  - Static-first + ISR cho tour, destination, blog.

  Client Components chỉ dùng cho:

  - form
  - filters cần tương tác
  - share buttons
  - carousels/widgets cần browser APIs

  Exit criteria:

  - Trang public render từ Payload data.
  - Filter không crash khi query rỗng/sai.
  - Detail pages có SEO title/description/OG.
  - Mobile layout ổn định.
  - Third-party scripts không block LCP.

  ### Bước 5: Booking Lead Engine

  Build core conversion:

  - Inquiry form dùng chung cho paid tour và free tour.
  - React Hook Form + Zod.
  - Server Action submit booking.
  - Rate limit server-side.
  - idempotencyKey để chống double click/retry.
  - Booking tạo với status Pending.
  - Email confirmation cho khách.
  - Email notification cho sales/admin.
  - Confirmation page có contact channels, share CTA, related content.
  - Admin booking workflow: filter status/source/date, internal notes, status update, export cơ bản.

  Typed Server Action result:

  { ok: true; data: T } |
  { ok: false; error: { type: "validation" | "business" | "rate-limit" | "system"; message: string; fieldErrors?: Record<string,
  string[]> } }

  Exit criteria:

  - Valid submit tạo booking Pending.
  - Invalid input trả { ok: false }.
  - Duplicate submit không tạo booking trùng.
  - Rate limit hoạt động.
  - Status changes append audit history.
  - Email fail không tạo duplicate booking khi retry.

  ### Bước 6: Free Tours

  Build lead magnet:

  - Trang /free-tours.
  - Free tour cards/listing.
  - Registration dùng chung Inquiry Form.
  - Booking source/tag riêng cho free tour.
  - Homepage section “Join Our Free Tours”.
  - Confirmation upsell paid tours liên quan.

  Exit criteria:

  - Free tour registration tạo booking đúng source.
  - Không yêu cầu payment.
  - Sales/admin phân biệt được free-tour lead và paid-tour inquiry.
  - Upsell không crash khi không có tour liên quan.

  ### Bước 7: Trust + Engagement

  Build sau khi booking ổn định:

  - Cookie consent/GDPR gate.
  - Social share buttons với UTM.
  - External review embeds.
  - Clerk social login.
  - Comments cho tour/blog, yêu cầu login.
  - Comment moderation.
  - Lazy-load social/review scripts sau consent nếu cần.

  Exit criteria:

  - GA4/GTM/Facebook/TikTok/social embeds không load trước consent.
  - Share URL có UTM.
  - OG metadata share đúng.
  - Comment cần login và moderation.
  - Embed fail không vỡ layout.

  ### Bước 8: Monetization Without Payment

  Build doanh thu phụ:

  - Add-on services: spa, massage, dental, nail/beauty, wellness.
  - OTA affiliate widgets/links: Civitatis, GetYourGuide, Viator, GuruWalk, Klook, KKday.
  - OTAWidget props: provider, city, experienceIds, variant.
  - Affiliate/add-on click tracking.
  - Disclosure rõ external partner/affiliate.

  Exit criteria:

  - Affiliate click tracking ghi nhận được.
  - Widget fail không làm fail page.
  - Agency tour CTA vẫn là CTA chính.
  - Disclosure hiển thị khi có link partner.

  ### Bước 9: Online Payment Sau MVP

  Chỉ làm khi Pay Later flow đã ổn định:

  - Payments collection.
  - Stripe nếu có pháp nhân phù hợp.
  - VNPay/MoMo nếu cần nội địa.
  - Webhook Route Handlers.
  - Idempotency theo provider event id.
  - Payment success chuyển booking hợp lệ sang Confirmed - Paid.
  - Payment fail/cancel không xóa booking.
  - Pay Later vẫn hoạt động song song.

  Exit criteria:

  - Webhook retry không tạo duplicate payment.
  - Invalid signature bị reject.
  - Amount mismatch không update booking.
  - Payment events append audit trail.

  ### Bước 10: Polish + Production

  Hoàn thiện go-live:

  - i18n thật sự: English default, Vietnamese trước, French/German/Korean/Japanese sau.
  - Sitemap, schema.org, canonical, redirects.
  - Analytics funnel: visit, tour detail view, inquiry submit, free tour registration, affiliate click.
  - Sentry.
  - Core Web Vitals.
  - Spending limits: Vercel, Neon, R2, QStash.
  - Production Neon tắt Scale-to-Zero và bật prewarming.

  Exit criteria:

  - Vercel Preview validated.
  - pnpm typecheck, pnpm lint, pnpm test, pnpm build pass.
  - Production env validation pass.
  - Sitemap/schema hoạt động.
  - Tracking không gửi PII.

  ## Test Plan

  - tests/schemas: env, booking, customer, partner, payment-ready schemas.
  - tests/services: booking transitions, pricing tiers, currentPax/minPax, commission.
  - tests/actions: booking submit valid/invalid/rate-limited/duplicate.
  - tests/collections: Payload access control, protected fields, media visibility.

  Manual QA trước production:

  - Submit paid tour inquiry trên mobile.
  - Submit free tour registration trên mobile.
  - Double-click submit không tạo duplicate booking.
  - Admin update status và thấy audit trail.
  - Media upload + failed fallback hoạt động.
  - Social/OTA/review embeds bị chặn trước consent.
  - Vercel Preview pass toàn bộ checks.

  ## Assumptions

  - App root là travel-agency/.
  - Dùng pnpm duy nhất, không tạo npm/yarn lockfile.
  - Vitest là runner mặc định.
  - Payment online không thuộc MVP.
  - R2 + QStash + Sharp là media path mặc định; Cloudinary chỉ là fallback nếu pipeline này bị bỏ.
  - English là default locale; i18n model phải ready từ đầu nhưng full translation làm sau MVP.
