import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "author" varchar;
   ALTER TABLE "posts" ADD COLUMN "view_count" numeric DEFAULT 0;
   ALTER TABLE "posts" ADD COLUMN "update_count" numeric DEFAULT 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "author";
   ALTER TABLE "posts" DROP COLUMN "view_count";
   ALTER TABLE "posts" DROP COLUMN "update_count";`)
}
