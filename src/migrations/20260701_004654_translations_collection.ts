import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_translations_group" AS ENUM('nav', 'booking', 'common', 'footer', 'newsletter', 'consent', 'actions', 'search', 'languageSwitcher', 'misc');
  CREATE TABLE "translations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"group" "enum_translations_group",
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "translations_locales" (
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "translations_id" integer;
  ALTER TABLE "translations_locales" ADD CONSTRAINT "translations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "translations_key_idx" ON "translations" USING btree ("key");
  CREATE INDEX "translations_group_idx" ON "translations" USING btree ("group");
  CREATE INDEX "translations_updated_at_idx" ON "translations" USING btree ("updated_at");
  CREATE INDEX "translations_created_at_idx" ON "translations" USING btree ("created_at");
  CREATE UNIQUE INDEX "translations_locales_locale_parent_id_unique" ON "translations_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_translations_fk" FOREIGN KEY ("translations_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_translations_id_idx" ON "payload_locked_documents_rels" USING btree ("translations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "translations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "translations_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "translations" CASCADE;
  DROP TABLE "translations_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_translations_fk";
  
  DROP INDEX "payload_locked_documents_rels_translations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "translations_id";
  DROP TYPE "public"."enum_translations_group";`)
}
