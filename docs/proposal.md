# Build Proposal - Travel Agency Platform

**Trạng thái:** Tài liệu proposal tham khảo. Nội dung đã được gộp vào roadmap chính `DEVELOPMENT_APPROACH.md`, test plan `TESTING_STRATEGY.md`, và extension rules `EXTENSION_GUIDE.md`.

## Ket luan ngan

De xuat 10 layer hien tai hop ly ve huong tiep can, nhung nen dieu chinh thu tu de giam rui ro debug chong cheo:

- Dua **test strategy, migration strategy, CI, seed data** vao som tu Foundation/Data Models.
- Dua **Free Tours** len ngay sau Booking, vi day la lead magnet quan trong.
- Dua **cookie consent** truoc social embed, tracking pixel va OTA widget.
- Payment de sau la dung voi MVP, vi san pham hien tai uu tien **Booking Inquiry / Book Now - Pay Later**.
- i18n full co the de sau, nhung routing/content model phai **i18n-ready** tu dau.

## Thu tu build de xuat

### Layer 1 - Foundation

Muc tieu: tao nen tang co the deploy/test lap lai.

- Scaffold app bang Payload Official Website Starter.
- Cau hinh Next.js 15 App Router, TypeScript strict, pnpm.
- Ket noi Neon Postgres.
- Setup Tailwind CSS, shadcn/ui.
- Cau hinh Clerk base.
- Cau hinh Vercel Preview.
- Them lint/build/test scripts.
- Chon test runner: Vitest hoac Jest.
- Tao CI toi thieu: typecheck, lint, test, build.
- Quyet dinh routing/content model i18n-ready.

Exit criteria:

- `pnpm build` chay duoc.
- `pnpm lint` chay duoc neu da cau hinh.
- `pnpm test` co test smoke dau tien.
- Vercel Preview deploy duoc.

### Layer 2 - Core Data Models + Access Control

Muc tieu: khoa data contract som, tranh sua schema lon ve sau.

- Tao Payload collections toi thieu:
  - `users`
  - `media`
  - `destinations`
  - `tours`
  - `customers`
  - `bookings`
  - `posts`
- Moi collection co access control ro rang.
- Tao Zod schemas cho input quan trong.
- Them migration strategy bang Payload built-in migrations.
- Tao seed data nho cho dev/test.
- Booking schema phai co payment fields nullable tu dau.

Booking status enum:

```text
Pending
Confirmed - Pay Later
Confirmed - Paid
Completed
Cancelled
```

Exit criteria:

- Migration chay duoc tren local.
- Seed data tao duoc tour, destination, booking mau.
- Unit test cho access control va Zod schemas pass.
- Booking status transition test pass.

### Layer 3 - Media Pipeline + Admin Content UX

Muc tieu: admin co the quan ly content va media on dinh.

- Cau hinh Cloudflare R2.
- Implement signed upload URL.
- Upload original truc tiep len R2.
- Payload `media` collection chi luu metadata/status.
- Background job xu ly sharp variants.
- Media status:
  - `uploading`
  - `processing`
  - `ready`
  - `failed`
- Admin CRUD cho:
  - tours
  - destinations
  - posts/blog
  - media
- Public fallback khi media chua ready hoac failed.

Exit criteria:

- Upload anh khong di qua Vercel request body.
- Anh `ready` render duoc bang Next Image.
- Anh `failed` khong lam vo layout.
- Admin co the tao/sua/xoa tour, destination, post.

### Layer 4 - Public Pages

Muc tieu: co website doc/duyet tour thuc te tu Payload.

- Homepage.
- Tour listing.
- Tour detail.
- Destinations listing/detail.
- Blog listing/detail.
- Basic filters:
  - destination
  - tour type
  - season
  - operation type
  - price
- SEO metadata base.
- OG image dung media variant `og`.
- Static-first + ISR cho tour, destination, blog.

Exit criteria:

- Cac trang public render tu Payload data.
- Filter khong crash khi query rong/sai.
- Trang detail co SEO title/description/OG.
- Layout mobile-first on dinh.

### Layer 5 - Booking Lead Engine

Muc tieu: tao duoc lead that va van hanh sales.

- Inquiry form dung chung cho paid tour va free tour sau nay.
- React Hook Form + Zod validation.
- Server Action submit booking.
- Rate limiting cho Inquiry Form.
- Tao booking trong Payload.
- Email confirmation cho khach.
- Email notification cho sales/admin.
- Confirmation page.
- Admin dashboard booking:
  - filter theo status
  - filter theo source
  - internal notes
  - update status
- Source tracking:
  - `direct`
  - `free-tour-upsell`
  - `blog-cta`
  - `social`
  - `ota`

Exit criteria:

- Submit form tao booking thanh cong.
- Invalid input bi reject boi Zod.
- Rate limit chan spam co ban.
- Email khach va noi bo gui duoc trong moi truong test.
- Status transition hop le duoc test.

### Layer 6 - Free Tours

Muc tieu: dua lead magnet vao som sau khi booking engine on dinh.

- Trang `/free-tours`.
- Free tour cards/listing.
- Free tour detail neu can.
- Registration dung chung Inquiry Form.
- Booking source/tag rieng cho Free Tour.
- Homepage section "Join Our Free Tours".
- Upsell paid tour sau khi dang ky.

Exit criteria:

- Dang ky free tour tao booking dung source.
- Free tour khong yeu cau payment.
- Upsell paid tours hien thi sau confirmation.
- Sales/admin phan biet duoc free tour lead voi paid tour inquiry.

### Layer 7 - Trust + Engagement

Muc tieu: tang trust va sharing ma khong pha conversion flow.

- Cookie consent cho EU/GDPR.
- Social share buttons:
  - Facebook
  - WhatsApp
  - X
  - Pinterest
  - LinkedIn
  - Email/copy link
- UTM tracking cho share URLs.
- External review embeds.
- Social login qua Clerk.
- Comments cho tour/blog, yeu cau login.
- Comment moderation.
- Lazy-load social/review scripts sau consent khi can.

Exit criteria:

- Share URL co UTM.
- OG metadata hien thi dung.
- Social/review embeds fail khong lam vo layout.
- Comment can login va can moderation.
- Tracking script khong load truoc consent neu thuoc nhom can consent.

### Layer 8 - Monetization Without Payment

Muc tieu: them doanh thu phu ma chua can online payment.

- Add-on services:
  - spa
  - massage
  - dental
  - nail/beauty
  - wellness
- OTA affiliate widgets/links:
  - Civitatis
  - GetYourGuide
  - Viator
  - GuruWalk
  - Klook
  - KKday
- Tracking click affiliate/add-on.
- Disclosure ro rang: external partner/affiliate.
- Graceful fallback neu OTA script fail.

Exit criteria:

- OTA/add-on click tracking ghi nhan duoc.
- Widget fail khong day layout vo trang thai loi.
- Tour cua agency van la CTA chinh.
- Co disclosure ro rang cho affiliate/external partner.

### Layer 9 - Payment

Muc tieu: them online payment ma khong rewrite booking model.

- Payments collection.
- Stripe cho khach quoc te neu co phap nhan phu hop.
- VNPay/MoMo cho noi dia neu can.
- Webhook handlers.
- Idempotency cho webhook.
- Payment status nullable/optional tiep tuc ho tro Pay Later.
- Booking confirmation PDF/e-ticket neu can.

Exit criteria:

- Pay Later flow van hoat dong.
- Payment success cap nhat booking sang `Confirmed - Paid`.
- Webhook retry khong tao duplicate payment.
- Payment fail/cancel khong mat booking.

### Layer 10 - Polish + Production

Muc tieu: san sang go-live.

- i18n that su:
  - English default
  - Vietnamese
  - mo rong French/German/Korean/Japanese sau
- Analytics final.
- SEO final:
  - sitemap
  - schema.org
  - canonical
  - redirects
- Performance pass.
- Monitoring/logging.
- Cost guardrails:
  - Vercel spending limit
  - Neon spending limit
  - R2/storage monitoring
- Production checklist.

Exit criteria:

- Vercel Preview da validate.
- Core Web Vitals dat muc chap nhan.
- Sitemap/schema hoat dong.
- Analytics ghi nhan funnel:
  - visit
  - tour detail view
  - inquiry submit
  - free tour registration
  - affiliate click
- Production env khong bat Neon Scale-to-Zero.

## Thu tu uu tien neu chi co 1-2 dev

```text
Layer 1 -> Layer 2 -> Layer 3 -> Layer 4 -> Layer 5 -> Layer 6 -> Layer 7 -> Layer 8 -> Layer 9 -> Layer 10
```

Ly do:

- Layer 1-2 khoa nen tang va data contract.
- Layer 3 giai quyet media som, vi travel site phu thuoc anh rat nhieu.
- Layer 4 tao surface public de content/SEO bat dau chay.
- Layer 5 la diem tao lead va doanh thu chinh cua MVP.
- Layer 6 nen len ngay sau Layer 5 vi Free Tour la lead magnet.
- Layer 7-8 chi nen lam sau khi booking/source tracking on dinh.
- Layer 9 payment de sau dung voi chien luoc Book Now - Pay Later.

## Phan co the song song hoa

Chi nen song song hoa sau khi Layer 5 on dinh.

- Layer 6 Free Tours co the song song voi mot phan Layer 7 neu booking form da stable.
- Layer 7 Engagement va Layer 8 Monetization co the song song, mien la tracking/cookie consent da co contract ro.
- Layer 9 Payment khong nen song song som vi de lam nhieu abstraction thua cho MVP.

## Nguyen tac de de test, mo rong va fix

### Layer dependency ro rang

Layer sau chi duoc build khi layer truoc co exit criteria pass. Muc tieu la tranh debug UI, schema, auth, email, media, payment cung luc.

### Booking modular tu dau

Booking la module trung tam. Payment fields phai nullable tu dau de Phase Payment them vao khong can migrate data lon.

### Server Components default

Dung Server Components cho page/content. Chi dung Client Components cho:

- filters can interactivity
- forms
- share/floating actions
- comment editor
- widgets can browser APIs

### Server Actions cho mutation

Booking submit, comment create, admin write nen di qua Server Actions, tru webhook/payment/external integration can Route Handler rieng.

### Media pipeline async

Khong chay sharp dong bo trong request, Payload hook, Route Handler, hoac Server Action. Upload original len R2, enqueue job, render fallback neu chua ready.

### Test som

Uu tien test cho:

- booking status transitions
- Zod validation
- Payload access control
- rate limiting
- payment webhook idempotency khi toi Layer 9
- OTA/media graceful fallback

### Graceful fallback

Nhung module sau khong duoc lam vo layout neu fail:

- media variants
- OTA widgets
- external reviews
- social embeds
- analytics scripts
- email provider

### Cookie consent som

Vi khach EU la thi truong chinh, cookie consent phai co truoc khi load tracking pixel, social embed, hoac cac third-party scripts can consent.

## Cac diem can bo sung vao docs/spec

- Migration strategy bang Payload built-in migrations.
- Test strategy chinh thuc: Vitest/Jest, coverage uu tien booking/schema/access.
- Rate limiting strategy cho Inquiry Form.
- Cookie consent/GDPR strategy cho EU visitors.
- Email template spec rieng cho booking confirmation, internal notification, reminder, thank-you/review.
- Analytics event naming convention cho funnel.
