# Risks, Disadvantages & Mitigations

## 1. Cold Start (Neon + Vercel)
- **Rủi ro:** Page load chậm với khách quốc tế
- **Giải pháp:** 
  - Tắt Scale-to-Zero trên Production
  - Bật Compute Prewarming
  - Sử dụng ISR + Next.js Cache mạnh

## 2. Chi phí Serverless
- **Rủi ro:** Bill shock (Vercel, Neon, image hosting)
- **Giải pháp:**
  - Set Spending Limit trên tất cả dịch vụ
  - Giám sát hàng tuần
  - **Media:** dùng Cloudflare R2 + sharp self-transform (free 10GB storage, $0 egress vĩnh viễn) thay vì Cloudinary — xem `MEDIA_STRATEGY.md`
  - Tối ưu ảnh + caching ISR

## 3. Stripe cho doanh nghiệp Việt Nam
- **Rủi ro:** Không hỗ trợ trực tiếp, tài khoản dễ bị khóa
- **Giải pháp:** 
  - Sử dụng pháp nhân nước ngoài (US LLC / Singapore)
  - Hoặc ưu tiên PayPal + VNPay/MoMo ban đầu

## 4. Clerk Authentication
- **Rủi ro:** Chi phí tăng cao khi MAU lớn
- **Giải pháp:** Chuyển sang self-hosted auth khi scale

## 5. Payload CMS
- **Rủi ro:** Cộng đồng nhỏ, cần code nhiều
- **Giải pháp:** Sử dụng Claude Code CLI hỗ trợ mạnh

## 6. Schema drift / migration thiếu kiểm soát
- **Rủi ro:** Data model thay đổi nhưng Preview/Production không có migration hoặc seed/backfill tương ứng.
- **Giải pháp:**
  - Dùng Payload built-in migrations.
  - Mọi schema change phải đi kèm migration và test liên quan.
  - Seed data dev/test phải nhỏ, deterministic, không chứa dữ liệu thật.

## 7. Booking duplicate / spam lead
- **Rủi ro:** Double-click, retry, bot spam tạo booking trùng hoặc làm sales quá tải.
- **Giải pháp:**
  - Booking submit phải có `idempotencyKey`.
  - Server Action phải rate-limit.
  - Duplicate submit trả existing result hoặc no-op an toàn.
  - Test cases bắt buộc trong `TESTING_STRATEGY.md`.

## 8. GDPR / consent cho thị trường EU
- **Rủi ro:** GA4/GTM/Facebook/TikTok Pixel hoặc social embeds load trước consent, không phù hợp thị trường chính EU.
- **Giải pháp:**
  - Cookie consent gate trước tracking/social embeds.
  - Click-to-load placeholder cho social embeds.
  - Không gửi PII vào analytics events.
