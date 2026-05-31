import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "ota_enabled" SET DEFAULT false;
    ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_home_enabled" SET DEFAULT false;
    ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_destination_enabled" SET DEFAULT false;
    ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_tour_enabled" SET DEFAULT false;

    UPDATE "site_settings"
    SET
      "ota_enabled" = false,
      "ota_placements_home_enabled" = false,
      "ota_placements_destination_enabled" = false,
      "ota_placements_tour_enabled" = false;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ALTER COLUMN "ota_enabled" SET DEFAULT true;
    ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_home_enabled" SET DEFAULT true;
    ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_destination_enabled" SET DEFAULT true;
    ALTER TABLE "site_settings" ALTER COLUMN "ota_placements_tour_enabled" SET DEFAULT true;
  `);
}
