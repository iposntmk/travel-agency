import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE INDEX "tours_operation_type_idx" ON "tours" USING btree ("operation_type");
  CREATE INDEX "tours_tour_type_idx" ON "tours" USING btree ("tour_type");
  CREATE INDEX "tours_season_idx" ON "tours" USING btree ("season");
  CREATE INDEX "tours_is_featured_in_season_idx" ON "tours" USING btree ("is_featured_in_season");
  CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status");
  CREATE INDEX "tours_price_from_idx" ON "tours" USING btree ("price_from");
  CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "tours_operation_type_idx";
  DROP INDEX "tours_tour_type_idx";
  DROP INDEX "tours_season_idx";
  DROP INDEX "tours_is_featured_in_season_idx";
  DROP INDEX "tours_status_idx";
  DROP INDEX "tours_price_from_idx";
  DROP INDEX "posts_status_idx";`)
}
