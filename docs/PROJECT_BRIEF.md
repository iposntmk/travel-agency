# Travel Agency Website - Project Brief

**Tên dự án:** An Travel Platform (Inbound Tourism)
**Phiên bản:** MVP v1.0
**Ngày:** 2026-05-11

## 1. Mục tiêu kinh doanh

- Xây dựng website chuyên nghiệp bán tour cho **khách quốc tế (Inbound)** đến Việt Nam và một phần khách Việt đi nội địa.
- Thu thập lead chất lượng cao qua **Booking Inquiry Form**, không qua thanh toán online ở MVP.
- Tạo lòng tin qua **social proof** (TripAdvisor, Google, GetYourGuide, GuruWalk, Viator…).
- Tối ưu vận hành theo **seasonality** của từng thị trường để tăng tỷ lệ chuyển đổi.
- Thiết kế sẵn để mở rộng sang **thanh toán trực tuyến** sau cùng và **đa kênh OTA** ở giai đoạn sau.

## 2. Đối tượng khách hàng

- **Khách quốc tế (Foreign Pax)** — ưu tiên Châu Âu, Bắc Mỹ, Úc, Châu Á English-speaking.
- **Khách Việt Nam** — bổ sung cho mùa hè (May–Aug).
- Trải nghiệm yêu cầu: **sang trọng, hiện đại, tin cậy, mobile-first**.

## 3. Thị trường mục tiêu & Seasonality (tóm tắt)

- **Châu Âu (thị trường chính):** Cao điểm Oct–Apr — Anh, Pháp, Đức, Hà Lan, Bắc Âu.
- **Ý:** Cao điểm Aug–Sep (Ferragosto).
- **Châu Á English-speaking:** Singapore, Philippines, Ấn Độ, Malaysia, Indonesia, Hàn Quốc — theo lễ hội từng nước.
- ** Nam mỹ (nói tiếng tây ban nha), rải đều quanh năm
- **Úc & New Zealand:** Jun–Aug và Dec–Jan.
- **Việt Nam (Domestic):** May–Aug (nghỉ hè) — tour Bạch Mã, Phong Nha, Huế, Đà Nẵng, Nha Trang, Phú Quốc, Sapa, Hà Giang.

Chi tiết và chiến lược theo mùa: `MARKET_SEASONALITY.md`.

## 4. Mô hình kinh doanh (tóm tắt)

- **Book Now – Pay Later** (không thanh toán online ở MVP) — xem `BOOK_NOW_PAY_LATER.md`.
- **Hybrid Operation:** Self-operated + Partner outsource — xem `TOUR_OPERATION_MODEL.md`.
- **Free Tours** (Walking/Cycling) làm lead magnet — xem `FREE_TOUR_STRATEGY.md`.
- **Doanh thu bổ sung** qua OTA affiliate (`OTA_INTEGRATIONS.md`) và Add-on services (`ADD_ON_SERVICES.md`).

## 5. Ngôn ngữ

- **Tiếng Anh** (mặc định, ưu tiên cao).
- **Tiếng Việt** (cho khách nội địa).
- Mở rộng i18n cho Pháp, Đức, Hàn, Nhật ở giai đoạn sau.

## 6. Technology Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **CMS & Admin:** Payload CMS
- **Database:** Neon (Serverless PostgreSQL, region Singapore)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** Clerk (MVP) — hỗ trợ Social Login (Google, Facebook, Apple)
- **Payment (future, deferred last):** Stripe (quốc tế) + VNPay/MoMo (nội địa)
- **Image Storage:** Cloudflare R2 + sharp self-transform variants — xem `MEDIA_STRATEGY.md`
- **Form & Validation:** React Hook Form + Zod
- **Package Manager:** pnpm

## 7. Design Reference

[vmtravel.com.vn](https://vmtravel.com.vn) — Hero collage ảnh Việt Nam, palette vàng cam/đỏ cờ/xanh dương, professional + vibrant + cultural, mobile-first.

## 8. Key Decisions

- **Server Components + Server Actions** mặc định.
- **Static-first + ISR** cho trang Tour, Destination, Blog.
- **Edge-ready** khi có thể.
- **Booking module modular** — schema-ready cho payment tương lai mà không phải migrate data, nhưng runtime online payment không ưu tiên trước frontend/security/performance/SEO.

## 9. Cross-reference

- North star sản phẩm: `PURPOSE.md`
- Phases & timeline: `DEVELOPMENT_APPROACH.md`
- Tech decisions: `TECH_STACK.md`
- Features chi tiết: `FEATURE_LIST.md`
- Booking flow: `BOOKING_FLOW.md`
- Data model: `DATABASE_SCHEMA.md`
- Test strategy: `TESTING_STRATEGY.md`
- Extension rules: `EXTENSION_GUIDE.md`
- Rủi ro: `RISKS_AND_MITIGATIONS.md`
- Coding rules: `CODING_GUIDELINES.md` + `CLAUDE.md` + `AGENTS.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
- Local setup: `DEVELOPMENT_SETUP.md`
- Docs map: `DOCS_INDEX.md`
