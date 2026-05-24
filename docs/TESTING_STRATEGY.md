# Testing Strategy

**Phạm vi:** Chiến lược test cho app sau khi scaffold trong `travel-agency/`.  
**Trạng thái:** Chưa có test suite vì repository hiện chỉ chứa docs. File này là contract để implement Layer 1-5.

---

## 1. Mục tiêu

Test suite phải bảo vệ các rủi ro lớn nhất của dự án:

- Booking lifecycle sai hoặc tạo booking trùng.
- Public user đọc/sửa dữ liệu không được phép.
- Schema/Zod lỏng làm dữ liệu bẩn vào Payload.
- Media/OTA/social embed lỗi làm vỡ public page.
- Payment webhook Phase 5 retry tạo payment hoặc status sai.

Không cần coverage hình thức cao ở MVP. Ưu tiên test đúng vào business-critical paths.

---

## 2. Tooling mặc định

- **Runner:** Vitest.
- **Assertion:** Vitest built-in `expect`.
- **Component/UI smoke:** chỉ thêm khi public UI đã ổn định.
- **E2E:** Playwright ở giai đoạn Polish hoặc khi booking flow public đã đủ ổn định.
- **CI gate:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.

Nếu Payload starter đã có test setup khác, giữ một runner chính duy nhất và cập nhật file này theo thực tế.

---

## 3. Test directory layout

```text
tests/
  schemas/
  services/
  actions/
  collections/
  fixtures/
```

- `tests/schemas`: Zod schemas, env validation, form input parsing.
- `tests/services`: pure business logic như booking transitions, pricing, pax consolidation, commission.
- `tests/actions`: Server Action smoke tests cho submit booking/comment.
- `tests/collections`: Payload access control, hooks, field visibility.
- `tests/fixtures`: data mẫu không chứa thông tin thật.

---

## 4. Priority matrix by layer

### Layer 1 - Foundation

- Env loader fail fast khi thiếu biến bắt buộc.
- Smoke test đầu tiên chạy trong CI.
- `pnpm test` không phụ thuộc service bên ngoài.

### Layer 2 - Data Models

- Zod booking/customer/partner/payment-ready schemas.
- Booking status transition service.
- Payload access control:
  - public read content approved/active only
  - public create booking only through validated path
  - authenticated user chỉ đọc booking/comment của mình
  - admin đọc/sửa được internal fields
- Migration/seed smoke test ở local/CI nếu khả thi.

### Layer 3 - Media

- Reject MIME không hợp lệ.
- Reject file quá lớn/dimensions quá lớn.
- Signed upload URL yêu cầu admin/auth hợp lệ.
- Processing job idempotent theo media id/job key.
- Media `failed` hoặc `processing` render fallback.

### Layer 4 - Public Pages

- Invalid filters không crash.
- Detail pages có SEO title/description/OG image fallback.
- Missing image/review/partner data không vỡ layout.

### Layer 5 - Booking Lead Engine

- Valid submit tạo booking `Pending`.
- Invalid input trả typed action result `{ ok: false }`.
- Duplicate idempotency key trả existing booking hoặc no-op an toàn.
- Rate limit reject spam.
- Allowed status transitions pass.
- Disallowed status transitions fail và không ghi state sai.
- Status changes append audit history.
- Email provider fail không tạo duplicate booking khi retry.

### Layer 6 - Free Tours

- Free-tour registration dùng cùng booking action.
- Source/tag là `free-tour-upsell` hoặc free-tour-specific value đã thống nhất.
- Free tour không yêu cầu payment fields.
- Confirmation upsell không crash khi không có paid tour liên quan.

### Layer 7 - Trust + Engagement

- Cookie consent gate chặn GA4/GTM/Facebook/TikTok/social embeds trước consent.
- Social share URL có UTM đúng.
- Comments yêu cầu login và moderation.
- External review embed fallback không vỡ layout.

### Layer 8 - Monetization

- OTA/add-on click tracking ghi nhận đúng provider/destination/tour.
- OTA widget fail không làm fail page render.
- Affiliate disclosure luôn hiển thị khi link external partner xuất hiện.

### Layer 9 - Payment

- Webhook idempotent theo provider event id.
- Payment success hợp lệ chuyển booking sang `Confirmed - Paid`.
- Payment fail/cancel không xóa booking.
- Pay Later flow vẫn hoạt động khi payment provider disabled.
- Payment events append audit trail.

---

## 5. Required booking transition tests

Allowed:

```text
New -> Pending
Pending -> Confirmed - Pay Later
Pending -> Cancelled
Confirmed - Pay Later -> Confirmed - Paid
Confirmed - Pay Later -> Cancelled
Confirmed - Paid -> Completed
```

Required negative cases:

- `Pending -> Completed` fails.
- `Confirmed - Paid -> Pending` fails without admin override + reason.
- Public actor cannot change status.
- Missing audit reason fails for admin override.

---

## 6. Test data rules

- Use fake emails like `customer@example.test`.
- Use fake phone numbers.
- Do not store real API tokens, partner contracts, customer names, or booking details.
- Keep fixtures small and readable.
- Avoid snapshot tests for large rendered pages unless the output is intentionally stable.

---

## 7. Manual QA checklist before production

- Submit paid tour inquiry on mobile.
- Submit free tour registration on mobile.
- Duplicate click submit button does not create duplicate booking.
- Sales/admin can update status and see audit trail.
- Media upload and failed-media fallback work.
- Social/OTA/review embeds are blocked until consent where required.
- Vercel Preview passes `typecheck`, `lint`, `test`, `build`.
- Production env validation passes before deploy.

