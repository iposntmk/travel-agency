import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// NOTE: This migration was hand-edited after `payload migrate:create`.
// The auto-generated version dropped every localized base column WITHOUT copying
// existing data into the new *_locales tables, and added `_locale NOT NULL`
// columns to populated array tables (which Postgres rejects). Both would have
// wiped/blocked production content. The edits below:
//   1. add the array `_locale` column with a temporary DEFAULT 'en' so existing
//      rows backfill, then drop the default to match the Payload schema;
//   2. copy each base table's existing values into its *_locales table as the
//      `en` locale BEFORE dropping the old columns.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // --- 1. Schema: enum, locale tables, indexes, FKs ---
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fr', 'es', 'de', 'it', 'pt', 'zh-Hans', 'zh-Hant');
  CREATE TABLE "product_categories_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "attractions_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"summary" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "destinations_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" jsonb,
  	"summary" varchar,
  	"best_time_to_visit" varchar,
  	"hub_intro" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "tours_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" jsonb,
  	"duration_text" varchar,
  	"route_summary" varchar,
  	"start_end" varchar,
  	"travel_style" varchar,
  	"guide_languages" varchar,
  	"highlight_intro" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "cruises_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" jsonb,
  	"duration_text" varchar,
  	"route_summary" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "car_rentals_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"route_from" varchar NOT NULL,
  	"route_to" varchar NOT NULL,
  	"duration_text" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "posts_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "site_settings_social_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "site_settings_locales" (
  	"footer_legal_text" varchar,
  	"footer_address" varchar,
  	"trust_summary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "navigation_items_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

  DROP INDEX "product_categories_slug_idx";
  DROP INDEX "attractions_slug_idx";
  DROP INDEX "destinations_slug_idx";
  DROP INDEX "tours_slug_idx";
  DROP INDEX "cruises_slug_idx";
  DROP INDEX "car_rentals_slug_idx";
  DROP INDEX "car_rentals_route_from_idx";
  DROP INDEX "car_rentals_route_to_idx";
  DROP INDEX "posts_slug_idx";
  ALTER TABLE "tours_highlights" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "tours_inclusions" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "tours_exclusions" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "tours_itinerary_included" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "tours_itinerary" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "tours_faqs" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "cruises_cabin_types" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "cruises_itinerary" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "posts_tags" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
  ALTER TABLE "product_categories_locales" ADD CONSTRAINT "product_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "attractions_locales" ADD CONSTRAINT "attractions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_locales" ADD CONSTRAINT "destinations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours_locales" ADD CONSTRAINT "tours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cruises_locales" ADD CONSTRAINT "cruises_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "car_rentals_locales" ADD CONSTRAINT "car_rentals_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."car_rentals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_locales" ADD CONSTRAINT "site_settings_social_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_social"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_children_locales" ADD CONSTRAINT "navigation_items_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_locales" ADD CONSTRAINT "navigation_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "product_categories_slug_idx" ON "product_categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "product_categories_locales_locale_parent_id_unique" ON "product_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "attractions_slug_idx" ON "attractions_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "attractions_locales_locale_parent_id_unique" ON "attractions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "destinations_slug_idx" ON "destinations_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "destinations_locales_locale_parent_id_unique" ON "destinations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tours_slug_idx" ON "tours_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "tours_locales_locale_parent_id_unique" ON "tours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cruises_slug_idx" ON "cruises_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "cruises_locales_locale_parent_id_unique" ON "cruises_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "car_rentals_slug_idx" ON "car_rentals_locales" USING btree ("slug","_locale");
  CREATE INDEX "car_rentals_route_from_idx" ON "car_rentals_locales" USING btree ("route_from","_locale");
  CREATE INDEX "car_rentals_route_to_idx" ON "car_rentals_locales" USING btree ("route_to","_locale");
  CREATE UNIQUE INDEX "car_rentals_locales_locale_parent_id_unique" ON "car_rentals_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_settings_social_locales_locale_parent_id_unique" ON "site_settings_social_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_items_children_locales_locale_parent_id_unique" ON "navigation_items_children_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_items_locales_locale_parent_id_unique" ON "navigation_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tours_highlights_locale_idx" ON "tours_highlights" USING btree ("_locale");
  CREATE INDEX "tours_inclusions_locale_idx" ON "tours_inclusions" USING btree ("_locale");
  CREATE INDEX "tours_exclusions_locale_idx" ON "tours_exclusions" USING btree ("_locale");
  CREATE INDEX "tours_itinerary_included_locale_idx" ON "tours_itinerary_included" USING btree ("_locale");
  CREATE INDEX "tours_itinerary_locale_idx" ON "tours_itinerary" USING btree ("_locale");
  CREATE INDEX "tours_faqs_locale_idx" ON "tours_faqs" USING btree ("_locale");
  CREATE INDEX "cruises_cabin_types_locale_idx" ON "cruises_cabin_types" USING btree ("_locale");
  CREATE INDEX "cruises_itinerary_locale_idx" ON "cruises_itinerary" USING btree ("_locale");
  CREATE INDEX "posts_tags_locale_idx" ON "posts_tags" USING btree ("_locale");`)

  // --- 2. Copy existing base-table values into the `en` locale rows ---
  await db.execute(sql`
  INSERT INTO "product_categories_locales" ("title","slug","_locale","_parent_id")
    SELECT "title","slug",'en',"id" FROM "product_categories";
  INSERT INTO "attractions_locales" ("title","slug","summary","seo_meta_title","seo_meta_description","_locale","_parent_id")
    SELECT "title","slug","summary","seo_meta_title","seo_meta_description",'en',"id" FROM "attractions";
  INSERT INTO "destinations_locales" ("title","slug","description","summary","best_time_to_visit","hub_intro","seo_meta_title","seo_meta_description","_locale","_parent_id")
    SELECT "title","slug","description","summary","best_time_to_visit","hub_intro","seo_meta_title","seo_meta_description",'en',"id" FROM "destinations";
  INSERT INTO "tours_locales" ("title","slug","description","duration_text","route_summary","start_end","travel_style","guide_languages","highlight_intro","seo_meta_title","seo_meta_description","_locale","_parent_id")
    SELECT "title","slug","description","duration_text","route_summary","start_end","travel_style","guide_languages","highlight_intro","seo_meta_title","seo_meta_description",'en',"id" FROM "tours";
  INSERT INTO "cruises_locales" ("title","slug","description","duration_text","route_summary","seo_meta_title","seo_meta_description","_locale","_parent_id")
    SELECT "title","slug","description","duration_text","route_summary","seo_meta_title","seo_meta_description",'en',"id" FROM "cruises";
  INSERT INTO "car_rentals_locales" ("title","slug","route_from","route_to","duration_text","seo_meta_title","seo_meta_description","_locale","_parent_id")
    SELECT "title","slug","route_from","route_to","duration_text","seo_meta_title","seo_meta_description",'en',"id" FROM "car_rentals";
  INSERT INTO "posts_locales" ("title","slug","content","seo_meta_title","seo_meta_description","seo_keywords","_locale","_parent_id")
    SELECT "title","slug","content","seo_meta_title","seo_meta_description","seo_keywords",'en',"id" FROM "posts";
  INSERT INTO "site_settings_social_locales" ("label","_locale","_parent_id")
    SELECT "label",'en',"id" FROM "site_settings_social";
  INSERT INTO "site_settings_locales" ("footer_legal_text","footer_address","trust_summary","_locale","_parent_id")
    SELECT "footer_legal_text","footer_address","trust_summary",'en',"id" FROM "site_settings";
  INSERT INTO "navigation_items_children_locales" ("label","_locale","_parent_id")
    SELECT "label",'en',"id" FROM "navigation_items_children";
  INSERT INTO "navigation_items_locales" ("label","_locale","_parent_id")
    SELECT "label",'en',"id" FROM "navigation_items";`)

  // --- 3. Drop the now-migrated base columns + the temporary array defaults ---
  await db.execute(sql`
  ALTER TABLE "product_categories" DROP COLUMN "title";
  ALTER TABLE "product_categories" DROP COLUMN "slug";
  ALTER TABLE "attractions" DROP COLUMN "title";
  ALTER TABLE "attractions" DROP COLUMN "slug";
  ALTER TABLE "attractions" DROP COLUMN "summary";
  ALTER TABLE "attractions" DROP COLUMN "seo_meta_title";
  ALTER TABLE "attractions" DROP COLUMN "seo_meta_description";
  ALTER TABLE "destinations" DROP COLUMN "title";
  ALTER TABLE "destinations" DROP COLUMN "slug";
  ALTER TABLE "destinations" DROP COLUMN "description";
  ALTER TABLE "destinations" DROP COLUMN "summary";
  ALTER TABLE "destinations" DROP COLUMN "best_time_to_visit";
  ALTER TABLE "destinations" DROP COLUMN "hub_intro";
  ALTER TABLE "destinations" DROP COLUMN "seo_meta_title";
  ALTER TABLE "destinations" DROP COLUMN "seo_meta_description";
  ALTER TABLE "tours" DROP COLUMN "title";
  ALTER TABLE "tours" DROP COLUMN "slug";
  ALTER TABLE "tours" DROP COLUMN "description";
  ALTER TABLE "tours" DROP COLUMN "duration_text";
  ALTER TABLE "tours" DROP COLUMN "route_summary";
  ALTER TABLE "tours" DROP COLUMN "start_end";
  ALTER TABLE "tours" DROP COLUMN "travel_style";
  ALTER TABLE "tours" DROP COLUMN "guide_languages";
  ALTER TABLE "tours" DROP COLUMN "highlight_intro";
  ALTER TABLE "tours" DROP COLUMN "seo_meta_title";
  ALTER TABLE "tours" DROP COLUMN "seo_meta_description";
  ALTER TABLE "cruises" DROP COLUMN "title";
  ALTER TABLE "cruises" DROP COLUMN "slug";
  ALTER TABLE "cruises" DROP COLUMN "description";
  ALTER TABLE "cruises" DROP COLUMN "duration_text";
  ALTER TABLE "cruises" DROP COLUMN "route_summary";
  ALTER TABLE "cruises" DROP COLUMN "seo_meta_title";
  ALTER TABLE "cruises" DROP COLUMN "seo_meta_description";
  ALTER TABLE "car_rentals" DROP COLUMN "title";
  ALTER TABLE "car_rentals" DROP COLUMN "slug";
  ALTER TABLE "car_rentals" DROP COLUMN "route_from";
  ALTER TABLE "car_rentals" DROP COLUMN "route_to";
  ALTER TABLE "car_rentals" DROP COLUMN "duration_text";
  ALTER TABLE "car_rentals" DROP COLUMN "seo_meta_title";
  ALTER TABLE "car_rentals" DROP COLUMN "seo_meta_description";
  ALTER TABLE "posts" DROP COLUMN "title";
  ALTER TABLE "posts" DROP COLUMN "slug";
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "posts" DROP COLUMN "seo_meta_title";
  ALTER TABLE "posts" DROP COLUMN "seo_meta_description";
  ALTER TABLE "posts" DROP COLUMN "seo_keywords";
  ALTER TABLE "site_settings_social" DROP COLUMN "label";
  ALTER TABLE "site_settings" DROP COLUMN "footer_legal_text";
  ALTER TABLE "site_settings" DROP COLUMN "footer_address";
  ALTER TABLE "site_settings" DROP COLUMN "trust_summary";
  ALTER TABLE "navigation_items_children" DROP COLUMN "label";
  ALTER TABLE "navigation_items" DROP COLUMN "label";
  ALTER TABLE "tours_highlights" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "tours_inclusions" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "tours_exclusions" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "tours_itinerary_included" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "tours_itinerary" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "tours_faqs" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "cruises_cabin_types" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "cruises_itinerary" ALTER COLUMN "_locale" DROP DEFAULT;
  ALTER TABLE "posts_tags" ALTER COLUMN "_locale" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Re-add base columns (nullable first), copy the `en` locale data back, then
  // restore NOT NULL + indexes, and finally drop the locale tables.
  await db.execute(sql`
  ALTER TABLE "product_categories" ADD COLUMN "title" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "slug" varchar;
  ALTER TABLE "attractions" ADD COLUMN "title" varchar;
  ALTER TABLE "attractions" ADD COLUMN "slug" varchar;
  ALTER TABLE "attractions" ADD COLUMN "summary" varchar;
  ALTER TABLE "attractions" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "attractions" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "destinations" ADD COLUMN "title" varchar;
  ALTER TABLE "destinations" ADD COLUMN "slug" varchar;
  ALTER TABLE "destinations" ADD COLUMN "description" jsonb;
  ALTER TABLE "destinations" ADD COLUMN "summary" varchar;
  ALTER TABLE "destinations" ADD COLUMN "best_time_to_visit" varchar;
  ALTER TABLE "destinations" ADD COLUMN "hub_intro" jsonb;
  ALTER TABLE "destinations" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "destinations" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "tours" ADD COLUMN "title" varchar;
  ALTER TABLE "tours" ADD COLUMN "slug" varchar;
  ALTER TABLE "tours" ADD COLUMN "description" jsonb;
  ALTER TABLE "tours" ADD COLUMN "duration_text" varchar;
  ALTER TABLE "tours" ADD COLUMN "route_summary" varchar;
  ALTER TABLE "tours" ADD COLUMN "start_end" varchar;
  ALTER TABLE "tours" ADD COLUMN "travel_style" varchar;
  ALTER TABLE "tours" ADD COLUMN "guide_languages" varchar;
  ALTER TABLE "tours" ADD COLUMN "highlight_intro" varchar;
  ALTER TABLE "tours" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "tours" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "cruises" ADD COLUMN "title" varchar;
  ALTER TABLE "cruises" ADD COLUMN "slug" varchar;
  ALTER TABLE "cruises" ADD COLUMN "description" jsonb;
  ALTER TABLE "cruises" ADD COLUMN "duration_text" varchar;
  ALTER TABLE "cruises" ADD COLUMN "route_summary" varchar;
  ALTER TABLE "cruises" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "cruises" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "title" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "slug" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "route_from" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "route_to" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "duration_text" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "title" varchar;
  ALTER TABLE "posts" ADD COLUMN "slug" varchar;
  ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "posts" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_keywords" varchar;
  ALTER TABLE "site_settings_social" ADD COLUMN "label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "footer_legal_text" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "footer_address" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "trust_summary" varchar;
  ALTER TABLE "navigation_items_children" ADD COLUMN "label" varchar;
  ALTER TABLE "navigation_items" ADD COLUMN "label" varchar;`)

  await db.execute(sql`
  UPDATE "product_categories" b SET "title" = l."title", "slug" = l."slug" FROM "product_categories_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "attractions" b SET "title" = l."title", "slug" = l."slug", "summary" = l."summary", "seo_meta_title" = l."seo_meta_title", "seo_meta_description" = l."seo_meta_description" FROM "attractions_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "destinations" b SET "title" = l."title", "slug" = l."slug", "description" = l."description", "summary" = l."summary", "best_time_to_visit" = l."best_time_to_visit", "hub_intro" = l."hub_intro", "seo_meta_title" = l."seo_meta_title", "seo_meta_description" = l."seo_meta_description" FROM "destinations_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "tours" b SET "title" = l."title", "slug" = l."slug", "description" = l."description", "duration_text" = l."duration_text", "route_summary" = l."route_summary", "start_end" = l."start_end", "travel_style" = l."travel_style", "guide_languages" = l."guide_languages", "highlight_intro" = l."highlight_intro", "seo_meta_title" = l."seo_meta_title", "seo_meta_description" = l."seo_meta_description" FROM "tours_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "cruises" b SET "title" = l."title", "slug" = l."slug", "description" = l."description", "duration_text" = l."duration_text", "route_summary" = l."route_summary", "seo_meta_title" = l."seo_meta_title", "seo_meta_description" = l."seo_meta_description" FROM "cruises_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "car_rentals" b SET "title" = l."title", "slug" = l."slug", "route_from" = l."route_from", "route_to" = l."route_to", "duration_text" = l."duration_text", "seo_meta_title" = l."seo_meta_title", "seo_meta_description" = l."seo_meta_description" FROM "car_rentals_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "posts" b SET "title" = l."title", "slug" = l."slug", "content" = l."content", "seo_meta_title" = l."seo_meta_title", "seo_meta_description" = l."seo_meta_description", "seo_keywords" = l."seo_keywords" FROM "posts_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "site_settings_social" b SET "label" = l."label" FROM "site_settings_social_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "site_settings" b SET "footer_legal_text" = l."footer_legal_text", "footer_address" = l."footer_address", "trust_summary" = l."trust_summary" FROM "site_settings_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "navigation_items_children" b SET "label" = l."label" FROM "navigation_items_children_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "navigation_items" b SET "label" = l."label" FROM "navigation_items_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';`)

  await db.execute(sql`
  ALTER TABLE "product_categories" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "product_categories" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "attractions" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "attractions" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "destinations" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "destinations" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "tours" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "tours" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "cruises" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "cruises" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "car_rentals" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "car_rentals" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "car_rentals" ALTER COLUMN "route_from" SET NOT NULL;
  ALTER TABLE "car_rentals" ALTER COLUMN "route_to" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "posts" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "navigation_items_children" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "navigation_items" ALTER COLUMN "label" SET NOT NULL;`)

  await db.execute(sql`
   ALTER TABLE "product_categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "attractions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destinations_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tours_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cruises_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "car_rentals_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_social_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_items_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "product_categories_locales" CASCADE;
  DROP TABLE "attractions_locales" CASCADE;
  DROP TABLE "destinations_locales" CASCADE;
  DROP TABLE "tours_locales" CASCADE;
  DROP TABLE "cruises_locales" CASCADE;
  DROP TABLE "car_rentals_locales" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "site_settings_social_locales" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "navigation_items_children_locales" CASCADE;
  DROP TABLE "navigation_items_locales" CASCADE;
  DROP INDEX "tours_highlights_locale_idx";
  DROP INDEX "tours_inclusions_locale_idx";
  DROP INDEX "tours_exclusions_locale_idx";
  DROP INDEX "tours_itinerary_included_locale_idx";
  DROP INDEX "tours_itinerary_locale_idx";
  DROP INDEX "tours_faqs_locale_idx";
  DROP INDEX "cruises_cabin_types_locale_idx";
  DROP INDEX "cruises_itinerary_locale_idx";
  DROP INDEX "posts_tags_locale_idx";
  CREATE UNIQUE INDEX "product_categories_slug_idx" ON "product_categories" USING btree ("slug");
  CREATE UNIQUE INDEX "attractions_slug_idx" ON "attractions" USING btree ("slug");
  CREATE UNIQUE INDEX "destinations_slug_idx" ON "destinations" USING btree ("slug");
  CREATE UNIQUE INDEX "tours_slug_idx" ON "tours" USING btree ("slug");
  CREATE UNIQUE INDEX "cruises_slug_idx" ON "cruises" USING btree ("slug");
  CREATE UNIQUE INDEX "car_rentals_slug_idx" ON "car_rentals" USING btree ("slug");
  CREATE INDEX "car_rentals_route_from_idx" ON "car_rentals" USING btree ("route_from");
  CREATE INDEX "car_rentals_route_to_idx" ON "car_rentals" USING btree ("route_to");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  ALTER TABLE "tours_highlights" DROP COLUMN "_locale";
  ALTER TABLE "tours_inclusions" DROP COLUMN "_locale";
  ALTER TABLE "tours_exclusions" DROP COLUMN "_locale";
  ALTER TABLE "tours_itinerary_included" DROP COLUMN "_locale";
  ALTER TABLE "tours_itinerary" DROP COLUMN "_locale";
  ALTER TABLE "tours_faqs" DROP COLUMN "_locale";
  ALTER TABLE "cruises_cabin_types" DROP COLUMN "_locale";
  ALTER TABLE "cruises_itinerary" DROP COLUMN "_locale";
  ALTER TABLE "posts_tags" DROP COLUMN "_locale";
  DROP TYPE "public"."_locales";`)
}
