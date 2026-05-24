# Development Setup

## Prerequisites
- Node.js 23+
- pnpm
- Neon Database
- Cloudflare R2 bucket + S3-compatible API token
- Upstash QStash account/token

## Setup Local

```bash
# 1. Tạo project
npx create-payload-app@latest travel-agency

# 2. Cài dependencies
cd travel-agency
pnpm install

# 3. Config environment
cp .env.example .env
# → Dán DATABASE_URL từ Neon, R2 vars, QStash vars, Clerk vars, Resend vars
```

## Environment Validation

Sau khi scaffold app, tạo một env loader tập trung bằng Zod (ví dụ `src/config/env.ts`) và chỉ đọc `process.env` trong file đó. App phải fail fast nếu thiếu hoặc sai `DATABASE_URL`, Clerk keys, R2 config, QStash token, Resend key, hoặc public site URL.

## Required Scripts After Scaffold

`travel-agency/package.json` là nguồn chuẩn cho command. Sau khi scaffold, bảo đảm có các script tối thiểu:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm payload migrate
pnpm seed
```

Tên script migration/seed có thể điều chỉnh theo starter thực tế, nhưng phải có command tương đương và được ghi lại trong file này.

## Local Verification Loop

Trước khi mở PR hoặc deploy preview:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Nếu một command chưa cấu hình ở giai đoạn scaffold đầu tiên, ghi rõ trong PR và tạo issue/todo để bổ sung ngay trong Layer 1.

## Local Environment Checklist

`.env.example` sau scaffold cần có tối thiểu:

```text
DATABASE_URL=
PAYLOAD_SECRET=
NEXT_PUBLIC_SITE_URL=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
R2_ACCOUNT_ID=
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
RESEND_API_KEY=
SENTRY_DSN=
```

Không commit `.env`. Không đọc `process.env` trực tiếp ngoài env loader tập trung.

## First Implementation Checklist

- Tạo `src/config/env.ts` với Zod validation.
- Tạo test runner Vitest và smoke test đầu tiên.
- Tạo Payload migrations baseline.
- Tạo seed script nhỏ cho dev/test theo `DATABASE_SCHEMA.md`.
- Cấu hình `next.config` cho `images.remotePatterns` của R2/Cloudflare.
- Cấu hình Vercel Preview trước khi bắt đầu public UI.
