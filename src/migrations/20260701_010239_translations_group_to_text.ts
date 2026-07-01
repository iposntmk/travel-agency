import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations" ALTER COLUMN "group" SET DATA TYPE varchar;
  DROP TYPE "public"."enum_translations_group";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_translations_group" AS ENUM('nav', 'booking', 'common', 'footer', 'newsletter', 'consent', 'actions', 'search', 'languageSwitcher', 'misc');
  ALTER TABLE "translations" ALTER COLUMN "group" SET DATA TYPE "public"."enum_translations_group" USING "group"::"public"."enum_translations_group";`)
}
