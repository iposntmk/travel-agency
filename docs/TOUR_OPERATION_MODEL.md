# Tour Operation Model & Business Logic

**Ngày:** 2026-05-11
**Phạm vi:** Mô hình vận hành tour của agency. Dùng để align sales, ops, guide team, partner team về cách quyết định tour nào tự tổ chức, tour nào outsource, và cách hệ thống phản ánh trạng thái này.

## 1. Mô hình Kinh doanh Tour — Hybrid

Website hoạt động theo **Hybrid Operation Model**:

| Loại | Mô tả | Khi nào áp dụng |
|---|---|---|
| **Self-Operated** | Agency tự tổ chức (xe, guide, ăn uống, vé tham quan…) | Đủ pax + tour core competency |
| **Partner / Outsource** | Chuyển cho đối tác thực hiện, agency hưởng commission | Ít pax không đủ lãi, hoặc tour không phải thế mạnh |
| **Hybrid** | Mix: ví dụ agency lo guide + transport, partner lo trải nghiệm chuyên môn | Tour đòi hỏi expertise đặc biệt |

### Quy tắc quyết định Self vs Partner

- **Dưới ngưỡng `minPax` tối thiểu** (ví dụ 4–6 pax tùy tour) → chuyển partner.
- **Đủ pax** → tự tổ chức.
- **Tour không nằm trong portfolio agency** (vé show, day trip niche, hoạt động chuyên môn) → mặc định partner.

Hệ thống cần hỗ trợ **tag** và **status** rõ ràng cho từng tour để admin và sales theo dõi.

## 2. Logic Booking với mô hình Hybrid

```
Khách submit Inquiry
    ↓
Admin xem currentPax của tour
    ↓
   ┌─────────────────────────┴──────────────────────────┐
   ↓                                                    ↓
[currentPax >= minPax]                          [currentPax < minPax]
Tự tổ chức                                      ┌──────┴──────┐
"Guaranteed Departure"                          ↓             ↓
                                          [Chờ gom thêm]  [Chuyển partner]
                                          "Join existing  "Confirm with
                                           group"          Partner"
```

## 3. Tour Đặc thù theo Mùa — Mùa Hè (May–Aug)

**Tour Hot Cao điểm Hè:**
- **Phá Tam Giang** (Huế) — Thuyền rạng sáng / hoàng hôn.
- **Trekking**:
  - Núi Kim Phụng (Huế)
  - Bạch Mã National Park
  - Phong Nha – Kẻ Bàng (trekking + hang động)
- **Đà Nẵng – Hội An**:
  - Bà Nà Hills
  - Chàm Islands (Cù Lao Chàm)
  - Tour kết hợp Hội An Ancient Town + Mỹ Sơn

**Chiến lược:**
- Tạo seasonal collection **"Summer Family Tours"** và **"Adventure Tours"**.
- Đẩy mạnh marketing **tháng 4–5** để thu booking sớm trước peak.

Chi tiết phân tích thị trường theo mùa: `MARKET_SEASONALITY.md`.

## 4. Yêu cầu hệ thống (Payload CMS)

### Collection `tours` — fields cần có
- `operationType`: `self-operated` | `partner` | `hybrid`
- `minPax`: số khách tối thiểu để self-operated
- `currentPax`: số pax hiện tại (cập nhật thủ công khi gom group)
- `partner`: relationship với `partners` collection (nếu outsource)
- `season`: `summer` | `winter` | `year-round`
- `isFeaturedInSeason`: boolean
- `status`: `active` | `seasonal` | `sold-out` | `paused`

Chi tiết schema: `DATABASE_SCHEMA.md` §`tours`.

### UI Badge trên Tour Detail
- `Summer Special`
- `Best Seller`
- `Small Group`
- `Guaranteed Departure` (đã đủ pax)
- `Limited Seats — Join Now` (đang gom)
- `Minimum X pax to depart` (chưa đủ)

### Filter trên Tour Listing
- `Summer Tours`
- `Adventure Trekking`
- `Family Friendly`
- `Small Group`
- `Self-Operated` vs `Partner Experience`

## 5. Hiển thị cho khách hàng

### Khi tour đã `Guaranteed Departure`
- Badge xanh "Guaranteed Departure".
- CTA Booking thông thường — "Book Now – Pay Later".

### Khi tour chưa đủ pax (Join Group)
- Badge vàng "Limited Seats — Join Now".
- Thông báo trên Tour Detail: **"Minimum X pax to depart — currently Y joined"**.
- CTA: "Join existing group" hoặc "Request alternative date".
- Sau khi đủ pax → admin update → hệ thống gửi email cho tất cả khách đã đăng ký xác nhận tour chạy.

### Khi tour chuyển partner
- Hiển thị nhẹ nhàng: "Operated by trusted partner [Partner Name]".
- Không che giấu nhưng cũng không nhấn mạnh — khách trả tiền cho agency, agency lo chất lượng.

## 6. Quản trị nội bộ

- **Dashboard:** Admin xem tour nào đang gom pax, sắp đủ pax, chuyển partner.
- **Alert:** Tour gần ngày khởi hành mà chưa đủ pax → trigger quyết định chuyển partner hay cancel.
- **Báo cáo:** Tỷ lệ Self vs Partner theo tháng + theo destination + theo doanh thu.

## 7. Cross-reference

- Booking flow chi tiết: `BOOKING_FLOW.md`
- Booking policy: `BOOK_NOW_PAY_LATER.md`
- Phân tích mùa & thị trường: `MARKET_SEASONALITY.md`
- Add-on services khác (spa, dental): `ADD_ON_SERVICES.md`
- OTA outsource trải nghiệm: `OTA_INTEGRATIONS.md`
- Data model: `DATABASE_SCHEMA.md` §`tours`, §`partners`
- Phases triển khai: `DEVELOPMENT_APPROACH.md`
