# Lighthouse mobile baseline

**Đo:** 2026-05-31 · commit `4f45a01` · target `https://tc-travel-vietnam.vercel.app` (domain mặc định Vercel, region `sin1`)
**Công cụ:** Lighthouse CLI cục bộ (`npx lighthouse@latest --form-factor=mobile --screenEmulation.mobile`, simulated Slow-4G + 4× CPU).
> PageSpeed Insights (PSI) keyless đã hết quota/ngày (HTTP 429 "Queries per day") nên dùng fallback Lighthouse cục bộ theo plan.

## Kết quả (mobile)

| Trang | Perf | A11y | BP | SEO* | LCP | TBT | CLS | FCP | SI |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 67 | 97 | 96 | 69 | 5.2s | 310ms | 0 | 2.7s | 4.6s |
| `/tours` | 82 | 89 | 96 | 69 | 3.7s | 200ms | 0 | 2.3s | 4.0s |
| `/tours/vinh-moc-tunnels-coast-tour` | 62–63 | 96 | 96 | 69 | 6.6s | 220ms | 0 | 3.7s | 5.3s |
| `/destinations/hoi-an` | 84 | 96 | 96 | 69 | 3.9s | 180ms | 0 | 1.9s | 2.8s |
| `/free-proposal` | 71 | 100 | 96 | 66 | 4.4s | 420ms | 0 | 2.5s | 2.8s |
| `/car-rentals` | 82 | 98 | 96 | 69 | 3.7s | 200ms | 0 | 2.3s | 3.9s |

\* **SEO bị trừ điểm CỐ Ý** vì site đang `noindex,nofollow` (pre-launch). Lighthouse phạt "Page is blocked from indexing". Sẽ phục hồi khi bật `ALLOW_INDEXING=true` lúc launch — KHÔNG sửa.

Ngưỡng mục tiêu (docs/toiuu.md §1.2 + Điểm 22): Perf ≥ 90; LCP < 2.0s warm / < 3.5s cache-miss; TBT < 200ms; CLS < 0.1.

## Nhận định

- ✅ **CLS = 0 mọi trang** — không layout shift.
- ✅ **A11y 89–100, Best-Practices 96** — tốt.
- ✅ **server-response-time 40ms** (TTFB) — region/Neon colocate ổn, KHÔNG phải nút thắt.
- ✅ Ảnh đã optimize — `uses-responsive-images` / `uses-optimized-images` / `modern-image-formats` / `render-blocking-resources` **không bị flag** (next/image AVIF + responsive đang hoạt động).
- ⚠️ **Performance 62–84, dưới target 90** — nguyên nhân gần như hoàn toàn là **LCP cao (3.7–6.6s)**, download-bound dưới simulated Slow-4G.
- ⚠️ **TBT `/free-proposal` = 420ms** (form nhiều bước, JS client nặng nhất) — vượt 200ms.
- `total-byte-weight` 515 KiB (home) / 757 KiB (tour detail); `unused-javascript` ~22 KiB — vừa phải.

### Caveat quan trọng về con số LCP
Đây là **kịch bản bi quan nhất**: Lighthouse cục bộ áp simulated Slow-4G (~1.6 Mbps) + 4× CPU slowdown, cộng RTT mạng máy đo. TTFB thực 40ms cho thấy server nhanh; LCP cao chủ yếu là thời gian tải ảnh hero dưới throttle mô phỏng. User thật ở SG/4G-5G/wifi và PSI (datacenter) sẽ cho LCP/điểm tốt hơn đáng kể. Đừng coi LCP lab này là số người dùng thật thấy.

## Triage — follow-up (CHƯA sửa trong lần đo này)

1. **LCP hero pages (`/`, `/tours/[slug]`)** — lever lớn nhất. Cần xác minh: phần tử LCP (hero `<Image>`) có `priority` + `sizes` chính xác (không phục vụ 1920w cho mobile) + cân nhắc `quality` thấp hơn / preload. Bytes & format đã ổn, nên tập trung vào kích thước phục vụ + ưu tiên tải.
2. **`/free-proposal` TBT 420ms** — code-split / defer JS form nhiều bước; cân nhắc hydrate từng bước.
3. **unused-javascript ~22 KiB** — nhỏ, ưu tiên thấp.

## Đo lại sau (post-launch)

- [ ] **PSI (datacenter)** khi có API key hoặc reset quota — số đại diện hơn lab cục bộ.
- [ ] **SEO category** sau khi `ALLOW_INDEXING=true` + domain thật (điểm noindex biến mất).
- [ ] **LCP với content thật** — ảnh hero thật thay seed/fallback hiện tại.
- [ ] Re-baseline trên **domain thật** nếu đặt CDN khác (vd Cloudflare) trước Vercel; nếu trỏ thẳng Vercel thì số không đổi.

## Tái lập
```bash
npx -y lighthouse@latest "<url>" \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --screenEmulation.mobile \
  --output=json --output-path=lh.json --quiet \
  --chrome-flags="--headless=new --no-sandbox"
```
