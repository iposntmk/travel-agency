import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_homepage_why_us_items_icon" AS ENUM('compass', 'shield', 'wallet', 'heart', 'sparkle');
  CREATE TYPE "public"."enum_site_settings_ota_providers_key" AS ENUM('getyourguide', 'viator', 'klook', 'civitatis', 'guruwalk');
  CREATE TYPE "public"."enum_site_settings_ota_placements_home_providers" AS ENUM('getyourguide', 'viator', 'klook', 'civitatis', 'guruwalk');
  CREATE TYPE "public"."enum_site_settings_ota_placements_destination_providers" AS ENUM('getyourguide', 'viator', 'klook', 'civitatis', 'guruwalk');
  CREATE TYPE "public"."enum_site_settings_ota_placements_tour_providers" AS ENUM('getyourguide', 'viator', 'klook', 'civitatis', 'guruwalk');
  CREATE TABLE "site_settings_homepage_hero_trust_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"hint" varchar
  );
  
  CREATE TABLE "site_settings_homepage_why_us_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_site_settings_homepage_why_us_items_icon" DEFAULT 'compass',
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_ota_providers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_site_settings_ota_providers_key" NOT NULL,
  	"label" varchar,
  	"url_template" varchar,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "site_settings_ota_placements_home_providers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_ota_placements_home_providers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_ota_placements_destination_providers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_ota_placements_destination_providers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_ota_placements_tour_providers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_ota_placements_tour_providers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_free_proposal_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_free_proposal_themes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_body" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_seasonal_banner_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_action_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_action_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_section_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_page_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_action_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_experiences_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_experiences_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_experiences_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_experiences_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_testimonials_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_action_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_why_us_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_why_us_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_why_us_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_why_us_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_newsletter_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_newsletter_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_newsletter_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ota_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_home_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_home_heading" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_home_blurb" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_destination_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_destination_heading" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_destination_blurb" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_tour_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_tour_heading" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ota_placements_tour_blurb" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "free_proposal_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "free_proposal_hero_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "free_proposal_hero_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "free_proposal_hero_subtitle" varchar;
  ALTER TABLE "site_settings_homepage_hero_trust_items" ADD CONSTRAINT "site_settings_homepage_hero_trust_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_homepage_why_us_items" ADD CONSTRAINT "site_settings_homepage_why_us_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_ota_providers" ADD CONSTRAINT "site_settings_ota_providers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_ota_placements_home_providers" ADD CONSTRAINT "site_settings_ota_placements_home_providers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_ota_placements_destination_providers" ADD CONSTRAINT "site_settings_ota_placements_destination_providers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_ota_placements_tour_providers" ADD CONSTRAINT "site_settings_ota_placements_tour_providers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_free_proposal_stages" ADD CONSTRAINT "site_settings_free_proposal_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_free_proposal_themes" ADD CONSTRAINT "site_settings_free_proposal_themes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_homepage_hero_trust_items_order_idx" ON "site_settings_homepage_hero_trust_items" USING btree ("_order");
  CREATE INDEX "site_settings_homepage_hero_trust_items_parent_id_idx" ON "site_settings_homepage_hero_trust_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_homepage_why_us_items_order_idx" ON "site_settings_homepage_why_us_items" USING btree ("_order");
  CREATE INDEX "site_settings_homepage_why_us_items_parent_id_idx" ON "site_settings_homepage_why_us_items" USING btree ("_parent_id");
  CREATE INDEX "site_settings_ota_providers_order_idx" ON "site_settings_ota_providers" USING btree ("_order");
  CREATE INDEX "site_settings_ota_providers_parent_id_idx" ON "site_settings_ota_providers" USING btree ("_parent_id");
  CREATE INDEX "site_settings_ota_placements_home_providers_order_idx" ON "site_settings_ota_placements_home_providers" USING btree ("order");
  CREATE INDEX "site_settings_ota_placements_home_providers_parent_idx" ON "site_settings_ota_placements_home_providers" USING btree ("parent_id");
  CREATE INDEX "site_settings_ota_placements_destination_providers_order_idx" ON "site_settings_ota_placements_destination_providers" USING btree ("order");
  CREATE INDEX "site_settings_ota_placements_destination_providers_parent_idx" ON "site_settings_ota_placements_destination_providers" USING btree ("parent_id");
  CREATE INDEX "site_settings_ota_placements_tour_providers_order_idx" ON "site_settings_ota_placements_tour_providers" USING btree ("order");
  CREATE INDEX "site_settings_ota_placements_tour_providers_parent_idx" ON "site_settings_ota_placements_tour_providers" USING btree ("parent_id");
  CREATE INDEX "site_settings_free_proposal_stages_order_idx" ON "site_settings_free_proposal_stages" USING btree ("_order");
  CREATE INDEX "site_settings_free_proposal_stages_parent_id_idx" ON "site_settings_free_proposal_stages" USING btree ("_parent_id");
  CREATE INDEX "site_settings_free_proposal_themes_order_idx" ON "site_settings_free_proposal_themes" USING btree ("_order");
  CREATE INDEX "site_settings_free_proposal_themes_parent_id_idx" ON "site_settings_free_proposal_themes" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_homepage_hero_trust_items" CASCADE;
  DROP TABLE "site_settings_homepage_why_us_items" CASCADE;
  DROP TABLE "site_settings_ota_providers" CASCADE;
  DROP TABLE "site_settings_ota_placements_home_providers" CASCADE;
  DROP TABLE "site_settings_ota_placements_destination_providers" CASCADE;
  DROP TABLE "site_settings_ota_placements_tour_providers" CASCADE;
  DROP TABLE "site_settings_free_proposal_stages" CASCADE;
  DROP TABLE "site_settings_free_proposal_themes" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_body";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_seasonal_banner_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_action_href";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_action_href";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_section_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_page_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_action_href";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_experiences_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_experiences_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_experiences_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_experiences_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_testimonials_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_action_href";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_why_us_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_why_us_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_why_us_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_why_us_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_newsletter_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_newsletter_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_newsletter_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "ota_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_home_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_home_heading";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_home_blurb";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_destination_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_destination_heading";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_destination_blurb";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_tour_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_tour_heading";
  ALTER TABLE "site_settings" DROP COLUMN "ota_placements_tour_blurb";
  ALTER TABLE "site_settings" DROP COLUMN "free_proposal_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "free_proposal_hero_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "free_proposal_hero_title";
  ALTER TABLE "site_settings" DROP COLUMN "free_proposal_hero_subtitle";
  DROP TYPE "public"."enum_site_settings_homepage_why_us_items_icon";
  DROP TYPE "public"."enum_site_settings_ota_providers_key";
  DROP TYPE "public"."enum_site_settings_ota_placements_home_providers";
  DROP TYPE "public"."enum_site_settings_ota_placements_destination_providers";
  DROP TYPE "public"."enum_site_settings_ota_placements_tour_providers";`)
}
