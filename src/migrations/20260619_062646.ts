import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "ota_enabled" SET DEFAULT false;
  ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_home_enabled" SET DEFAULT false;
  ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_destination_enabled" SET DEFAULT false;
  ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_tour_enabled" SET DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "ota_enabled" SET DEFAULT true;
  ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_home_enabled" SET DEFAULT true;
  ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_destination_enabled" SET DEFAULT true;
  ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_tour_enabled" SET DEFAULT true;`)
}
