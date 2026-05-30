# Database Schema (Payload CMS Collections)

**Phạm vi:** Cấu trúc data model — mô tả bằng ngôn ngữ business, không phải code. Dùng để align dev + sales + ops + content team.

## 1. Collections chính

| # | Collection | Mục đích |
|---|---|---|
| 1 | **users** | Tài khoản nội bộ (admin, editor, sales) + Customer login qua Clerk. |
| 2 | **tours** | Toàn bộ tour bán/free (Self-operated + Partner). |
| 3 | **destinations** | Điểm đến (Hội An, Huế, Đà Nẵng…). |
| 4 | **bookings** | Inquiry/Booking của khách (Paid + Free Tour). |
| 5 | **customers** | Thông tin khách hàng (link với users hoặc đứng riêng). |
| 6 | **posts** | Bài Blog / Travel Guide. |
| 7 | **comments** | Comment khách (yêu cầu login) trên Tour & Post. |
| 8 | **reviews** | Review nội bộ của khách sau tour. |
| 9 | **promotions** | Khuyến mãi & code giảm giá theo mùa. |
| 10 | **partners** | Đối tác outsource tour + Add-on services (spa, dental). |
| 11 | **media** | Hình ảnh & video (R2-backed — xem `MEDIA_STRATEGY.md`). |
| 12 | **payments** | Bản ghi thanh toán (Phase 5 — payment online). |
| 13 | **car-rentals** | Private transfer/day-car products by route, destination, vehicle type. |
| 14 | **attractions** | Điểm tham quan trong destination hub, dùng để gắn tour/guide. |
| 15 | **product-categories** | Category chung cho tour/car rental/guide. |
| 16 | **custom-inquiries** | Lead form cho tailor-made/free proposal, tách khỏi `bookings`. |
| 17 | **team-members** | Team/trust content public. |
| 18 | **site-settings** | Hotline, WhatsApp, sales email, footer legal/trust summary. |

## 2. Quan hệ chính

- `Tour → Destination` (relationship)
- `Tour → Product Categories[]`
- `Tour → Attractions[]`
- `Tour → Partner` (optional — nếu outsource)
- `Booking → Tour`
- `Booking → Customer`
- `Custom Inquiry → Customer`
- `Custom Inquiry → Destinations[]`
- `Car Rental → Destination`
- `Car Rental → Partner` (optional)
- `Attraction → Destination`
- `Comment → Tour` hoặc `Comment → Post`
- `Comment → User` (người comment)
- `Review → Tour`
- `Post → Destination`
- `Post → Tour` (optional)
- `Post → Post[]` (Related Posts, manual hoặc auto)
- `Post → Tags / Categories`
- `Promotion → Tour[]` (áp dụng cho tour nào)
- `Payment → Booking` (Phase 5)

## 3. Field quan trọng theo Collection

### `tours`
- `title`, `slug`, `description` (rich), `featuredImage`, `gallery[]`
- `destination` (relationship)
- `operationType`: `self-operated` | `partner` | `hybrid`
- `partner` (relationship — nếu outsource)
- `minPax`: số khách tối thiểu để self-operated
- `currentPax`: cập nhật thủ công khi gom group
- `season`: `summer` | `winter` | `year-round`
- `isFeaturedInSeason`: boolean
- `durationDays`, `durationText`, `routeSummary`
- `groupSizeMin`, `groupSizeMax`
- `categories[]` (relationship → product-categories)
- `attractions[]` (relationship → attractions)
- `ratingAverage`, `ratingCount` (denormalized approved review aggregate)
- `isFeatured`, `sortWeight`
- `tourType`: `free-walking` | `free-cycling` | `paid-private` | `paid-group` | `adventure` | `family` | `cultural`
- `status`: `active` | `seasonal` | `sold-out` | `paused`
- `priceFrom`, `currency`, `pricingTiers[]`
- `availableDates[]`
- `itinerary[]` (rich)
- `addOns[]` (relationship → partners)
- `seo` (meta title, description, OG image)

### `bookings`
- `customer` (relationship)
- `tour` (relationship)
- `numPax`, `preferredDate`, `specialRequest`
- `contactChannel`: `whatsapp` | `email` | `zalo` | `phone`
- `status`: `Pending` | `Confirmed - Pay Later` | `Confirmed - Paid` | `Cancelled` | `Completed`
- `idempotencyKey` (unique, required for public submit)
- `paymentMethod` (nullable — Phase 5)
- `paymentStatus` (nullable — Phase 5)
- `paymentProviderEventId` (nullable, unique when present — Phase 5 webhook idempotency)
- `internalNotes` (admin only)
- `source`: `direct` | `free-tour-upsell` | `blog-cta` | `social` | `ota`
- `statusHistory[]`: append-only audit trail with `from`, `to`, `actor`, `reason`, `source`, `createdAt`

### `destinations`
- `title`, `slug`, `description`, `featuredImage`
- `heroImage`, `summary`, `bestTimeToVisit`, `hubIntro`
- `region`: `central` | `north` | `south`
- `sortWeight`
- `featuredTours[]`, `featuredCarRentals[]`, `featuredGuides[]`
- `seo` (meta title, description, OG image)

### `car-rentals`
- `title`, `slug`, `destination`
- `routeFrom`, `routeTo`, `vehicleType`: `sedan` | `suv` | `van` | `luxury` | `minibus`
- `durationText`, `priceFrom`, `currency`
- `featuredImage`, `gallery[]`
- `partner` (optional)
- `status`: `active` | `paused`
- `seo` (meta title, description, OG image)

### `attractions`
- `destination`, `title`, `slug`, `summary`, `featuredImage`
- `categories[]` (relationship → product-categories)
- `sortWeight`
- `seo` (meta title, description, OG image)

### `product-categories`
- `title`, `slug`
- `type`: `tour` | `car-rental` | `guide` | `shared`
- `sortWeight`

### `custom-inquiries`
- Customer/contact: `customer`, `customerName`, `email`, `phone`, `nationality`, `whatsappOptIn`
- Planning: `planningStage`, `referralSource`, `travelCompanions`, `occasion`
- Participants/dates: `adults`, `children`, `exactDatesKnown`, `departureDate`, `returnDate`, `departureMonth`, `estimatedDays`
- Project: `accommodationLevels[]`, `themes[]`, `accompanimentType`, `budgetPerPerson`, `maxBudget`, `selectedDestinations[]`, `message`
- Ops: `source`, `status`, `internalNotes`, `idempotencyKey`
- Public creates are accepted through the Server Action; public reads are blocked.

### `posts`
- `title`, `slug`, `featuredImage`, `content` (rich)
- `categories[]` (relationship)
- `tags[]` (text array)
- `relatedPosts[]` (manual hoặc auto — gợi ý theo category/tag/season/destination)
- `destination` (optional relationship)
- `guideCategory`: `eat` | `drink` | `do` | `shop` | `before-trip` | `service` | `general`
- `attractions[]` (relationship → attractions)
- `sortWeight`
- `relatedTour` (optional relationship — cho CTA Booking cuối bài)
- `featured`: boolean
- `readingTime`: number (tự động tính)
- `seo` (meta title, description, OG image, keywords)

### `comments`
- `author` (relationship → user, yêu cầu login)
- `target` (polymorphic → tour hoặc post)
- `content` (text)
- `status`: `pending` | `approved` | `hidden`
- `createdAt`

### `partners`
- `name`, `logo`, `description`
- `partnerType`: `tour-outsource` | `spa` | `dental` | `nail` | `wellness` | `other`
- `location` (relationship → destinations)
- `commissionRate` (number)
- `contactPerson`, `phone`, `email`, `whatsapp`
- `rating`, `isFeatured`
- `inquiryFormUrl` (cho affiliate)

### `promotions`
- `name`, `code`, `description`
- `discountType`: `percentage` | `fixed`
- `discountValue`
- `applicableTours[]`
- `applicableMarkets[]`: `EU` | `US` | `AU` | `Asia` | `VN`
- `startDate`, `endDate`
- `season`: link với seasonal strategy

### `media`
- `filename`, `mimeType`, `originalSize`
- `variants` (JSON): `thumb`, `card`, `hero`, `og` — mỗi variant có URL R2
- `alt`, `caption`
- `width`, `height`
- Xem `MEDIA_STRATEGY.md` cho chi tiết variant generation.

### Cross-cutting fields

- Public content collections (`tours`, `destinations`, `posts`) must keep route, slug, title/content and SEO fields i18n-ready. English is default, with future locale support for French, German, Korean and Japanese.
- Admin-critical collections (`bookings`, `payments`, `partners`, `promotions`, `media`) should include append-only audit metadata when important state changes happen.
- Technical records created by retries, webhooks, signed uploads or QStash jobs must store an idempotency key or provider event/job id.

## 4. Access Control (nguyên tắc)

Mỗi collection **phải** declare access rõ ràng:

- **Public read:** `tours`, `destinations`, `posts`, `media`, `reviews` (approved), `comments` (approved), `partners` (featured).
- **Authenticated user read/write:** `comments` (create own), `bookings` (create + xem lịch sử của mình).
- **Admin/staff only:** inquiry/admin records such as `custom-inquiries`, `bookings`, `promotions`, `payments`. Delete remains admin-only.
- **Public create:** `bookings` and `custom-inquiries` through validated, rate-limited, idempotent Server Actions.
- **Public booking/custom inquiry submit:** Cho phép tạo inquiry không cần login qua Server Action đã rate-limit, validate Zod và idempotent. Public user không được đọc booking/custom inquiry của người khác.

## 5. Cross-reference

- Booking lifecycle: `BOOKING_FLOW.md`, `BOOK_NOW_PAY_LATER.md`
- Tour operation logic: `TOUR_OPERATION_MODEL.md`
- Free Tour data flow: `FREE_TOUR_STRATEGY.md`
- Media variants: `MEDIA_STRATEGY.md`
- Coding rules cho access control: `CODING_GUIDELINES.md`

## 6. Migration & seed strategy

Sau khi scaffold app, dùng **Payload built-in migrations** làm nguồn chuẩn cho mọi thay đổi schema.

### Nguyên tắc migration

- Không chỉnh schema production mà không có migration tương ứng.
- Migration phải chạy được lặp lại an toàn trong Preview và Production.
- Thay đổi breaking trên collection public (`tours`, `destinations`, `posts`) phải có fallback render hoặc data backfill trước khi deploy.
- Không rename/delete field quan trọng của booking/payment nếu chưa có migration data rõ ràng.
- Payment fields phải tồn tại nullable từ MVP để Phase 5 không cần migration lớn.
- Travel platform expansion migration: `20260529_124032_travel_platform_expansion` adds city hub fields, car rentals, attractions, product categories, custom inquiries, team members, and site settings. Review before applying to Preview/Production.

### Seed data tối thiểu

Tạo seed script cho dev/test với dữ liệu nhỏ nhưng đủ phủ luồng chính:

- 3 destinations: Hội An, Huế, Đà Nẵng.
- 4 tours:
  - paid private tour
  - paid group tour
  - free walking/cycling tour
  - partner-operated tour
- 1 customer mẫu.
- 3 bookings mẫu: `Pending`, `Confirmed - Pay Later`, `Completed`.
- 2 posts có related tour/destination.
- 2 partners: 1 tour outsource, 1 add-on service.

Seed script không được dùng secret thật và không được tạo dữ liệu production ngẫu nhiên.

## 7. Booking state machine contract

Booking status transition phải được implement trong service/hook riêng, không nằm rải rác trong UI.

Allowed transitions:

| From | To | Actor hợp lệ | Ghi chú |
|---|---|---|---|
| New | `Pending` | public Server Action | Inquiry mới luôn bắt đầu `Pending`. |
| `Pending` | `Confirmed - Pay Later` | sales/admin | Khách đã xác nhận tham gia. |
| `Pending` | `Cancelled` | sales/admin | Spam, khách hủy, hoặc không thể phục vụ. |
| `Confirmed - Pay Later` | `Confirmed - Paid` | sales/admin/webhook Phase 5 | Đã thanh toán tại guide/văn phòng hoặc payment success. |
| `Confirmed - Pay Later` | `Cancelled` | sales/admin | Hủy trước thanh toán. |
| `Confirmed - Paid` | `Completed` | ops/admin | Tour đã diễn ra và được đóng. |

Mọi transition phải append `statusHistory[]`. Transition ngược chỉ cho admin và phải có `reason`.

## 8. Schema test requirements

Khi có code, test liên quan schema đặt tại:

- `tests/schemas`: Zod input/env schemas.
- `tests/collections`: Payload access control và collection hooks.
- `tests/services`: booking transition, pricing tiers, partner commission, tour consolidation.

Priority cases:

- Booking schema reject thiếu name/email/phone/preferredDate/numPax không hợp lệ.
- `idempotencyKey` unique cho public booking submit.
- Public không đọc được booking người khác.
- Non-admin không đọc được `internalNotes`, `commissionRate`, `processingError`.
- Media public chỉ đọc được record `ready`.
- Partner commission trong range business cho phép.
