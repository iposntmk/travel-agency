# Purpose

**Tên dự án:** Travel Agency Platform (Inbound Tourism)
**Phiên bản:** MVP v1.0
**Ngày:** 2026-05-11

Tài liệu này là **north star** của dự án — định nghĩa *tại sao* chúng ta xây website này, *cho ai*, và *thành công trông như thế nào*. Mọi quyết định kỹ thuật và sản phẩm phải truy nguyên về một trong các mục tiêu dưới đây. Khi có xung đột với các file khác (`PROJECT_BRIEF.md`, `FEATURE_LIST.md`, `DEVELOPMENT_APPROACH.md`...), file này là nguồn ưu tiên về *mục đích*; các file kia là nguồn ưu tiên về *cách thực thi*.

---

## 1. Sứ mệnh (Mission)

Xây dựng một nền tảng bán tour du lịch **chuyên nghiệp, đáng tin cậy, mượt mà** dành cho **khách quốc tế đến Việt Nam** (Inbound Tourism), kết hợp một phần tour nội địa cho khách Việt.

Mục tiêu cuối cùng: trở thành **kênh booking chủ lực** của agency, thay thế dần các kênh truyền thống (OTA, đại lý, email rời rạc).

---

## 2. Đối tượng khách hàng (Who we serve)

### Khách hàng cuối (End users)
- **Khách du lịch quốc tế** đến Việt Nam, ưu tiên:
  - **Châu Âu** (Anh, Pháp, Đức, Hà Lan, Thụy Điển, Na Uy, Đan Mạch, Phần Lan, Ý) — thị trường **quan trọng nhất**, cao điểm Oct–Apr.
  - **Bắc Mỹ** (Mỹ, Canada).
- Thị trường Nam mỹ (các nước nói tiếng Tây ban nha): đặc thù tour rãi rác quanh năm.
  - **Châu Á – English Speaking** (Singapore, Philippines, Ấn Độ, Malaysia, Indonesia,...), tour rãi rác quanh năm
  - **Úc & New Zealand** — cao điểm Jun–Aug và Dec–Jan.
- **Khách Việt Nam** đi tour nội địa — cao điểm hè (May–Aug), tour phổ thông và gia đình.

### Người vận hành (Internal users)
- **Nhân viên agency** (sales, ops) — quản lý booking, tư vấn khách qua WhatsApp/Email/Zalo/Phone.
- **Quản trị nội dung** — đăng tour, blog, ảnh, promotion.
- **Admin/Owner** — xem báo cáo, doanh thu, trend booking theo thị trường và mùa.

---

## 3. Giá trị cốt lõi cần tạo ra (Value proposition)

Mỗi quyết định thiết kế/kỹ thuật phải đóng góp vào ít nhất một trong bốn giá trị:

1. **Trải nghiệm thị giác cao cấp** — Khách quốc tế bị thuyết phục qua hình ảnh trước. Ảnh tour phải load nhanh ở mọi khu vực địa lý, gallery mượt, mobile-first.
2. **Tin cậy & chuyên nghiệp** — Khách trả $1000–$5000 cho một tour không thể đặt qua website "trông nghiệp dư". Reviews thật (TripAdvisor, Google, GetYourGuide), nội dung chuẩn tiếng Anh, thông tin liên hệ rõ ràng.
3. **Booking không ma sát** — Khách điền form trong < 2 phút. Không bắt đăng ký tài khoản ở MVP. Phản hồi của agency phải nhanh (mục tiêu < 1h).
4. **SEO & tốc độ** — Phần lớn traffic đến từ Google organic ("Vietnam tour", "Halong Bay cruise", "best time to visit Vietnam"...). Page speed và meta data là sống còn.

---

## 4. Định nghĩa MVP (What we ship first)

MVP đứng trên **ba trụ cột** mô hình kinh doanh:

### 4.1 Book Now – Pay Later (không thanh toán online)
1. Khách duyệt tour → mở chi tiết → điền **Inquiry/Booking Form**.
2. Booking lưu vào hệ thống với status `Pending`.
3. Email xác nhận tự động cho khách + nội bộ.
4. Nhân viên liên hệ qua **WhatsApp / Email / Zalo / Phone** trong 1h.
5. Thanh toán khi **gặp Tour Guide** hoặc **tại văn phòng agency**.

Chi tiết: `BOOK_NOW_PAY_LATER.md`, `BOOKING_FLOW.md`.

### 4.2 Free Tours làm lead magnet
Free Walking/Cycling Tours (Hội An, Huế, Đà Nẵng) thu hút khách quốc tế → upsell sang tour trả phí + Add-on services. Chi tiết: `FREE_TOUR_STRATEGY.md`.

### 4.3 Hybrid Operation
Tour có thể **self-operated** hoặc **outsource cho partner** tùy số pax và năng lực. UI phản ánh trạng thái: "Guaranteed Departure", "Join existing group", partner badge. Chi tiết: `TOUR_OPERATION_MODEL.md`.

**Lý do chọn các quyết định này:**
- Stripe cho doanh nghiệp VN là rủi ro (cần pháp nhân nước ngoài — `RISKS_AND_MITIGATIONS.md`).
- Tour inbound cần tư vấn cá nhân hoá → con người quan trọng hơn checkout.
- "Pay Later" tạo niềm tin với khách lần đầu, đặc biệt khách EU/Úc.
- Free Tour rút ngắn thời gian từ visit → first contact.
- Hybrid giúp giữ inventory rộng mà không bị áp lực gom pax cứng nhắc.

**Ràng buộc thiết kế (non-negotiable):** Booking module phải **modular và extensible**. Status enum (`Pending → Confirmed - Pay Later → Confirmed - Paid → Completed | Cancelled`), payment fields nullable từ ngày đầu, các điểm "plug-in" được đánh dấu rõ — Phase 5 thêm online payment không phải migrate data.

---

## 5. Tầm nhìn dài hạn (Long-term vision)

Theo thứ tự ưu tiên sau MVP:

1. **Frontend hoàn chỉnh + conversion polish** — mobile-first, nhanh, rõ CTA, không có layout shift/overflow ở các luồng booking/proposal.
2. **Bảo mật + vận hành production** — access control, CSP, rate limit, form sanitization, audit trail, no secret/log/data leakage.
3. **Hiệu suất + SEO** — Core Web Vitals, metadata/canonical/schema/sitemap, media cache, international SEO readiness.
4. **Content engine** — blog/travel guide chất lượng cao, Related Posts tự động, CTA mạnh về Booking.
5. **Add-on & Affiliate Revenue** — Spa/Dental affiliate (`ADD_ON_SERVICES.md`) + OTA experiences (`OTA_INTEGRATIONS.md`) để bổ sung doanh thu khi traffic ổn định.
6. **Đa ngôn ngữ thật sự** (i18n) — Pháp, Đức, Hàn, Nhật cho các thị trường lớn nhất.
7. **Reviews & UGC** — user upload ảnh chuyến đi, hashtag campaign, repost trên Instagram.
8. **Admin Analytics nâng cao** — doanh thu theo thị trường nguồn, theo mùa, alert peak season, tỷ lệ Self vs Partner.
9. **Personalization** — gợi ý tour theo quốc tịch / mùa / lịch sử xem.
10. **Auto social posting** — tour/blog mới tự đăng lên Facebook + Instagram.
11. **Thanh toán trực tuyến** (Stripe quốc tế + VNPay/MoMo nội địa) — triển khai sau cùng, chạy **song song** với Book Now – Pay Later, không thay thế.

---

## 6. Thành công trông như thế nào (Success criteria)

Các chỉ số dưới đây là kim chỉ nam — không phải KPI chính thức, nhưng nếu một đề xuất không cải thiện được chỉ số nào trong đây, hãy chất vấn nó.

### Đối với khách hàng
- **Time-to-inquiry** (từ landing → submit form) **< 3 phút** trên mobile.
- **LCP < 2.5s** ở các thị trường mục tiêu (EU, US, AU, SEA).
- **Bounce rate** trên trang Tour Detail giảm theo thời gian.
- **Conversion rate** từ visit → inquiry tăng đều theo tháng.

### Đối với agency
- **Thời gian phản hồi inquiry < 24h** (đo qua admin dashboard).
- **Tỷ lệ `Pending → Confirmed - Pay Later → Confirmed - Paid → Completed`** tăng dần khi vận hành ổn định.
- **Chi phí hạ tầng < $X/tháng** ở giai đoạn MVP (set spending limit Vercel/Neon/R2/QStash/Cloudflare).

### Đối với SEO
- Index đầy đủ tour pages và destination pages trên Google.
- Xếp hạng cho cụm từ khoá theo mùa ("Vietnam in December", "Best Vietnam tour for European winter escape", v.v. — xem `MARKET_SEASONALITY.md`).

---

## 7. Nguyên tắc ra quyết định (Decision principles)

Khi gặp đánh đổi, áp dụng theo thứ tự sau:

1. **Trải nghiệm khách quốc tế > sự tiện lợi của developer.** Nếu một giải pháp dễ code nhưng load chậm ở EU/Mỹ → bỏ.
2. **Modular > tối ưu sớm.** Booking/payment phải schema-ready, nhưng không triển khai runtime payment trước khi frontend, security, performance và SEO ổn định.
3. **Server-first.** Server Components default, Server Actions cho mutation, static + ISR cho trang tour.
4. **Chi phí có trần.** Mọi dịch vụ serverless phải có spending limit. Bill shock là rủi ro đã ghi nhận.
5. **Bản địa hoá tinh tế, không sến.** Vibrant + cultural (theo style VM Travel), nhưng không kitsch — khách EU/US/AU nhạy cảm với thiết kế thiếu chuyên nghiệp.

---

## 8. Ngoài phạm vi (Explicit non-goals)

Để tránh scope creep, MVP **không** làm các thứ sau:

- Thanh toán trực tuyến (Phase 5).
- Mobile app native (web responsive là đủ cho MVP).
- Marketplace nhiều agency (đây là website của **một** agency).
- Booking khách sạn/vé máy bay riêng lẻ (chỉ bán tour trọn gói; có thể dùng OTA affiliate cho experiences bổ sung).
- B2B portal cho đại lý (giai đoạn sau).
- Loyalty program / points (giai đoạn sau).
- Auto-post lên social media (Phase 2+).
- API integration với OTA (Phase 2+ — MVP chỉ dùng affiliate widget).

---

## Tham chiếu chéo

**Business & strategy:**
- **Business overview:** `PROJECT_BRIEF.md`
- **Phân tích thị trường:** `MARKET_SEASONALITY.md`
- **Rủi ro:** `RISKS_AND_MITIGATIONS.md`

**Product & operations:**
- **Features catalog:** `FEATURE_LIST.md`
- **Booking flow:** `BOOKING_FLOW.md`
- **Pay later policy:** `BOOK_NOW_PAY_LATER.md`
- **Free Tour strategy:** `FREE_TOUR_STRATEGY.md`
- **Tour operation:** `TOUR_OPERATION_MODEL.md`
- **Add-on services:** `ADD_ON_SERVICES.md`
- **OTA integrations:** `OTA_INTEGRATIONS.md`
- **Social media:** `SOCIAL_MEDIA_INTEGRATION.md`
- **Media strategy:** `MEDIA_STRATEGY.md`

**Development:**
- **Phases & timeline:** `DEVELOPMENT_APPROACH.md`
- **Tech stack & architecture:** `CLAUDE.md`
- **Data model:** `DATABASE_SCHEMA.md`
- **Testing strategy:** `TESTING_STRATEGY.md`
- **Extension guide:** `EXTENSION_GUIDE.md`
- **Coding rules:** `CODING_GUIDELINES.md`, `AGENTS.md`
- **Setup & deployment:** `DEVELOPMENT_SETUP.md`, `DEPLOYMENT_GUIDE.md`
