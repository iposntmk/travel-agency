import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_search_form_tabs_target" AS ENUM('tours', 'cruises');
  CREATE TABLE "site_settings_search_form_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"target" "enum_site_settings_search_form_tabs_target" DEFAULT 'tours' NOT NULL
  );
  
  CREATE TABLE "site_settings_search_form_tour_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_search_form_tour_durations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_search_form_cruise_nights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_search_form_styles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings_search_form_tabs" ADD CONSTRAINT "site_settings_search_form_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_search_form_tour_types" ADD CONSTRAINT "site_settings_search_form_tour_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_search_form_tour_durations" ADD CONSTRAINT "site_settings_search_form_tour_durations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_search_form_cruise_nights" ADD CONSTRAINT "site_settings_search_form_cruise_nights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_search_form_styles" ADD CONSTRAINT "site_settings_search_form_styles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_search_form_tabs_order_idx" ON "site_settings_search_form_tabs" USING btree ("_order");
  CREATE INDEX "site_settings_search_form_tabs_parent_id_idx" ON "site_settings_search_form_tabs" USING btree ("_parent_id");
  CREATE INDEX "site_settings_search_form_tour_types_order_idx" ON "site_settings_search_form_tour_types" USING btree ("_order");
  CREATE INDEX "site_settings_search_form_tour_types_parent_id_idx" ON "site_settings_search_form_tour_types" USING btree ("_parent_id");
  CREATE INDEX "site_settings_search_form_tour_durations_order_idx" ON "site_settings_search_form_tour_durations" USING btree ("_order");
  CREATE INDEX "site_settings_search_form_tour_durations_parent_id_idx" ON "site_settings_search_form_tour_durations" USING btree ("_parent_id");
  CREATE INDEX "site_settings_search_form_cruise_nights_order_idx" ON "site_settings_search_form_cruise_nights" USING btree ("_order");
  CREATE INDEX "site_settings_search_form_cruise_nights_parent_id_idx" ON "site_settings_search_form_cruise_nights" USING btree ("_parent_id");
  CREATE INDEX "site_settings_search_form_styles_order_idx" ON "site_settings_search_form_styles" USING btree ("_order");
  CREATE INDEX "site_settings_search_form_styles_parent_id_idx" ON "site_settings_search_form_styles" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_search_form_tabs" CASCADE;
  DROP TABLE "site_settings_search_form_tour_types" CASCADE;
  DROP TABLE "site_settings_search_form_tour_durations" CASCADE;
  DROP TABLE "site_settings_search_form_cruise_nights" CASCADE;
  DROP TABLE "site_settings_search_form_styles" CASCADE;
  DROP TYPE "public"."enum_site_settings_search_form_tabs_target";`)
}
