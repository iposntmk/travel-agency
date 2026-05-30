# Development Roadmap & Delivery Strategy

**Tên dự án:** VM Travel Platform
**Phiên bản:** MVP v1.1
**Cập nhật:** 2026-05-30
**Vai trò tài liệu:** Roadmap phát triển chính. Các phân tích trong `Phan_tich.md` và `proposal.md` đã được chắt lọc vào file này; hai file đó chỉ còn là tài liệu tham khảo.

---

## 1. Chiến lược tổng quan

Xây dựng website agency inbound tourism bằng **Payload Official Website Starter** rồi customize theo phong cách VM Travel: hình ảnh Việt Nam mạnh, professional, trustworthy, vibrant, mobile-first.

MVP đứng trên ba trụ cột:

1. **Book Now - Pay Later**: khách gửi inquiry, sales/ops liên hệ, thanh toán khi gặp guide hoặc tại văn phòng. Không có online payment ở MVP.
2. **Free Tours as lead magnet**: Walking/Cycling tours giúp lấy lead sớm và upsell paid tours.
3. **Hybrid operation**: tour có thể self-operated, partner, hoặc hybrid theo `currentPax`, `minPax`, năng lực vận hành và seasonality.

Ràng buộc quan trọng: booking module phải đủ modular để Phase Payment thêm Stripe/VNPay/MoMo mà không viết lại data model. Payment fields nullable từ ngày đầu, submit/webhook/job phải idempotent, mọi status change phải có audit trail.

---

## 2. Thứ tự build theo layer

Build theo layer thay vì chỉ theo phase để mỗi phần có dependency, exit criteria và test riêng. Layer sau chỉ bắt đầu khi layer trước đạt exit criteria tối thiểu.

```text
Layer 1  Foundation
Layer 2  Core Data Models + Access Control
Layer 3  Media Pipeline + Admin Content UX
Layer 4  Public Pages
Layer 5  Booking Lead Engine
Layer 6  Free Tours
Layer 7  Trust + Engagement
Layer 8  Monetization Without Payment
Layer 10 Polish + Production
Layer 9  Online Payment (deferred last)
```

Nếu chỉ có 1-2 dev, đi tuần tự theo đúng thứ tự trên. Không đẩy social, OTA, payment hoặc analytics nâng cao lên trước khi booking engine ổn định. **Quyết định 2026-05-30:** online payment giữ schema-ready nhưng không còn là ưu tiên sau Layer 8; triển khai runtime payment sau cùng, sau khi frontend, security, performance, SEO và vận hành production ổn định.

### Trạng thái hiện tại

**Cập nhật 2026-05-30:** dự án đang ở **Layer 8 - Monetization Without Payment**, với nhánh mở rộng travel platform đã implement local và đã pass full local gate. Chưa coi là production-shipped cho tới khi commit/push `origin master` và Vercel deploy xong.

- Layer 1-6 đã landed đầy đủ cho luồng MVP. Layer 7 (Trust + Engagement) hoàn tất phần lõi: Clerk customer sync verified end-to-end (`pnpm qa:clerk-sync`), cookie consent banner + UTM share buttons live.
- Layer 8 đã ship scaffold + UI/UX trên 3 surfaces:
  - Homepage: section "Featured Experiences" (3 cards × GetYourGuide).
  - Destination detail: section "Top things to do in {city}" (GetYourGuide + Viator).
  - Tour detail: section "Similar experiences in {destination}" (GetYourGuide + Viator).
- Click attribution infra ổn định: collection `affiliate-clicks`, route `POST /api/events/click` (Zod + rate-limit + SHA-256 IP hash), component `<TrackedLink>` (sendBeacon + fetch keepalive fallback, `rel="noopener noreferrer sponsored"`).
- `src/lib/ota-providers.ts` định nghĩa 5 provider (GetYourGuide / Viator / Klook / Civitatis / GuruWalk). URL hiện tại trỏ trang search chung — **chưa có partner ID, doanh thu = 0**. Hướng dẫn nhét partner ID khi có account: `docs/OTA_INTEGRATIONS.md` § "Adding affiliate IDs".
- Travel platform expansion local 2026-05-29:
  - Schema: thêm `car-rentals`, `attractions`, `product-categories`, `custom-inquiries`, `team-members`, `site-settings`; mở rộng `destinations`, `tours`, `posts`.
  - Backend: thêm Server Action `submitCustomInquiry`, schema Zod, repository idempotent, email service, read helpers cho destination hub/car rentals/guides/home content.
  - Frontend: thêm `/free-proposal`, `/car-rentals`, `/car-rentals/[slug]`, destination hub sections, proposal form 4 bước, tour accordion/sticky mobile CTA, expanded tour filters.
  - Migration/types: generated `20260529_124032_travel_platform_expansion`.
  - Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build` pass on 2026-05-30. Build previously timed out twice on 2026-05-29 but is no longer the blocker.

**Việc đang chờ trước khi đi tiếp:**

1. Review migration `20260529_124032_travel_platform_expansion`.
2. Commit, push `origin master`, then verify Vercel auto-deploy.
3. Hoàn thiện frontend public conversion surfaces bằng mobile QA trước: homepage, tours/list/detail, destination hub, `/free-proposal`, `/car-rentals`, booking confirmation.
4. Làm security hardening trước khi mở indexing: production QA form, access-control spot checks, UGC sanitization nếu bật comment/review, CSP report review, không commit log/secret/data.
5. Làm performance + SEO backlog trong `docs/toiuu.md`: region/pooler, media cache/R2, image strategy, metadataBase/canonical, JSON-LD, sitemap, Lighthouse mobile.
6. Chủ sở hữu đăng ký tài khoản OTA (theo thứ tự priority trong `OTA_INTEGRATIONS.md` §3) → bàn giao partner ID; dev wire vào Payload khi có ID, nhưng không để việc này chặn security/performance/SEO/frontend.
7. Booking capacity locking chỉ làm nếu booking thật sự mutate availability/currentPax.
8. Layer 9 Online Payment để sau cùng.

Dev tiếp theo nên đọc `docs/CURRENT_STATUS.md` sau `CLAUDE.md` để biết điểm dừng chính xác, rồi mới chọn task tiếp theo trong roadmap này.

---

## 3. Layer 1 - Foundation

**Mục tiêu:** project scaffold, chạy được local, build được, deploy preview được.

### Scope

- Scaffold app trong `travel-agency/` bằng Payload Official Website Starter.
- Next.js 15 App Router, TypeScript strict, pnpm.
- Kết nối Neon Postgres.
- Setup Tailwind CSS + shadcn/ui.
- Cấu hình Clerk base.
- Cấu hình Vercel Preview.
- Thêm scripts tối thiểu: `dev`, `build`, `lint`, `typecheck`, `test`.
- Chọn test runner mặc định: **Vitest**.
- Tạo CI tối thiểu: typecheck, lint, test, build.
- Quyết định route/content model i18n-ready: English default, Vietnamese enabled later, French/German/Korean/Japanese future-ready.

### Exit criteria

- `pnpm build` chạy được.
- `pnpm lint` chạy được nếu đã cấu hình lint.
- `pnpm test` có ít nhất một smoke test.
- Vercel Preview deploy được.
- `.env.example` đầy đủ biến bắt buộc và app fail fast qua Zod env loader.

---

## 4. Layer 2 - Core Data Models + Access Control

**Mục tiêu:** khóa data contract sớm để tránh rework UI, booking và payment.

### Scope

- Tạo Payload collections tối thiểu:
  - `users`
  - `media`
  - `destinations`
  - `tours`
  - `customers`
  - `bookings`
  - `posts`
  - `comments`
  - `reviews`
  - `partners`
  - `promotions`
  - `payments`
- Mỗi collection có access control rõ ràng ngay từ đầu.
- Tạo Zod schemas cho booking, customer, partner, payment-ready fields và env vars.
- Dùng Payload built-in migrations làm migration strategy chính.
- Tạo seed data nhỏ cho dev/test: destination, tour, customer, booking mẫu.
- Booking schema có payment fields nullable/optional từ đầu.

### Booking status enum

```text
Pending
Confirmed - Pay Later
Confirmed - Paid
Completed
Cancelled
```

Inquiry mới **luôn** bắt đầu là `Pending`. Sales/ops chỉ chuyển sang `Confirmed - Pay Later` sau khi đã liên hệ và khách xác nhận.

### Exit criteria

- Migration chạy được trên local.
- Seed data tạo được tour, destination và booking mẫu.
- Unit test cho Zod schemas pass.
- Unit test cho booking status transitions pass.
- Access control tests cho public/authenticated/admin cases pass.

---

## 5. Layer 3 - Media Pipeline + Admin Content UX

**Mục tiêu:** content team có thể nhập nội dung và quản lý ảnh thật trước khi public UI hoàn thiện.

### Scope

- Cấu hình Cloudflare R2.
- Implement signed upload URL.
- Upload original trực tiếp lên R2, không đi qua Vercel request body.
- Payload `media` collection chỉ lưu metadata, URL variants và processing status.
- Enqueue QStash/background job để Sharp tạo variants.
- Media status:
  - `uploading`
  - `processing`
  - `ready`
  - `failed`
- Admin CRUD cho tours, destinations, posts/blog, partners, media.
- Public fallback khi media đang processing hoặc failed.

### Exit criteria

- Upload ảnh gốc không đi qua Vercel request body.
- Ảnh `ready` render được bằng Next Image.
- Ảnh `failed` không làm vỡ layout.
- Admin tạo/sửa/xóa được tour, destination và post.
- Media processing job idempotent theo deterministic key.

---

## 6. Layer 4 - Public Pages

**Mục tiêu:** website đọc dữ liệu thật từ Payload, static-first + ISR, mobile-first.

### Scope

- Homepage: hero, featured tours, popular destinations, seasonal banner, trust badges, free tour section.
- Tour listing với filters: destination, tour type, season, operation type, price.
- Tour detail: gallery, itinerary, pricing, add-ons, reviews, badges, booking CTA.
- Destination listing/detail với "Best Time to Visit".
- Blog listing/detail với related posts và booking/free-tour CTA.
- SEO metadata, OG image, sitemap, schema.org basic.
- Static-first + ISR cho tour, destination và blog.

### Exit criteria

- Public pages render từ Payload data.
- Filter không crash với query rỗng/sai.
- Detail pages có SEO title, description và OG image.
- Layout mobile-first ổn định.
- LCP không bị block bởi third-party scripts.

---

## 7. Layer 5 - Booking Lead Engine

**Mục tiêu:** tạo lead thật và hỗ trợ sales vận hành.

### Scope

- Inquiry form dùng chung cho paid tour và free tour.
- React Hook Form + Zod validation.
- Server Action submit booking.
- Rate limit server-side cho inquiry form.
- Idempotency key cho duplicate submit/double click/retry.
- Tạo booking trong Payload với status `Pending`.
- Email confirmation cho khách.
- Email notification cho sales/admin qua Resend.
- Confirmation page: contact channels, share CTA, related content.
- Admin booking workflow:
  - filter theo status/source/date
  - internal notes
  - update status theo transition rules
  - export cơ bản
- Source tracking:
  - `direct`
  - `free-tour-upsell`
  - `blog-cta`
  - `social`
  - `ota`

### Exit criteria

- Valid submit tạo booking `Pending`.
- Invalid input bị reject bởi Zod.
- Duplicate submit không tạo booking trùng.
- Rate limit chặn spam cơ bản.
- Email khách và nội bộ gửi được trong môi trường test.
- Status transition hợp lệ được test.
- Status/admin-critical changes ghi audit trail.

---

## 8. Layer 6 - Free Tours

**Mục tiêu:** đưa lead magnet vào sớm ngay sau booking engine.

### Scope

- Trang `/free-tours`.
- Free tour cards/listing.
- Free tour detail nếu cần.
- Registration dùng chung Inquiry Form.
- Booking source/tag riêng cho Free Tour.
- Homepage section "Join Our Free Tours".
- Upsell paid tours sau khi đăng ký.

### Exit criteria

- Đăng ký free tour tạo booking đúng source.
- Free tour không yêu cầu payment.
- Sales/admin phân biệt được free-tour lead và paid-tour inquiry.
- Confirmation hiển thị upsell paid tours liên quan.

---

## 9. Layer 7 - Trust + Engagement

**Mục tiêu:** tăng trust và sharing nhưng không làm chậm conversion flow.

### Scope

- Cookie consent/GDPR gate cho EU visitors.
- Social share buttons: Facebook, WhatsApp, X, Pinterest, LinkedIn, Email/copy link.
- UTM tracking cho share URLs.
- External review embeds.
- Social login qua Clerk.
- Comments cho tour/blog, yêu cầu login.
- Comment moderation.
- Lazy-load social/review scripts sau consent khi cần.

### Exit criteria

- Share URL có UTM.
- OG metadata hiển thị đúng khi share.
- Social/review embeds fail không làm vỡ layout.
- Comment yêu cầu login và moderation.
- Tracking/social scripts không load trước consent nếu thuộc nhóm cần consent.

---

## 10. Layer 8 - Monetization Without Payment

**Mục tiêu:** thêm doanh thu phụ mà chưa cần online payment.

### Scope

- Add-on services: spa, massage, dental, nail/beauty, wellness.
- OTA affiliate widgets/links: Civitatis, GetYourGuide, Viator, GuruWalk, Klook, KKday.
- Click tracking cho affiliate/add-on.
- Disclosure rõ ràng: external partner/affiliate.
- `OTAWidget` reusable: `provider`, `city`, `experienceIds`, `variant`.
- Graceful fallback nếu OTA script fail.

### Trạng thái triển khai

- ✅ **J/M – OTA UI scaffold** (`d1cda72`, `c75fd9d`): widget + click tracking + 3 surfaces (home, destination, tour). Revenue = 0 cho tới khi có partner IDs.
- ✅ **Add-on click tracking** (`198c1aa`): add-on partner cards trên tour detail wrap qua `<TrackedLink>`.
- ⏳ Owner: đăng ký partner programs theo thứ tự ở `OTA_INTEGRATIONS.md` §3.
- ⏭ **Sprint K – CMS-driven partner IDs**: extend Payload `partners` (hoặc tạo `ota-partners`) collection, migration, đọc partner ID ở request time trong `src/lib/ota-providers.ts`. Mục tiêu: bật doanh thu mà không redeploy.
- ✅ **Sprint L – Affiliate clicks dashboard** (2026-05-27): trang `/internal/affiliate-clicks` (admin-only, Payload session gate) aggregate clicks theo `targetType`, `targetId`, `source`, ngày. Pure aggregator + Payload loader trong `src/services/affiliate-stats.ts`, render trong `src/app/(internal)/internal/affiliate-clicks/`. Robots disallow + noindex layout. 13 unit tests cho aggregator.
- 🟡 **Sprint M – Travel platform expansion** (local 2026-05-29, local gate passed 2026-05-30): CMS city hub + car rental + attractions + product categories + custom inquiries + team/settings; `/free-proposal`; `/car-rentals`; richer destination/tour UX. Awaiting migration review, commit/push, and Vercel deploy verification.

### Sprint M exit criteria before shipping

- `pnpm build` completes locally or in CI without hanging.
- Generated migration is reviewed and applied successfully in Preview.
- Custom inquiry submit creates one `custom-inquiries` row and reuses existing `customers` by email.
- Public users can create but not read custom inquiries.
- `/free-proposal`, `/car-rentals`, `/destinations/[slug]`, `/tours/[slug]` pass mobile smoke checks.
- No payment UI or online payment flow is introduced.

### Exit criteria

- Affiliate/add-on click tracking ghi nhận được. ✅
- Widget fail không làm vỡ layout. ✅ (Server-side render, không phụ thuộc script bên ngoài.)
- Tour của agency vẫn là CTA chính. ✅ (OTA widget nằm dưới CTA chính, hero/booking aside không thay đổi.)
- Có disclosure rõ ràng cho external partner/affiliate. ✅

---

## 11. Layer 9 - Online Payment (Deferred Last)

**Mục tiêu:** thêm online payment song song với Pay Later mà không rewrite booking model. Runtime payment hiện **không ưu tiên**; chỉ triển khai sau khi Pay Later, frontend, security, performance, SEO, content, và production operations đã ổn định.

### Scope

- Payments collection.
- Stripe cho khách quốc tế nếu có pháp nhân phù hợp.
- VNPay/MoMo cho nội địa nếu cần.
- Webhook Route Handlers.
- Idempotency theo provider event id.
- Payment status nullable/optional tiếp tục hỗ trợ Pay Later.
- Booking confirmation PDF/e-ticket nếu cần.

### Exit criteria

- Pay Later flow vẫn hoạt động.
- Payment success cập nhật booking hợp lệ sang `Confirmed - Paid`.
- Webhook retry không tạo duplicate payment.
- Payment fail/cancel không làm mất booking.
- Payment events có audit trail.

---

## 12. Layer 10 - Polish + Production

**Mục tiêu:** go-live ổn định, đo được funnel, có guardrails chi phí.

### Scope

- i18n thật sự: English default, Vietnamese, mở rộng French/German/Korean/Japanese sau.
- Analytics final.
- SEO final: sitemap, schema.org, canonical, redirects.
- Monitoring/logging: Sentry.
- Core Web Vitals pass mức chấp nhận.
- Cost guardrails:
  - Vercel spending limit
  - Neon spending limit
  - R2/storage monitoring
  - QStash monitoring
- Production checklist.

### Exit criteria

- Vercel Preview đã validate.
- Sitemap/schema hoạt động.
- Analytics ghi nhận funnel: visit, tour detail view, inquiry submit, free tour registration, affiliate click.
- Production Neon tắt Scale-to-Zero và bật prewarming.
- `.env` production không thiếu biến bắt buộc.

---

## 13. Dependency map

```text
Layer 1 Foundation
    |
Layer 2 Core Data Models + Access Control
    |
Layer 3 Media Pipeline + Admin Content UX
    |
Layer 4 Public Pages
    |
Layer 5 Booking Lead Engine
    |
Layer 6 Free Tours
    |
Layer 7 Trust + Engagement
    |
Layer 8 Monetization Without Payment
    |
Layer 10 Polish + Production
    |
Layer 9 Online Payment (deferred last)
```

Layer 7 và Layer 8 có thể chạy song song sau khi Layer 5 ổn định và cookie-consent/tracking contract đã rõ. Layer 10 polish/security/performance/SEO hiện đi trước Layer 9. Layer 9 không nên làm song song sớm vì dễ tạo abstraction thừa cho MVP.

---

## 14. Test-first priorities by layer

Chi tiết test strategy nằm trong `TESTING_STRATEGY.md`. Tóm tắt:

- Layer 1: smoke test + CI scripts.
- Layer 2: Zod schemas, access control, migrations, seed data.
- Layer 3: media validation, signed URL permission, job idempotency, failed media fallback.
- Layer 4: public page smoke, SEO metadata, invalid filters.
- Layer 5: booking submit, rate limit, duplicate submit, status transitions, audit trail.
- Layer 6: free-tour registration source tagging.
- Layer 7: consent gating, social share URL/UTM, comment moderation.
- Layer 8: affiliate click tracking, OTA fallback.
- Layer 9: payment webhook idempotency and booking status update.

---

## 15. Cross-reference

- North star: `PURPOSE.md`
- Business overview: `PROJECT_BRIEF.md`
- Feature catalog: `FEATURE_LIST.md`
- Booking flow: `BOOKING_FLOW.md`
- Data model: `DATABASE_SCHEMA.md`
- Testing strategy: `TESTING_STRATEGY.md`
- Extension guide: `EXTENSION_GUIDE.md`
- Tech decisions: `TECH_STACK.md`
- Coding rules: `CODING_GUIDELINES.md`
