# Social Media Integration & Features

**Tên dự án:** VM Travel Platform
**Ngày:** 2026-05-11
**Phạm vi:** Chiến lược tận dụng social media để tăng tương tác, lan tỏa thương hiệu và thu hút traffic. Dùng để align marketing/sales/dev về tính năng cần xây.

## 1. Mục tiêu

- Tăng **viral reach** — khách dễ chia sẻ tour/blog/ảnh đẹp.
- Giảm rào cản đăng ký qua **Social Login**.
- Thu hút traffic từ **Facebook, Instagram, TikTok**.
- Xây dựng cộng đồng khách quay lại + giới thiệu bạn bè.
- Tận dụng UGC (User-Generated Content) để làm marketing miễn phí.

## 2. Tính năng MVP (Bắt buộc)

### 2.1 Social Sharing Buttons
**Hiển thị trên:**
- Tour Detail page
- Blog post
- Destinations page
- Trang Confirmation sau khi submit Inquiry (CTA "Share with friends")

**Nền tảng:**
- Facebook
- WhatsApp (quan trọng nhất cho khách quốc tế)
- X (Twitter)
- Instagram (share to Story)
- Pinterest (mạnh cho travel content)
- LinkedIn (cho B2B/corporate trip)
- Email (link copy + mailto)

**Yêu cầu kỹ thuật:**
- **Open Graph (OG) Meta Tags** tối ưu cho mỗi trang: title, description, ảnh đẹp (1200×630), site name.
- **Twitter Card** tags song song.
- OG image dùng variant `og` từ media (xem `MEDIA_STRATEGY.md`).
- Share URL phải có UTM tracking để biết kênh nào hiệu quả.

### 2.2 Social Login
**Tích hợp qua Clerk (đã hỗ trợ sẵn):**
- Google (quan trọng nhất)
- Facebook
- Apple (yêu cầu cho iOS App Store nếu sau này có app)

**Dùng cho:**
- Đăng ký để **để lại comment** trên Tour & Blog.
- Đăng ký để **xem lịch sử Booking** (Phase 2+).
- Không bắt buộc để submit Inquiry (giữ rào cản thấp nhất).

### 2.3 Embed Social Feed
- **Instagram Feed**: hiển thị posts mới nhất ở Homepage hoặc Footer (visual proof).
- **Facebook Page Plugin**: hiển thị page + CTA "Like" / "Message".
- **Reviews từ Facebook**: nhúng review widget nếu Facebook Page có rating.

**Vị trí hiển thị:**
- Homepage — section "Follow our journey".
- Footer — Instagram strip 6–9 ảnh mới nhất.
- Trang About / Contact — Facebook page plugin.

### 2.4 Call-to-Action chia sẻ
- Sau khi khách submit Booking Inquiry → trang Confirmation hiển thị **"Share this tour with friends"**.
- Sau khi khách hoàn tất tour → email thank-you có nút chia sẻ trải nghiệm.
- Trên Tour Detail → nút share luôn floating ở mobile (sticky bottom).

## 3. Tính năng Phase 2+

### 3.1 Auto-post lên social
- Khi có **Tour mới** → tự động đăng lên Facebook Page + Instagram (ảnh hero + caption + link).
- Khi có **Blog mới** → tự động đăng kèm CTA.
- Khi có **Promotion theo mùa** → tự động đăng banner.
- Yêu cầu: collection `socialPosts` để quản lý queue + lịch sử đăng.

### 3.2 Messaging Widget
- **Facebook Messenger Chat Widget** trên góc dưới cùng (tư vấn nhanh).
- **WhatsApp Business** floating button (priority cao cho khách quốc tế).
- Lưu ý: không nên bật cả 2 cùng lúc — gây nhiễu. Cho khách chọn channel ưu tiên.

### 3.3 Tracking Pixels
- **Facebook Pixel** — tracking conversion từ FB ads.
- **TikTok Pixel** — tracking TikTok ads.
- **Google Analytics 4** + **Google Tag Manager**.
- Tracking events: Tour View, Inquiry Submit, Free Tour Registration, Add-on Click.
- Tất cả pixel/tag phải nằm sau consent gate. Nếu user chưa accept cookie/tracking consent thì không load script, không gửi event, và chỉ lưu trạng thái cần thiết ở first-party consent component.

### 3.4 User-Generated Content (UGC)
- Khách upload ảnh chuyến đi → moderation → được feature trên Destination page + Instagram repost.
- Hashtag campaign: `#VMTravelMoments`, `#VietnamWithVM`…
- Award: ảnh đẹp nhất tháng được tặng voucher / Free Tour.

## 4. Nguyên tắc UX

- **Không spam share button** — chỉ hiển thị nơi thực sự có giá trị chia sẻ.
- **Lazy-load social scripts** — không block LCP.
- **Privacy-conscious**: Instagram/Facebook/TikTok embed dùng "click to load" để tránh tracking trước khi user opt-in (quan trọng với khách EU theo GDPR).
- **Mobile-first**: nút share phải dễ chạm, không che content.

## 5. Yêu cầu kỹ thuật (cho dev)

- Component `SocialShare` reusable, nhận `title`, `url`, `image`, `description`, `platforms[]`.
- OG meta tags được Payload generate tự động từ field `seo` của mỗi tour/post.
- Social Login flow đi qua Clerk — không tự implement OAuth.
- Embed feeds dùng API chính thức của Instagram Graph / Facebook Graph (yêu cầu Business account + access token).
- Tracking pixel, GA4, GTM và interactive social embeds chỉ load sau khi user accept cookie consent.

## 6. Tích hợp với các module khác

- **Booking Flow** (`BOOKING_FLOW.md`) — CTA share ở trang confirmation.
- **Free Tour** (`FREE_TOUR_STRATEGY.md`) — share Free Tour có conversion cao (rào cản thấp).
- **Blog** (`FEATURE_LIST.md` §1.5) — share bài viết kèm UTM.
- **Reviews & Social Proof** (`FEATURE_LIST.md` §1.7) — Facebook reviews là một nguồn social proof.

## 7. Cross-reference

- Features tổng: `FEATURE_LIST.md` §1.6
- OG image variant: `MEDIA_STRATEGY.md` §4
- Data model: `DATABASE_SCHEMA.md` (`socialPosts` Phase 2+)
- Auth provider: `PROJECT_BRIEF.md` §6 (Clerk)
