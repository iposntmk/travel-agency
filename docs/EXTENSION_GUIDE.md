# Extension Guide

**Phạm vi:** Cách mở rộng hệ thống sau MVP mà không phá booking, data model, SEO hoặc performance.

---

## 1. Nguyên tắc mở rộng

1. **Config/service trước, UI sau.** Thêm enum/config/service và test trước khi gắn vào page component.
2. **Không special-case trong page.** Logic theo market, provider, destination, payment phải nằm trong service hoặc config typed.
3. **Giữ booking lifecycle ổn định.** Payment, partner, free tour hay OTA đều không được tạo status mới nếu chưa có lý do business rõ ràng.
4. **Idempotency mặc định.** Webhook, background job, signed upload callback, booking submit đều phải chống retry/duplicate.
5. **Consent trước tracking.** Third-party analytics, pixels, social embeds và tracking script phải đi qua consent gate khi cần.

---

## 2. Thêm destination mới

Checklist:

- Tạo record `destinations` với slug, title, description, featured image, best-time-to-visit, SEO fields.
- Gắn tour/blog liên quan.
- Thêm seasonal positioning nếu destination có mùa rõ.
- Kiểm tra listing/filter.
- Kiểm tra sitemap/schema.org.
- Thêm seed fixture nếu destination quan trọng cho test.

Không hardcode destination trong component nếu có thể lấy từ Payload.

---

## 3. Thêm market/seasonal campaign

Checklist:

- Cập nhật `MARKET_SEASONALITY.md` nếu đây là quyết định business mới.
- Thêm campaign/collection trong Payload hoặc config typed.
- Gắn `applicableMarkets`, `season`, start/end date.
- Thêm SEO keywords và copy guideline.
- Test filter/banner fallback khi campaign hết hạn.

Ví dụ market labels nên thống nhất: `EU`, `US`, `AU`, `Asia`, `VN`, `LatinAmerica`.

---

## 4. Thêm tour type hoặc operation rule

Checklist:

- Cập nhật enum `tourType` hoặc `operationType` trong schema/config.
- Cập nhật service tính badge/availability thay vì viết logic trong UI.
- Cập nhật filters và admin form.
- Thêm test cho `currentPax`/`minPax` nếu ảnh hưởng vận hành.
- Cập nhật `TOUR_OPERATION_MODEL.md` nếu là rule business mới.

---

## 5. Thêm OTA provider

Checklist:

- Thêm provider vào config của `OTAWidget`.
- Lưu partner/provider trong `partners`.
- Xác định affiliate disclosure text.
- Chuẩn hóa UTM/click tracking.
- Lazy-load script hoặc render link fallback.
- Test widget fail không vỡ layout.

Không để OTA CTA lấn át CTA booking tour của agency.

---

## 6. Thêm add-on service category

Checklist:

- Thêm category vào `partners.partnerType` hoặc service config.
- Xác định commission range và field validation.
- Thêm admin fields cần thiết.
- Thêm disclosure nếu là affiliate/partner.
- Test commission validation và public visibility.

Với dịch vụ rủi ro cao như nha khoa/medical-adjacent, cần review uy tín partner và chính sách hỗ trợ khách trước khi public.

---

## 7. Thêm payment provider

Checklist:

- Giữ Pay Later hoạt động song song.
- Thêm provider config và credentials vào Zod env schema.
- Tạo Route Handler webhook riêng.
- Idempotency theo provider event id.
- Payment success tạo/cập nhật `payments` rồi chuyển booking hợp lệ sang `Confirmed - Paid`.
- Payment fail/cancel không xóa booking.
- Append audit trail.
- Test webhook retry, invalid signature, duplicate event, booking missing, amount mismatch.

Không thêm status mới vào booking chỉ để phản ánh trạng thái tạm thời của provider. Trạng thái chi tiết nằm trong `payments`.

---

## 8. Thêm ngôn ngữ

Checklist:

- English là default locale.
- Route, slug, title/content, SEO metadata phải hỗ trợ locale.
- Không duplicate collection nếu Payload locale fields giải quyết được.
- Fallback locale rõ ràng khi bản dịch thiếu.
- Sitemap/hreflang/canonical cập nhật.
- Test missing translation không crash page.

Ưu tiên sau MVP: Vietnamese, French, German, Korean, Japanese.

---

## 9. Thêm tracking/analytics event

Checklist:

- Đặt tên event nhất quán: `tour_view`, `inquiry_submit`, `free_tour_registration`, `affiliate_click`, `addon_click`, `booking_status_change`.
- Không gửi PII như email/phone/name vào analytics.
- Consent gate trước khi gửi event cho third-party nếu required.
- Lưu server-side event tối thiểu cho funnel critical nếu cần vận hành.
- Test event payload không chứa PII.

---

## 10. Thêm background job

Checklist:

- Job key deterministic.
- Retry-safe.
- Dead-letter/failure state rõ ràng.
- Không phụ thuộc UI request còn sống.
- Có audit/log đủ để debug.
- Test duplicate job no-op hoặc return existing result.

Use cases: media variants, async email, review request, pre-tour reminder, post-tour upsell.

