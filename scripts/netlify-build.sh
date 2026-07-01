#!/usr/bin/env bash
set -euo pipefail

# Netlify build entrypoint. Payload migrations run against the shared Neon
# database, so only apply them on production deploys — preview/branch builds
# do not have (and must not touch) the production database.
#
# Netlify exposes the deploy context via $CONTEXT:
#   production | deploy-preview | branch-deploy | dev
if [ "${CONTEXT:-}" = "production" ]; then
  echo "[netlify-build] CONTEXT=production → running payload migrations"
  pnpm payload:migrate
else
  echo "[netlify-build] CONTEXT=${CONTEXT:-unset} → skipping migrations"
fi

pnpm build
