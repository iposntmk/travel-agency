# Tech Stack — TC Travel Vietnam

**Current stage:** Layer 7 — Trust + Engagement started. Booking leads persist to Payload/Postgres; Clerk user webhooks sync to Payload customers after `CLERK_WEBHOOK_SIGNING_SECRET` is configured in Vercel.

---

## Frontend

| Công nghệ | Vai trò |
|---|---|
| **Next.js 15** (App Router) | Framework chính, Server Components + ISR |
| **React 19** | UI Library |
| **TypeScript 5.8** (strict) | Ngôn ngữ |
| **Tailwind CSS 3.4** + PostCSS + Autoprefixer | Styling utility-first |
| **shadcn/ui** (new-york style) + Radix Slot | Component library |
| **class-variance-authority** + tailwind-merge + clsx | Quản lý variants & class |
| **lucide-react** | Icon library |
| **react-hook-form** + @hookform/resolvers | Form management |

---

## Backend / Server

| Công nghệ | Vai trò |
|---|---|
| **Next.js 15 Route Handlers** (`route.ts`) | API endpoints (signed upload, QStash webhook) |
| **Next.js Server Actions** (`"use server"`) | Form mutations (booking) |
| **Payload CMS 3.84** | Headless CMS colocated, tự động tạo REST/GraphQL API |
| **tsx** | Chạy script TypeScript (seed, migrate) |

---

## Database

| Công nghệ | Vai trò |
|---|---|
| **Neon Serverless PostgreSQL** | Database serverless |
| **@payloadcms/db-postgres** | Database adapter cho Payload |
| **Payload Migrations** (5 files) | Quản lý schema migrations |
| **Payload Client** (`src/lib/payload.ts`) | Singleton kết nối Payload server-side |

---

## CMS (Payload)

| Công nghệ | Vai trò |
|---|---|
| **Payload CMS 3.84** | Headless CMS |
| **@payloadcms/next** | Tích hợp Payload + Next.js |
| **@payloadcms/richtext-lexical** | Rich text editor (Lexical) |
| **@payloadcms/storage-s3** | Storage plugin (Cloudflare R2) |
| **12 collections** | Users, Media, Tours, Destinations, Bookings, Customers, Posts, Comments, Reviews, Partners, Promotions, Payments |

---

## Media & Storage

| Công nghệ | Vai trò |
|---|---|
| **Cloudflare R2** (S3-compatible) | Object storage (zero egress fee) |
| **@aws-sdk/client-s3** | S3 operations (PutObject, GetObject) |
| **@aws-sdk/s3-request-presigner** | Tạo signed URL cho browser upload trực tiếp |
| **sharp** | Xử lý ảnh (resize → thumb/card/hero/og, convert AVIF/WebP/JPEG) |
| **Upstash QStash** | Queue xử lý ảnh bất đồng bộ |

---

## Authentication & Authorization

| Công nghệ | Vai trò |
|---|---|
| **Clerk** (@clerk/nextjs) | Authentication frontend (khách hàng) |
| **Clerk webhooks** | `user.created` / `user.updated` sync vào Payload `customers.clerkUserId` |
| **Payload Auth** (built-in) | Authentication admin CMS |
| **Role system** (admin / editor / sales) | Phân quyền Payload collections |
| **Access functions** (`src/collections/payload/access.ts`) | Kiểm soát quyền read/create/update/delete từng collection |

---

## Email

| Công nghệ | Vai trò |
|---|---|
| **Resend** | Transactional email service (đã config env, chưa tích hợp code) |

---

## Security

| Công nghệ / Pattern | Vai trò |
|---|---|
| **Zod** (3-tier validation) | Schema validation: UI (RHF) → Server Action (safeParse) → Database (Payload hooks) |
| **Rate limiting** (token bucket) | `src/services/rate-limit.ts` — 5 req/60s cho booking |
| **CORS / CSRF whitelist** | `payload.config.ts` — chỉ cho phép origins được cấu hình |
| **Env validation** (`src/config/env.ts`) | Validate toàn bộ env vars khi khởi động |
| **QStash Receiver** | Xác thực webhook signature từ QStash |
| **Idempotency keys** | Trùng lặp booking / job xử lý media |

---

## Testing

| Công nghệ | Vai trò |
|---|---|
| **Vitest 3.1** | Test runner (globals: true, environment: node) |
| **@testing-library/react** | Component testing |
| **13 test files** (~57 tests) | Actions, API, Collections, Schemas, Services, Lib |

---

## Background Jobs / Queue

| Công nghệ | Vai trò |
|---|---|
| **Upstash QStash** | Message queue serverless |
| **QStash Receiver** | Xác thực webhook callback |
| **Flow:** Upload → QStash → Sharp resize → Lưu variants → R2 |

---

## CI/CD & Deployment

| Công nghệ | Vai trò |
|---|---|
| **GitHub Actions** | CI pipeline (typecheck → lint → test → build) |
| **Vercel** | Hosting + auto-deploy (push master → production) |
| **pnpm 10.11** (frozen-lockfile) | Package manager |

---

## Linting & Code Quality

| Công nghệ | Vai trò |
|---|---|
| **ESLint 9** (flat config) + typescript-eslint | Linting |
| **@next/eslint-plugin-next** | Next.js rules |
| **TypeScript strict mode** + `tsc --noEmit` | Type checking |
| **File size limits** | 150 lines (components), 250 (actions/services), 200 (collections) |

---

## Monitoring

| Công nghệ | Vai trò |
|---|---|
| **Sentry** | Error tracking (env đã config `SENTRY_DSN`, chưa tích hợp package) |

---

## Validation (3-Tier)

| Tầng | Công nghệ | Vị trí |
|---|---|---|
| **UI** | react-hook-form + Zod resolver | Form component |
| **Server Action** | Zod `.safeParse()` | `src/app/actions/submit-booking.ts` |
| **Database** | Payload hooks (min/max/unique) | Collection configs |

---

## Tổng hợp Packages

| Category | Package | Version |
|---|---|---|
| **Framework** | `next` | ^15.4.11 |
| **React** | `react`, `react-dom` | ^19.1.0 |
| **CMS** | `payload` | ^3.84.1 |
| **CMS-Next** | `@payloadcms/next` | ^3.84.1 |
| **CMS-DB** | `@payloadcms/db-postgres` | ^3.84.1 |
| **CMS-Editor** | `@payloadcms/richtext-lexical` | ^3.84.1 |
| **CMS-Storage** | `@payloadcms/storage-s3` | 3.84.1 |
| **Auth** | `@clerk/nextjs` | ^7.4.1 |
| **Queue** | `@upstash/qstash` | ^2.11.0 |
| **Email** | Resend (env only) | — |
| **Forms** | `react-hook-form`, `@hookform/resolvers` | ^7.56.4 / ^5.0.1 |
| **Validation** | `zod` | ^3.24.4 |
| **Icons** | `lucide-react` | ^1.16.0 |
| **UI** | `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` | 1.2.4 / 0.7.1 / 2.1.1 / 3.6.0 |
| **Image Processing** | `sharp` | ^0.34.5 |
| **CSS** | `tailwindcss`, `postcss`, `autoprefixer` | ^3.4.17 / ^8.5.3 / ^10.4.21 |
| **Storage** | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | ^3.1053.0 |
| **Testing** | `vitest`, `@testing-library/react` | ^3.1.4 / ^16.3.0 |
| **TypeScript** | `typescript`, `typescript-eslint` | ^5.8.3 / ^8.32.1 |
| **Linting** | `eslint`, `eslint-config-next`, `@eslint/js`, `@next/eslint-plugin-next` | ^9.27.0 / ^15.3.2 |
| **Tooling** | `tsx` | ^4.19.4 |
| **Package Manager** | `pnpm` | 10.11.0 |
