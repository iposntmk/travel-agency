# Media Strategy - Toi uu cho Vercel + Payload CMS

**Pham vi:** Luu tru, toi uu va phan phoi hinh anh (tour gallery, hero, destination, blog).
**Ngay:** 2026-05-11
**Trang thai:** Quyet dinh cho MVP.

---

## 1. Quyet dinh chien luoc

**Storage:** Cloudflare R2
**Optimization:** Sharp chay bang background job
**CDN:** Cloudflare
**Upload:** Direct-to-R2 qua signed URL tu browser
**Render:** Next.js `Image` component

**Khong dung** Cloudinary o MVP de kiem soat chi phi va du lieu.
**Khong chay sharp dong bo** trong Payload hook, Route Handler, hoac Server Action.

## 2. Ly do chon cach nay

- R2 co **10GB free + $0 egress** -> phu hop travel website co nhieu anh.
- Cloudflare CDN phan phoi toan cau, tot cho khach chau Au, Uc, My va SEA.
- Tranh gioi han request body cua Vercel Functions khi upload anh goc 5-20MB.
- Giam nguy co timeout va memory spike tren Vercel khi xu ly anh bang sharp.
- Payload CMS chi quan ly metadata, giup admin on dinh hon khi upload nhieu anh.
- De scale va migrate sau nay neu can Cloudflare Images hoac Cloudinary.

## 3. Kien truc upload va processing

### Upload flow

```
Admin / User
  -> request signed URL tu app
  -> upload original truc tiep len Cloudflare R2
  -> tao/cap nhat media doc trong Payload voi status `processing`
  -> enqueue background job
  -> sharp generate variants
  -> upload variants ve R2
  -> cap nhat media metadata trong Payload voi status `ready`
```

App tren Vercel chi cap signed URL, validate metadata co ban, tao record Payload va enqueue job. Anh goc khong di qua Vercel Function body.

### Background processing

Co the dung mot trong cac phuong an sau cho MVP:

- **Upstash Queue/QStash + Vercel Function** neu thoi gian xu ly ngan va file vua phai.
- **Cloudflare Worker Queue + worker/container xu ly sharp** neu muon gan R2 va Cloudflare.
- **Cloud Run job/service rieng** neu can xu ly anh lon, batch upload, hoac can CPU/RAM on dinh.

Quyet dinh mac dinh: bat dau voi queue/background job don gian, nhung giu interface tach rieng de co the chuyen processor sang Cloud Run ma khong doi Payload schema.

### Read flow

```
Next.js page (Server Component)
  -> Payload query lay media doc
  -> chon variant phu hop (thumb/card/hero/og)
  -> render bang next/image voi URL R2/Cloudflare
  -> Cloudflare cache phan phoi toi user
```

### Bucket structure

```
travel-agency-media/
  originals/{year}/{month}/{image-id}/original.{ext}
  variants/{image-id}/
    thumb.avif
    thumb.webp
    card.avif
    card.webp
    hero.avif
    hero.webp
    og.jpg
```

Key pattern la append-only theo `image-id`. Khi thay anh, tao `image-id` moi va update reference trong Payload, khong overwrite file cu.

## 4. Variant policy

Preset fixed, khong cho dev/admin them tuy tien de tranh storage bloat.

| Variant | Kich thuoc | Quality | Use case |
|---|---:|---|---|
| `thumb` | 400x300 | AVIF 60 + WebP 75 | Card, listing, search results |
| `card` | 800x600 | AVIF 65 + WebP 75 | Tour card, blog preview, destination card |
| `hero` | 1920x1080 | AVIF 70 + WebP 75 | Hero banner, tour detail |
| `og` | 1200x630 | JPEG 82 | Social sharing |
| `original` | giu nguyen | - | Backup only, khong serve truc tiep |

**Moi anh goc** sinh toi da **7 files**: 1 original, 3 variants x 2 formats, va 1 OG JPEG.

### Sharp settings

- Resize: `fit: cover`, `position: attention`.
- Khong upscale anh nho hon target size.
- AVIF: effort 4 cho MVP; tang len 6-9 neu processor chay tren Cloud Run/background batch.
- JPEG OG: dung `mozjpeg`, quality 82.
- Chay variants song song co gioi han concurrency de tranh memory spike.

## 5. Payload media collection

Payload chi luu metadata va trang thai xu ly, khong xu ly file goc trong request.

Field goi y:

- `filename`, `mimeType`, `originalSize`, `width`, `height`
- `originalKey`, `originalUrl`
- `variants` JSON: `thumb`, `card`, `hero`, `og`
- `status`: `uploading` | `processing` | `ready` | `failed`
- `alt`, `caption`
- `processingError` (admin only)

Access control:

- `read`: public cho media `ready`
- `create/update/delete`: authenticated admin only
- Khong expose `processingError` cho public API

## 6. Implementation checklist

### Phase 1 - MVP

- [ ] Tao R2 bucket `travel-agency-media`.
- [ ] Cau hinh public access hoac custom domain `media.<domain>`.
- [ ] Tao R2 API token S3-compatible.
- [ ] Them env vars: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_PUBLIC_URL`.
- [ ] Implement signed URL generation bang Server Action hoac Route Handler nho.
- [ ] Upload original direct-to-R2 tu browser/admin UI.
- [ ] Payload `media` collection chi luu metadata, URL, variants va `status`.
- [ ] Enqueue background job sau khi upload original thanh cong.
- [ ] Implement sharp processor generate variants va upload lai R2.
- [ ] Cap nhat Payload media doc sang `ready` hoac `failed`.
- [ ] Cau hinh `next.config.js` `images.remotePatterns` cho R2/Cloudflare domain.

### Phase 2

- [ ] Toi uu custom `next/image` loader neu can.
- [ ] Dat cache-control headers cho originals va variants.
- [ ] Them cleanup orphan files theo lich.
- [ ] Them retry + dead-letter queue cho job fail.
- [ ] Them UI admin de retry processing.

## 7. Validation va edge cases

- Reject MIME khac `image/jpeg`, `image/png`, `image/webp`.
- Reject file > 20MB cho MVP; neu can lon hon thi dua vao Cloud Run processor.
- Reject dimensions > 8000px.
- Neu upload original thanh cong nhung job fail: giu record `failed`, cho admin retry.
- Neu variant upload fail giua chung: cleanup variant da upload hoac retry idempotent theo cung key.
- Neu user truy cap khi image con `processing`: render placeholder hoac fallback original thumbnail tam thoi.

## 8. Performance va cost estimation

**Uoc tinh MVP:**

- 300 tours x 8 anh x toi da 7 files moi anh -> khoang **2.5-3.5GB**.
- Storage van nam trong R2 free tier 10GB.
- Egress qua Cloudflare/R2: **$0**.
- Sharp chay background nen khong anh huong truc tiep den UX upload va page render.

**Khi scale lon:**

- R2 storage sau free tier: khoang `$0.015/GB/thang`.
- Cloudflare Workers/Queues hoac Upstash queue co chi phi thap voi volume MVP.
- Neu upload/processing tang manh, chuyen processor sang Cloud Run de co CPU/RAM on dinh hon.

## 9. Fallback va upgrade path

- Neu R2 + sharp background qua phuc tap: chuyen sang **Cloudinary** de giam cong van hanh.
- Neu can on-the-fly transform/responsive art direction phuc tap: can nhac **Cloudflare Images** hoac **Cloudinary**.
- Neu can xu ly anh lon, batch import, hoac admin upload nhieu: giu R2 storage nhung chuyen background processor sang **Cloud Run**.

## 10. Cross-reference

- Quyet dinh stack tong quat: `PROJECT_BRIEF.md`, `TECH_STACK.md`, `CLAUDE.md`
- Rui ro chi phi: `RISKS_AND_MITIGATIONS.md`
- Yeu cau trai nghiem visual: `PURPOSE.md`
- Schema media collection: `DATABASE_SCHEMA.md`

---

**Ghi chu:** Chien luoc nay can bang giua kiem soat chi phi, hieu nang va do on dinh tren Vercel. Khong chay sharp dong bo trong request de giam rui ro timeout, memory spike va bill shock.

**Trang thai:** Ready for implementation
**Uu tien:** Cao
