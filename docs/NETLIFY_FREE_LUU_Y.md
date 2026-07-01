# Lưu Ý Khi Dùng Netlify Free — Rủi Ro & Khi Nào Upgrade

**Ngày:** 2026-07-02
**Bối cảnh:** Travel Agency đã deploy thật lên Netlify Free (https://tc-travel.netlify.app) song song Vercel. Doc này tổng hợp giới hạn của Free, rủi ro **đo được thực tế**, ngưỡng cảnh báo, và khi nào nên trả tiền. Chi tiết kỹ thuật deploy nằm ở [`NETLIFY_FREE_DEPLOYMENT_PLAN.md`](./NETLIFY_FREE_DEPLOYMENT_PLAN.md).

> ⚠️ Netlify đã chuyển account mới sang mô hình **credit-based** (usage tính theo credit gộp). Số liệu dưới là mức tham chiếu của plan Free/Starter — **luôn kiểm tra số thật ở** Netlify dashboard → Team → Usage. Đừng tin số cứng trong doc; tin dashboard.

## 1. Giới Hạn Netlify Free (tham chiếu)

| Hạng mục | Free | Ngưỡng khi vượt |
|---|---|---|
| Bandwidth | **100 GB/tháng** | Hard limit — site bị chặn hoặc phải upgrade |
| Build minutes | **300 phút/tháng** | Hard limit — không build được nữa |
| Serverless function invocations | **~125k/site/tháng** | Vượt → cần plan trả phí |
| Edge function invocations | ~1M/tháng | |
| Function timeout (sync) | **10 giây** | Request lâu hơn → fail |
| Function bundle size | 250 MB giải nén / 50 MB nén (giới hạn Lambda) | Vượt → deploy fail |
| Background functions (>10s, async) | **Không có ở Free** (cần Pro) | |
| Concurrent builds | 1 | Build xếp hàng |
| Form submissions | 100/site/tháng | (app này dùng Server Action, không dùng Netlify Forms) |

## 2. Rủi Ro Cụ Thể Với App Này (đo 2026-07-02)

| Rủi ro | Trạng thái | Ngưỡng nguy hiểm |
|---|---|---|
| **Cold TTFB chậm** | ⚠️ 4–6s cold (car-rentals 6.3s), warm <1s | Netlify Free function region mặc định **US**, xa Neon **Singapore** → mỗi cold start + DB round-trip bị cộng latency. Function timeout 10s → nếu cold start + query nặng chạm 10s là **fail** |
| **Function bundle size** (Payload+Sharp+Lexical) | ✅ pass (deploy ready) | Thêm dependency nặng có thể chạm 50MB nén → deploy fail |
| **Bandwidth ảnh** | ✅ thấp (ảnh trên Cloudflare R2, không qua Netlify) | Nếu vô tình serve ảnh qua Netlify → đốt 100GB nhanh. Giữ ảnh trên R2/Cloudflare |
| **Function invocations do crawler** | ⚠️ chưa đo | Public page cache miss = 1 function invocation. Bot/crawler quét nhiều → tiêu 125k nhanh. Cache hit KHÔNG tính invocation |
| **Sharp/QStash media pipeline** | ⚠️ chưa verify trên Netlify | Xử lý ảnh async qua QStash callback. Nếu function timeout 10s không đủ cho sharp ảnh lớn → cần background function (Pro) |
| **Session admin rớt nhanh** | ⚠️ quan sát được, chưa root-cause | Admin owner-only nên impact thấp; khó chịu khi vận hành |
| **R2 CORS per-origin** | ✅ đã fix | Mỗi domain mới (custom domain) phải thêm origin vào R2 bucket CORS, nếu không upload admin fail |
| **Secrets scanning** | ✅ đã xử lý | `NEXT_PUBLIC_*` inline vào bundle → phải khai `SECRETS_SCAN_OMIT_KEYS`, nếu không build fail |

## 3. Ngưỡng Cảnh Báo — Theo Dõi Hàng Tuần

Vào Netlify dashboard → **Usage**. Đặt cảnh báo (billing alert) và để mắt:

- **Bandwidth**: nếu chạm ~70 GB/tháng (70% của 100) → xem ảnh có bị serve qua Netlify không.
- **Function invocations**: nếu chạm ~90k/tháng → traffic/crawler đang đẩy cache miss quá nhiều → tăng cache coverage.
- **Build minutes**: mỗi build Payload+Next tốn nhiều phút; deploy liên tục dễ chạm 300. Gộp commit, tránh push rác.

## 4. Khi Nào Nên Upgrade / Chuyển Hướng

**Upgrade Netlify Pro (~$19/tháng) nếu:**
- Bandwidth hoặc invocations chạm hard limit đều đặn.
- Cần **background functions** cho xử lý ảnh Sharp >10s.
- Cần nhiều concurrent build (team) hoặc history logs dài hơn.

**Chuyển về Vercel Pro nếu:**
- Cold start / DB latency làm public page chậm không chấp nhận được cho pax (Vercel có region Singapore `sin1` — app đã cấu hình sẵn trong `vercel.json`).
- Debug vấn đề đặc thù Netlify tốn thời gian hơn giá trị tiết kiệm.

**Tách backend / chuyển VPS nếu:**
- Function bundle size không fix sạch.
- Payload admin/Sharp không ổn định (không chỉ chậm) trên serverless.
- Muốn chi phí tháng cố định, kiểm soát region/DB pooling — dùng VPS/Coolify (Docker), frontend giữ trên Netlify/Vercel, Payload+worker chạy riêng.

Thứ tự fallback ưu tiên (từ plan gốc):
1. Frontend trên Netlify/Vercel + Payload/worker trên Render/Railway/Fly/VPS.
2. Full app trên Vercel Pro (launch nhanh, region gần Neon).
3. Full app trên VPS/Coolify (chi phí dự đoán được).

## 5. Dừng Thử Netlify Free Nếu

- Function bundle size không thể fix sạch.
- Payload admin/API bất ổn (không chỉ chậm).
- Sharp processing fail lặp lại trên Netlify functions.
- Public cache miss quá chậm cho SEO/pax.
- Revalidation không đáng tin sau khi sửa content.
- Free credits/limit bị tiêu nhanh bởi traffic/crawler bình thường.
- Thời gian debug Netlify > vài tháng tiền Vercel Pro.

## 6. Nguyên Tắc Vận Hành Free

- **Cache là sống còn**: public page phải cache-first. Cache hit không tính function invocation, không đốt bandwidth ảnh (ảnh ở R2).
- **Không đẩy ảnh qua Netlify**: giữ media trên Cloudflare R2/CDN.
- **Không xử lý ảnh lớn đồng bộ** trong request (timeout 10s).
- **Giữ `ALLOW_INDEXING=false`** đến khi sẵn sàng — tránh crawler đốt invocations sớm.
- **Admin chậm chấp nhận được; public tour page chậm thì không.**

---

**Tóm tắt:** Netlify Free hợp lý cho giai đoạn ít traffic vì frontend cache-first + ảnh offload R2. Rủi ro lớn nhất **không phải** giới hạn Free trên giấy, mà là **cold start + DB latency (region US↔Neon SG)** và **function timeout 10s** cho tác vụ nặng (Sharp). Theo dõi usage hàng tuần; upgrade khi chạm limit đều hoặc khi cold start giết trải nghiệm pax.
