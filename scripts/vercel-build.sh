#!/usr/bin/env bash
set -euo pipefail

# Vercel build entrypoint. Payload migrations run against the shared Neon
# database, so only apply them on production builds — preview/development
# builds do not have (and must not touch) the production database.
if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "[vercel-build] VERCEL_ENV=production → running payload migrations"
  pnpm payload:migrate
else
  echo "[vercel-build] VERCEL_ENV=${VERCEL_ENV:-unset} → skipping migrations"
fi

pnpm build
