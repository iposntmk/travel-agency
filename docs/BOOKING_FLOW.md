# Booking Flow

**Phạm vi:** Hành trình của khách từ lúc tìm hiểu tour đến khi hoàn tất booking và post-tour. Dùng để align sales, ops, content và dev về điểm chạm khách hàng.

**Áp dụng cho:** Cả **Paid Tour** và **Free Tour** (Walking/Cycling). Cả hai dùng chung Inquiry Form và status flow.

---

## 1. Hành trình khách hàng (Customer Journey)

```
Discovery → Tour Detail → Inquiry Form → Confirmation → Agency Follow-up → Tour Day → Post-Tour
```

### 1.1 Discovery (vào trang)
- **Google organic** (SEO theo mùa: "Vietnam in December", "Best Hoi An tour"…).
- **Social** (Facebook, Instagram, TikTok).
- **OTA referral** (TripAdvisor, GetYourGuide review → click link).
- **Blog** (Travel Guide → CTA Booking).
- **Free Tour upsell** (đăng ký free → nhận offer paid tour).

### 1.2 Tour Detail
Khách xem:
- Gallery ảnh chất lượng cao.
- Itinerary chi tiết.
- Pricing theo số pax.
- Available dates.
- Reviews (internal + external embed).
- **Badge "Book Now – Pay Later"** nổi bật.
- "Recommended Add-ons" (spa, dental).
- "Similar Experiences" từ OTA.

### 1.3 Inquiry Form
Trường thông tin:
- Họ tên (required)
- Email (required)
- Phone / WhatsApp (required)
- Số khách (number of pax)
- Ngày khởi hành mong muốn (preferred date)
- Yêu cầu đặc biệt (text area)
- **Channel liên hệ ưu tiên**: WhatsApp / Email / Zalo / Phone
- Source ngầm: được auto-tag theo trang đến (direct / free-tour-upsell / blog-cta / social / ota)

**Không có bước thanh toán.** Submit form → vào DB với status `Pending`. Sales xác nhận thủ công trước khi chuyển sang `Confirmed - Pay Later`.

### 1.4 Confirmation
**Ngay sau submit:**
- Hiển thị trang xác nhận: "Thanks! Our team will contact you within 24h via your preferred channel."
- Hiển thị nổi bật: WhatsApp number, Email, Hotline, Zalo.
- CTA phụ: "Share this tour with friends" (xem `SOCIAL_MEDIA_INTEGRATION.md`).
- Gợi ý: "While you wait — explore related blog posts" hoặc "Join our free walking tour in Hội An".

**Email tự động (song song):**
- **Khách:** Booking confirmation + chính sách Pay Later + thông tin liên hệ.
- **Nội bộ:** Notification cho sales team kèm thông tin khách.

### 1.5 Agency Follow-up (Manual)
- Nhân viên agency thấy booking mới trên Admin Dashboard.
- Liên hệ qua **channel khách chọn** (WhatsApp / Email / Zalo / Phone) **trong 24h**.
- Tư vấn, xác nhận chi tiết, gửi báo giá cuối cùng.
- Cập nhật `internalNotes` trong booking.
- Khi khách confirm tham gia → chuyển status từ `Pending` sang `Confirmed - Pay Later`.
- Nếu khách hủy → chuyển `Cancelled`.

### 1.6 Tour Day
- Khách gặp Tour Guide tại điểm đón.
- **Thanh toán tại đó** (cash / chuyển khoản / card nếu có máy POS).
- Hoặc thanh toán tại **văn phòng agency** trước/sau tour.
- Với Free Tour: khách **tip** Guide trực tiếp (tùy tâm).
- Sau thanh toán → admin cập nhật booking sang `Confirmed - Paid`.

### 1.7 Post-Tour
- Email cảm ơn + xin **review**.
- Link gửi review lên TripAdvisor, Google, GetYourGuide.
- Gợi ý tour tiếp theo + Add-on services (spa, dental).
- Khách có thể để **comment** trên Tour Detail (yêu cầu login).
- Cập nhật booking → `Completed`.

---

## 2. Status Flow

```
[New Inquiry]
      ↓
[Pending]                 ← inquiry mới mặc định
      ↓
[Confirmed - Pay Later]   ← sales xác nhận khách tham gia
      ↓
      ├──→ [Cancelled]
      └──→ [Confirmed - Paid]   ← sau khi gặp Guide / tới văn phòng
                ↓
            [Completed]   ← sau ngày tour
```

**Phase 5 (Payment online) bổ sung:**
```
[Pending] → [Confirmed - Paid] (qua Stripe/VNPay/MoMo webhook sau khi thanh toán online thành công)
```

Status enum thiết kế **modular** từ đầu — không phải migrate khi Phase 5 vào.

### 2.1 Transition rules cho dev

- New inquiry: chỉ tạo `Pending`.
- `Pending` → `Confirmed - Pay Later`: sales đã liên hệ và khách xác nhận tham gia.
- `Pending` → `Cancelled`: khách hủy, spam, hoặc không thể phục vụ.
- `Confirmed - Pay Later` → `Confirmed - Paid`: khách đã trả tiền cho guide/văn phòng hoặc payment webhook báo thành công ở Phase 5.
- `Confirmed - Pay Later` → `Cancelled`: khách hủy trước khi thanh toán.
- `Confirmed - Paid` → `Completed`: tour đã diễn ra và ops đóng booking.
- Không cho phép chuyển ngược trạng thái nếu không có quyền admin và audit reason rõ ràng.

### 2.2 Idempotency & audit

- Booking submit phải có idempotency key để double-click/retry không tạo booking trùng.
- Payment webhook Phase 5 phải idempotent theo provider event id.
- Mọi thay đổi `status`, `paymentStatus`, `paymentMethod`, `internalNotes` quan trọng phải ghi audit trail: actor, from, to, reason, source, timestamp.

---

## 3. Email Templates cần chuẩn bị

| Template | Trigger | Người nhận |
|---|---|---|
| Booking Confirmation (Paid Tour) | Submit inquiry | Khách |
| Free Tour Registration | Submit free tour | Khách |
| Internal Notification | Submit inquiry | Sales team |
| Pre-tour Reminder | 1 ngày trước tour | Khách |
| Thank You + Review Request | 1 ngày sau tour | Khách |
| Upsell Add-on | 3 ngày sau tour | Khách |

---

## 4. Related Content & Conversion

- Trong mỗi bài **Blog**:
  - Hiển thị **Related Posts** (3–4 bài).
  - Hiển thị **Related Tours** (nếu có).
  - **CTA mạnh** cuối bài dẫn đến Inquiry Form hoặc Free Tour registration.

- Trong **Tour Detail**:
  - Hiển thị **Similar Tours** (cùng destination/season).
  - **OTA "Similar Experiences"** (affiliate revenue).
  - **Add-on services** (commission revenue).

- Trong trang **Confirmation**:
  - Social share buttons.
  - Gợi ý Free Tour cùng destination.
  - Link đến Blog posts liên quan.

---

## 5. Conversion Funnel (đo lường)

```
Visit → Tour Detail view → Inquiry submit → Agency contact → Tour completed → Review
```

Mỗi bước có metric riêng:
- Visit → Tour Detail: bounce rate, time on site
- Tour Detail → Inquiry: **conversion rate chính**
- Inquiry → Contact: **time to first contact** (< 24h)
- Contact → Completed: **close rate**
- Completed → Review: **review rate**

---

## 6. Cross-reference

- Policy: `BOOK_NOW_PAY_LATER.md`
- Free Tour variant: `FREE_TOUR_STRATEGY.md`
- Tour operation rules (self-op vs partner): `TOUR_OPERATION_MODEL.md`
- Data model: `DATABASE_SCHEMA.md` §`bookings`
- Email content guidelines: TBD (chưa có file riêng)
- Success metrics: `PURPOSE.md` §6
