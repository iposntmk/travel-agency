# Deployment Guide

## 1. Production Environment
- Frontend + Payload: Vercel
- Database: Neon (Singapore region)
- Image storage: Cloudflare R2
- Background jobs: Upstash QStash
- Domain: Vercel + Custom domain

## 2. Environment Rules
- Không commit `.env`.
- Tất cả env vars phải được validate qua Zod schema tập trung khi app khởi động.
- Production Neon phải tắt Scale-to-Zero và bật Compute Prewarming.
- Set spending limits cho Vercel, Neon, R2 và QStash trước go-live.

## 3. Quy trình Deploy
```bash
git push origin master
```

Push lên `master` → Vercel auto-deploy production. Push lên branch khác tạo Preview URL; validate trên Preview trước khi merge vào `master`.
