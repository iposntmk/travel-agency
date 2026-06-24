import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cruises_status" AS ENUM('active', 'seasonal', 'sold-out', 'paused');
  CREATE TABLE "cruises_cabin_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"max_pax" numeric
  );
  
  CREATE TABLE "cruises_itinerary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"activity" jsonb
  );
  
  CREATE TABLE "cruises" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" jsonb,
  	"featured_image_id" integer,
  	"destination_id" integer NOT NULL,
  	"nights" numeric,
  	"duration_text" varchar,
  	"route_summary" varchar,
  	"price_from" numeric,
  	"currency" varchar DEFAULT 'USD',
  	"rating_average" numeric DEFAULT 0,
  	"rating_count" numeric DEFAULT 0,
  	"is_featured" boolean DEFAULT false,
  	"sort_weight" numeric DEFAULT 0,
  	"status" "enum_cruises_status" DEFAULT 'active' NOT NULL,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cruises_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "messenger" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_search_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_search_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_search_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_search_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_action_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_action_href" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cruises_id" integer;
  ALTER TABLE "cruises_cabin_types" ADD CONSTRAINT "cruises_cabin_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cruises_itinerary" ADD CONSTRAINT "cruises_itinerary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cruises" ADD CONSTRAINT "cruises_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cruises" ADD CONSTRAINT "cruises_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cruises" ADD CONSTRAINT "cruises_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cruises_rels" ADD CONSTRAINT "cruises_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cruises_rels" ADD CONSTRAINT "cruises_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cruises_cabin_types_order_idx" ON "cruises_cabin_types" USING btree ("_order");
  CREATE INDEX "cruises_cabin_types_parent_id_idx" ON "cruises_cabin_types" USING btree ("_parent_id");
  CREATE INDEX "cruises_itinerary_order_idx" ON "cruises_itinerary" USING btree ("_order");
  CREATE INDEX "cruises_itinerary_parent_id_idx" ON "cruises_itinerary" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cruises_slug_idx" ON "cruises" USING btree ("slug");
  CREATE INDEX "cruises_featured_image_idx" ON "cruises" USING btree ("featured_image_id");
  CREATE INDEX "cruises_destination_idx" ON "cruises" USING btree ("destination_id");
  CREATE INDEX "cruises_nights_idx" ON "cruises" USING btree ("nights");
  CREATE INDEX "cruises_price_from_idx" ON "cruises" USING btree ("price_from");
  CREATE INDEX "cruises_rating_average_idx" ON "cruises" USING btree ("rating_average");
  CREATE INDEX "cruises_is_featured_idx" ON "cruises" USING btree ("is_featured");
  CREATE INDEX "cruises_sort_weight_idx" ON "cruises" USING btree ("sort_weight");
  CREATE INDEX "cruises_status_idx" ON "cruises" USING btree ("status");
  CREATE INDEX "cruises_seo_seo_og_image_idx" ON "cruises" USING btree ("seo_og_image_id");
  CREATE INDEX "cruises_updated_at_idx" ON "cruises" USING btree ("updated_at");
  CREATE INDEX "cruises_created_at_idx" ON "cruises" USING btree ("created_at");
  CREATE INDEX "cruises_rels_order_idx" ON "cruises_rels" USING btree ("order");
  CREATE INDEX "cruises_rels_parent_idx" ON "cruises_rels" USING btree ("parent_id");
  CREATE INDEX "cruises_rels_path_idx" ON "cruises_rels" USING btree ("path");
  CREATE INDEX "cruises_rels_media_id_idx" ON "cruises_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cruises_fk" FOREIGN KEY ("cruises_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_cruises_id_idx" ON "payload_locked_documents_rels" USING btree ("cruises_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cruises_cabin_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cruises_itinerary" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cruises" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cruises_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cruises_cabin_types" CASCADE;
  DROP TABLE "cruises_itinerary" CASCADE;
  DROP TABLE "cruises" CASCADE;
  DROP TABLE "cruises_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cruises_fk";
  
  DROP INDEX "payload_locked_documents_rels_cruises_id_idx";
  ALTER TABLE "site_settings" DROP COLUMN "messenger";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_search_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_search_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_search_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_search_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_action_href";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_action_href";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cruises_id";
  DROP TYPE "public"."enum_cruises_status";`)
}
