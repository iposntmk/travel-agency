# OTA Integrations & Partnerships

**Phạm vi:** Chiến lược tích hợp các Online Travel Agency để bổ sung doanh thu affiliate, đa dạng sản phẩm cho khách, và tăng tính chuyên nghiệp. Dùng để align sales/marketing/dev về phương án hợp tác.

## Trạng thái triển khai (2026-05-27)

Layer 8 đã có **scaffold + click tracking sẵn sàng**, **chưa có affiliate account**:

- `<OtaWidget provider city source />` render card link sang trang search của provider, đã wire trên tour detail (section "Similar experiences in {destination}").
- Click → `/api/events/click` ghi `affiliate-clicks` row với `targetType: "ota"`, `targetId: "{provider}:{citySlug}"`, `source`, `ipHash` ẩn danh.
- URL hiện tại trỏ trang search chung của provider — **revenue = 0 cho tới khi affiliate ID được thêm**.

### Adding affiliate IDs khi có account

Khi đã ký GetYourGuide / Viator / Klook / Civitatis / GuruWalk partner program:

1. Lấy partner ID / partner param từ dashboard của provider (ví dụ GetYourGuide: `partner_id`, Viator: `pid`, Klook: `aid`).
2. Mở `src/lib/ota-providers.ts`. Mỗi provider có `buildUrl(city)` trả URL — thêm partner param vào URL trả về:
   ```ts
   getyourguide: {
     label: "GetYourGuide",
     buildUrl: (city) =>
       `https://www.getyourguide.com/s/?q=${encodeURIComponent(city)}&partner_id=YOUR_ID`
   }
   ```
3. Nếu partner ID là secret, đưa vào `src/config/env.ts` schema (optional) rồi đọc qua helper, không hardcode.
4. Commit + push — Vercel rebuild, click cũ giữ nguyên log, click mới sẽ kèm partner param và tính commission.

Không cần đổi UI, không cần migration. Click tracking infra (`affiliate-clicks` collection + `<TrackedLink>` + `<OtaWidget>`) đã ổn định.

## 1. Mục tiêu

- Tăng doanh thu qua **commission** từ OTA.
- Bổ sung **trải nghiệm và tour mà agency chưa tự tổ chức** (vé tham quan, day trip, hoạt động độc đáo).
- Tăng tính **đa dạng & chuyên nghiệp** cho website.
- Cross-promote: khách đến vì tour của agency → khám phá thêm experiences → tăng giá trị mỗi visit.

## 2. Chiến lược tích hợp theo Phase

### Phase 1 — MVP (Ưu tiên)
- **Affiliate Links** thuần (UTM tracking + commission tracking từ OTA).
- **Embedded Widgets** trên các trang chiến lược:
  - **Homepage** — section "Featured Experiences".
  - **Destinations page** — "Top things to do in [destination]".
  - **Tour Detail** — section "Similar Experiences" gợi ý các trải nghiệm liên quan.

### Phase 2 — Sau khi launch
- **API integration** (đồng bộ tour, giá, availability real-time).
- **White Label** cho OTA nào hỗ trợ (hiển thị sản phẩm OTA như tour của agency).

## 3. Danh sách OTA & Định hướng hợp tác

| OTA | Phương pháp khuyến nghị | Commission | Ghi chú thị trường |
|---|---|---|---|
| **Civitatis** | Affiliate + Widget | Cao | Rất mạnh ở **Châu Âu** (đặc biệt Tây Ban Nha, Ý, Pháp) |
| **GetYourGuide** | Affiliate + Widget | Trung bình | Mạnh toàn cầu — Tier 1 |
| **Viator** | Affiliate | Trung bình | Thuộc TripAdvisor — credibility cao với khách Mỹ/Anh |
| **GuruWalk** | Affiliate + Walking Tour Widget | Trung bình | Chuyên Free Walking Tour — phù hợp với chiến lược Free Tour của agency |
| **Klook** | Affiliate | Tốt | Mạnh thị trường **Châu Á** (SG, KR, JP, TW, HK) |
| **KKday** | Affiliate | Tốt | Châu Á — tương tự Klook |
| **Airbnb Experiences** | Affiliate Link | Trung bình | Trải nghiệm độc đáo, niche |

**Ưu tiên triển khai theo thị trường mục tiêu:**
- Khách EU → ưu tiên **Civitatis + GetYourGuide**.
- Khách Mỹ/Anh/Úc → **Viator + GetYourGuide**.
- Khách Châu Á → **Klook + KKday**.
- Khách quan tâm Free Tour → **GuruWalk**.

## 4. Vị trí hiển thị trên website

- **Homepage:** Section "Featured Experiences" — 4–6 card từ OTA top performer cho thị trường mặc định.
- **Destinations page:** Widget "Top things to do in [destination]" — cá nhân hóa theo từng điểm đến.
- **Tour Detail page:**
  - Section "Similar Experiences" — gợi ý tour OTA liên quan (cùng destination/theme).
  - **Không** chen ngang quá trình booking của tour chính (đặt ở cuối page).
- **Blog post:** Inline widget khi đề cập đến hoạt động có sẵn trên OTA.
- **Trang riêng `/experiences`** (Phase 2) — tổng hợp tất cả OTA experiences theo destination.

## 5. Nguyên tắc UX & Compliance

- **Disclosure rõ ràng:** Hiển thị nhãn "Powered by [OTA]" hoặc "External partner" cho khách biết.
- **Không che giấu** rằng đây là affiliate — khách EU/US nhạy cảm với dark pattern.
- **Tour của agency luôn ưu tiên** — OTA widget chỉ đặt ở vị trí bổ sung, không che các CTA chính.
- **Loading performance:** OTA script không được block render trang. Dùng lazy-load hoặc load sau LCP.
- **Tracking:** UTM source/medium nhất quán để biết kênh nào đem doanh thu.

## 6. Yêu cầu kỹ thuật (cho dev)

- **Component reusable** `OTAWidget` nhận tham số `provider`, `city`, `experienceIds`, `variant`.
- **Lazy-load** script của từng OTA — chỉ load khi widget vào viewport.
- **Tracking layer** thống nhất: log click → analytics + commission tracking.
- **Fallback graceful** nếu OTA script fail (không vỡ layout).

## 7. Quản trị nội bộ

- Collection `partners` mở rộng (xem `DATABASE_SCHEMA.md`) — lưu thông tin OTA: provider name, commission rate, contact, contract terms.
- Dashboard nội bộ: doanh thu affiliate theo provider, theo tháng, theo destination.

## 8. Cross-reference

- Add-on services khác (spa/dental): `ADD_ON_SERVICES.md`
- Reviews từ OTA hiển thị trên site: `FEATURE_LIST.md` §1.7
- Phase plan: `DEVELOPMENT_APPROACH.md` Phase 4
- Data model: `DATABASE_SCHEMA.md` §`partners`
