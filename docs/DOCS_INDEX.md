# Documentation Index

Repository hiện có ứng dụng Next.js 15 + Payload CMS đang hoạt động. Đọc `CURRENT_STATUS.md` trước khi chọn task mới.

## Nguồn chính

- `PURPOSE.md`: north star, audience, success criteria, non-goals.
- `PROJECT_BRIEF.md`: business overview, MVP scope, stack summary.
- `TECH_STACK.md`: quyết định công nghệ chính thức.
- `DEVELOPMENT_APPROACH.md`: roadmap layer-based và exit criteria.
- `DATABASE_SCHEMA.md`: Payload collections, fields, access control, migrations.
- `CODING_GUIDELINES.md`: architecture guardrails, source layout, code rules.
- `TESTING_STRATEGY.md`: test plan theo layer và priority cases.
- `EXTENSION_GUIDE.md`: cách mở rộng payment, OTA, language, market, add-ons.
- `CURRENT_STATUS.md`: handoff hiện tại, việc đã land, production follow-up còn lại.
- `docs/toiuu.md`: backlog hiệu suất, SEO, security, media, production readiness.

## Product & operations

- `FEATURE_LIST.md`: catalog tính năng tổng.
- `BOOKING_FLOW.md`: customer journey, status flow, metrics.
- `BOOK_NOW_PAY_LATER.md`: chính sách pay later.
- `FREE_TOUR_STRATEGY.md`: free tour lead generation.
- `TOUR_OPERATION_MODEL.md`: self-operated/partner/hybrid logic.
- `ADD_ON_SERVICES.md`: spa/dental/wellness affiliate.
- `OTA_INTEGRATIONS.md`: OTA affiliate/widgets.
- `SOCIAL_MEDIA_INTEGRATION.md`: share, login, embed, consent.
- `MEDIA_STRATEGY.md`: R2 + Sharp + QStash media pipeline.
- `MARKET_SEASONALITY.md`: thị trường và mùa cao điểm.
- `RISKS_AND_MITIGATIONS.md`: rủi ro vận hành/kỹ thuật.

## Setup & deployment

- `DEVELOPMENT_SETUP.md`: local setup, env, required scripts.
- `DEPLOYMENT_GUIDE.md`: production env and deploy rules.
- `../agents.md` (repo root): cross-agent read/write protocol + repository guidance for all coding agents (Claude Code, Codex, Gemini, Grok, opencode).
- `../CLAUDE.md` (repo root): Claude Code-specific working context + guardrails.

> Các bản phân tích/proposal nháp ban đầu (`Phan_tich.md`, `proposal.md`, `gemini-code-*.md`) đã được xoá khỏi repo (superseded bởi app đang chạy + các nguồn chính ở trên); xem git history nếu cần tham khảo. Khi có xung đột, nguồn chính (git docs + code) thắng — chi tiết ở root `agents.md`.
