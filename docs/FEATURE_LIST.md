# Feature List - VM Travel Platform (MVP)

**Phạm vi:** Toàn bộ tính năng MVP và Phase 2+, dùng cho thảo luận đa bộ phận (sales, ops, content, dev, guide, management).

Mỗi nhóm tính năng đều có **file chi tiết** riêng được tham chiếu — file này là **catalog tổng**, không nhắc lại nội dung file con.

---

## 1. Customer-Facing Features

### 1.1 Homepage & General
- Hero sáng, nhẹ, mobile-first theo hướng private tailor-made/local travel.
- Quick proposal/search box nổi ở đáy hero; mobile mở full-screen modal.
- **Featured Tours** (Editor's pick + Best Sellers).
- **Popular Destinations** (Hội An, Huế, Đà Nẵng, Phong Nha, Sapa, Hà Giang, Phú Quốc…).
- **"Join Our Free Tours"** section (lead gen — xem `FREE_TOUR_STRATEGY.md`).
- **Dynamic Seasonal Banner** (Europe Winter Escape, Vietnam Summer Family, Italy Long Holiday…).
- **Testimonials / Reviews** từ TripAdvisor, Google, GetYourGuide.
- **Trust badges** (TripAdvisor, Google Reviews, GuruWalk…).
- Team/trust preview section.
- Newsletter signup.

### 1.2 Tours

**Tour Listing**
- Infinite scroll hoặc pagination.
- Bộ lọc: Destination, Category, Attraction, Price range, Duration, Departure Date, Tour Type, Group Size, Rating, **Season** (Summer / Winter / Year-round), **Operation Type** (Self-operated / Partner).
- Sort: Featured, Price, Rating, Duration, Newest.
- Filter nhanh: `Summer Tours`, `Adventure Trekking`, `Family Friendly`, `Small Group`, `Free Tours`.

**Tour Detail**
- Gallery ảnh (multiple, optimized — xem `MEDIA_STRATEGY.md`).
- Lịch trình chi tiết dạng accordion trên mobile.
- Mobile sticky tabs: Overview, Itinerary, Price, Reviews.
- Mobile sticky bottom CTA: price + Request this tour.
- Giá theo số người + add-on services.
- Available dates calendar.
- **Booking Form** — Book Now – Pay Later prominent (xem `BOOK_NOW_PAY_LATER.md`).
- **Reviews & Ratings** (internal + embed external).
- **"Recommended Add-ons"** (spa, dental, wellness — xem `ADD_ON_SERVICES.md`).
- **"Similar Experiences"** (gợi ý từ OTA — xem `OTA_INTEGRATIONS.md`).
- Badge: `Summer Special`, `Best Seller`, `Small Group`, `Guaranteed Departure`, `Limited Seats`.
- Thông báo `Minimum X pax to depart` khi tour đang gom (xem `TOUR_OPERATION_MODEL.md`).

### 1.3 Free Tours (Lead Generation)
Trang riêng `/free-tours` (hoặc `/free-walking-tours`). Free Walking Tour Hội An, Free Walking Tour Huế Heritage, Free Cycling Tour Hội An Countryside, Free Đà Nẵng City Tour. Form đăng ký dùng chung Booking Inquiry. Lịch theo tuần/tháng. Chính sách `Free to join — Tips appreciated`.

Chi tiết chiến lược: `FREE_TOUR_STRATEGY.md`.

### 1.4 Booking Flow
- **Inquiry Form**: Name, Email, Phone/WhatsApp, Number of Pax, Preferred Date, Special Request.
- Áp dụng **Book Now – Pay Later** cho cả Paid và Free Tour.
- Email xác nhận tự động (khách + nội bộ).
- Sau submit → gợi ý "Share this tour with friends".
- Hiển thị rõ thông tin liên hệ: WhatsApp, Email, Hotline, Zalo.

Chi tiết: `BOOKING_FLOW.md`, `BOOK_NOW_PAY_LATER.md`.

### 1.4b Free Proposal / Customized Tour
- Route `/customize-tour` cho tailor-made/private trip request.
- Multi-step form 4 bước: Planning, Participants & dates, Travel project, Contact.
- Submit qua `submitCustomInquiry` Server Action.
- Custom inquiry dùng collection riêng `custom-inquiries`, không trộn vào `bookings`.
- No payment required now; sales xác nhận route/quote trước khi khách trả tiền.

### 1.5 Blog / Travel Guide (Posts)
- Tiêu đề, slug, featured image, rich content.
- Category & Tags (Destination, Tour Type, Season…).
- SEO fields (meta title, description, keywords).
- **Related Posts** (3–4 bài cuối mỗi bài) — gợi ý theo Category/Tags, Destination, Season, hoặc view cao.
- **CTA mạnh ở cuối mỗi bài**: nút "Book This Tour" / "Request Similar Tour" / "Join Free Tour" dẫn đến Booking Form.
- Reading time tự động tính.
- Featured posts highlight.
- Destination guide categories: Eat, Drink, Do, Shop, Before the trip, Services, General.
- Có thể gắn bài guide với attraction/destination.

### 1.6 Social & Engagement
- **Social Sharing Buttons** (Facebook, X, Instagram, Pinterest, WhatsApp, LinkedIn) trên Tour Detail, Blog, Destinations.
- **Social Login** (Google, Facebook, Apple) qua Clerk.
- **Embed Instagram Feed** + **Facebook Page Plugin** trên Homepage / Footer.
- **User comments** trên Tour & Blog (yêu cầu sign-up + login).

Chi tiết: `SOCIAL_MEDIA_INTEGRATION.md`.

### 1.7 Reviews & Social Proof
- Nhúng external reviews: TripAdvisor, Google, GetYourGuide, GuruWalk, FreeTour, Viator.
- Internal review/rating sau tour (gửi qua email sau ngày kết thúc tour).
- Hiển thị aggregate rating trên Tour Detail.

### 1.8 Add-ons & Affiliate Revenue
- **Add-on services** (Spa, Massage, Dental, Beauty, Nail) trên Tour Detail + trang `/wellness` — xem `ADD_ON_SERVICES.md`.
- **OTA widgets** (Civitatis, GetYourGuide, Klook, KKday, Viator…) cho "Similar Experiences" — xem `OTA_INTEGRATIONS.md`.

### 1.9 Destinations & Content
- Trang Destinations chi tiết cho từng điểm đến.
- **"Best Time to Visit"** cho từng destination.
- Destination detail trở thành city hub: overview, tours, car rentals, travel guides, attractions.
- **Seasonal Collections** (Europe Winter Escape, Vietnam Summer Family Tour, Italy Long Holiday Special, Australia Winter Getaway).

### 1.9b Car Rentals
- Route `/car-rentals` listing private transfer/day-car routes.
- Route `/car-rentals/[slug]` detail with route, vehicle type, duration, priceFrom, request CTA.
- Filters: destination, route, vehicle type.

### 1.10 User System
- Sign-up / Login (Clerk) — Email + Social.
- Profile cơ bản.
- Để lại comment trên Tour & Blog.
- Xem lịch sử Booking (Phase 2+).

### 1.11 Tổng thể
- **Multi-currency** (USD chính, hiển thị tham khảo VND/EUR).
- **Multi-language** (English mặc định, Tiếng Việt — mở rộng ở Phase sau).
- Mobile-first responsive.
- SEO optimized (meta, OG tags, sitemap, schema.org).

---

## 2. Admin Features (Payload CMS Dashboard)

- CRUD **Tours, Destinations, Posts, Promotions, Add-on Partners, OTA Affiliates**.
- CRUD **Car Rentals, Attractions, Product Categories, Custom Inquiries, Team Members, Site Settings**.
- Quản lý **Bookings**: filter theo status, export Excel, đánh dấu đã liên hệ.
- Quản lý **Custom Inquiries**: status, internal notes, customer reuse by email.
- Quản lý **Comments**: approve / hide.
- Quản lý **Customers**.
- **Dashboard Analytics**:
  - Doanh thu theo tháng & theo thị trường nguồn.
  - Booking trend.
  - Tỷ lệ `Pending → Confirmed - Pay Later → Confirmed - Paid → Completed`.
  - Alert peak season cho từng thị trường.
- Quản lý **Promotions theo mùa**.
- **Media Library** (R2-backed — xem `MEDIA_STRATEGY.md`).
- **SEO Settings** (per-page meta override).
- **Operation Type** quản lý: Self-operated / Partner / Hybrid (xem `TOUR_OPERATION_MODEL.md`).

---

## 3. Phase 2+ (Out of MVP scope)

- **Online Payment** (Stripe + VNPay/MoMo) — deferred last; chạy song song với "Pay Later" cho khách muốn trả trước, không thay thế Pay Later.
- **Booking Confirmation PDF / E-ticket**.
- **Đa ngôn ngữ thật sự**: Pháp, Đức, Hàn, Nhật.
- **Auto-post** Tour/Blog mới lên Facebook & Instagram.
- **Messenger Chat Widget** + **WhatsApp Business** integration.
- **TikTok Pixel + Facebook Pixel** tracking sau cookie consent.
- **User-generated content** (khách upload ảnh chuyến đi → được feature).
- **B2B portal** cho đại lý.
- **Loyalty program / points**.
- **Personalization** (gợi ý tour theo quốc tịch / lịch sử xem).
- **API integration trực tiếp** với OTA (thay thế affiliate widget).

---

## 4. Cross-reference các file chi tiết

| Chủ đề | File |
|---|---|
| Booking policy | `BOOK_NOW_PAY_LATER.md` |
| Booking flow chi tiết | `BOOKING_FLOW.md` |
| Free Tour lead gen | `FREE_TOUR_STRATEGY.md` |
| Mô hình vận hành tour | `TOUR_OPERATION_MODEL.md` |
| Add-on services | `ADD_ON_SERVICES.md` |
| OTA partnerships | `OTA_INTEGRATIONS.md` |
| Social media | `SOCIAL_MEDIA_INTEGRATION.md` |
| Hình ảnh & media | `MEDIA_STRATEGY.md` |
| Seasonality | `MARKET_SEASONALITY.md` |
| Data model | `DATABASE_SCHEMA.md` |
| Phases | `DEVELOPMENT_APPROACH.md` |
| Testing strategy | `TESTING_STRATEGY.md` |
| Extension rules | `EXTENSION_GUIDE.md` |
