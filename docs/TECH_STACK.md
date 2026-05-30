# Tech Stack - Travel Agency Platform

**Tài liệu duy nhất ghi nhận các quyết định công nghệ của dự án.**  
Cập nhật ngay khi có thay đổi (thêm/đổi/loại bỏ). Mọi thành viên dev và AI phải tuân thủ tài liệu này.

**Quy ước:** Mỗi mục ghi rõ **Lý do chọn**, **Phương án thay thế đã cân nhắc**, **Ngày quyết định**, và **Lịch sử thay đổi** (nếu có).

---

### 1. Framework & Ngôn ngữ

- **Next.js 15 (App Router) + TypeScript (strict mode)**
- Server Components mặc định, chỉ dùng Client Components khi thật sự cần tương tác.
- Server Actions cho internal mutations (booking, form, admin).
- Route Handlers chỉ dùng cho external webhooks, QStash/background callbacks, signed upload URLs, health checks, hoặc endpoint kỹ thuật không phù hợp với Server Actions.

**Lý do chọn:** SEO cực tốt, hiệu suất cao, edge-ready, phù hợp với khách quốc tế. Dễ làm việc với Payload CMS và Claude Code CLI.  


---

### 2. CMS / Admin / Backend

- **Payload CMS** (TypeScript-first, colocated trong Next.js app)

**Lý do chọn:** Tích hợp sâu với Next.js, Admin Panel mạnh, linh hoạt cao, dễ mở rộng.  

---

### 3. Database

- **Neon Serverless PostgreSQL** (Region: Singapore cho Production)

**Lý do chọn:** Branching mạnh, scale-to-zero, phù hợp traffic theo mùa du lịch.  
**Production config:** Tắt Scale-to-Zero + bật Compute Prewarming.  


---

### 4. Hosting & Deployment

- **Vercel** (Frontend + Payload App)

**Lý do chọn:** Tối ưu Next.js, Edge Network toàn cầu (rất quan trọng với khách quốc tế), Preview Deploy, dễ CI/CD.  
**Quy trình:** Push branch `main` → Production. Mọi PR phải pass Preview.  
**Ngày quyết định:** 10/05/2026

---

### 5. UI / Styling

- **Tailwind CSS + shadcn/ui**
- Mobile-first, Bảng màu chủ đạo: **Trắng / Xanh dương** (chữ đen trên nền sáng, điểm nhấn xanh dương).

**Lý do chọn:** Phát triển nhanh, nhất quán, đẹp và dễ tùy chỉnh.  
**Ngày quyết định:** 10/05/2026

---

### 6. Authentication

- **Clerk** (MVP)

**Lý do chọn:** Nhanh, ổn định, hỗ trợ Social Login tốt.  
**Kế hoạch sau:** Chuyển sang Supabase Auth hoặc self-hosted khi MAU lớn.  
**Ngày quyết định:** 10/05/2026

---

### 7. Payment (Future - Deferred Last)

- Stripe (khách quốc tế) + VNPay/MoMo (khách Việt)
- Hiện tại: **Chưa tích hợp thanh toán trực tuyến**
- Toàn bộ flow sử dụng **Book Now - Pay Later** (trả cho guide hoặc tại văn phòng)
- Runtime online payment chỉ triển khai sau khi frontend, security, performance, SEO và production operations ổn định.

**Lý do:** Xây dựng lòng tin, giảm rào cản booking cho khách quốc tế.  
**Ngày quyết định:** 11/05/2026; cập nhật ưu tiên 30/05/2026

---

### 8. Media & Image Optimization

- **Storage:** Cloudflare R2 (origin storage, $0 egress)
- **Processing:** Sharp qua Upstash QStash/background job — không chạy đồng bộ trong request
- **CDN:** Cloudflare
- **Render:** `next/image` component

**Lý do chọn:** R2 free 10GB + $0 egress, Cloudflare CDN phủ toàn cầu, tránh timeout Vercel Functions.  
**Alternative đã cân nhắc:** Cloudinary, Bunny.net (tốt nhưng R2 tiết kiệm hơn cho MVP).  
**Ngày quyết định:** 11/05/2026  
**Chi tiết:** `MEDIA_STRATEGY.md`

---

### 9. Forms & Validation

- **React Hook Form + Zod**
- **Resolver:** `@hookform/resolvers/zod`
- **Env validation:** Zod schema tập trung cho toàn bộ biến môi trường

**Lý do:** Type-safe, hiệu suất cao, dễ tích hợp với Server Actions.  
**Ngày quyết định:** 10/05/2026

---

### 10. Email Service

- **Resend** (MVP) — email giao dịch (booking confirmation, notification nội bộ)
- Templates dùng React Email (resend/react-email)

**Lý do chọn:** API đơn giản, miễn phí 100 email/ngày cho MVP, tích hợp Next.js tốt.  
**Alternative:** SendGrid, AWS SES (dư sức cho MVP).  
**Ngày quyết định:** 11/05/2026

---

### 11. Background Job / Queue

- **Upstash QStash** (MVP) — queue xử lý ảnh Sharp, email async
- Jobs phải idempotent theo deterministic job key/provider event id.

**Lý do chọn:** Serverless, không cần infrastructure, tích hợp Vercel đơn giản.  
**Alternative:** BullMQ + Redis, Cloudflare Workers Queue.  
**Chi tiết:** `MEDIA_STRATEGY.md` §3

---

### 12. Analytics & Monitoring

- **Google Analytics 4** + **Google Tag Manager**
- **Sentry** (error tracking — production)
- Facebook Pixel / TikTok Pixel chỉ bật sau cookie consent khi chạy ads.

**Lý do chọn:** GA4 free, Sentry free tier 5k events/tháng đủ cho MVP.  
**Ngày quyết định:** 11/05/2026

---

### 13. Package Manager & Runtime

- **pnpm**
- **Node.js 23+**

---

### 13.1 Testing & CI

- **Test runner mặc định:** Vitest
- **CI gate:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`
- **Test placement:** `tests/schemas`, `tests/services`, `tests/actions`, `tests/collections`

**Lý do:** Vitest nhẹ, phù hợp TypeScript/Next.js services và Zod schemas; CI gate bắt lỗi schema, access control, booking transition và build regression sớm.  
**Chi tiết:** `TESTING_STRATEGY.md`

---

### 14. Environment

| Môi trường | Database | Hosting | Ghi chú |
|---|---|---|---|
| **Development** | Neon branch (dev) | `localhost:3000` | Scale-to-Zero bật |
| **Preview** | Neon branch (preview) | Vercel Preview | Tự động mỗi PR |
| **Production** | Neon Singapore (prod) | Vercel Production | Scale-to-Zero tắt + Prewarming |

---

### 15. Architecture Guardrails

- Booking lifecycle chuẩn: `Pending → Confirmed - Pay Later → Confirmed - Paid → Completed | Cancelled`; inquiry mới mặc định `Pending`.
- Booking submit, payment webhook, signed upload callback và QStash/background job phải idempotent.
- Booking status changes và admin-critical operations phải ghi audit trail.
- Routes, slugs, content fields và SEO metadata phải i18n-ready, English là default locale.
- Test placement sau scaffold: `tests/schemas`, `tests/services`, `tests/actions`, `tests/collections`.
