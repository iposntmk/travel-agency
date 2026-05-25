import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "caption" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "variants" jsonb;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "processing_error" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN IF EXISTS "processing_error";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "variants";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "caption";
  `);
}
