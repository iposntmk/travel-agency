import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_product_categories_type" AS ENUM('tour', 'car-rental', 'guide', 'shared');
  CREATE TYPE "public"."enum_car_rentals_vehicle_type" AS ENUM('sedan', 'suv', 'van', 'luxury', 'minibus');
  CREATE TYPE "public"."enum_car_rentals_status" AS ENUM('active', 'paused');
  CREATE TYPE "public"."enum_custom_inquiries_status" AS ENUM('new', 'contacted', 'quoted', 'closed', 'spam');
  CREATE TYPE "public"."enum_posts_guide_category" AS ENUM('eat', 'drink', 'do', 'shop', 'before-trip', 'service', 'general');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TABLE "product_categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "type" "enum_product_categories_type" DEFAULT 'shared' NOT NULL,
    "sort_weight" numeric DEFAULT 0,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "attractions" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "destination_id" integer NOT NULL,
    "summary" varchar,
    "featured_image_id" integer,
    "sort_weight" numeric DEFAULT 0,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_og_image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "attractions_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "product_categories_id" integer
  );

  CREATE TABLE "destinations_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "tours_id" integer,
    "car_rentals_id" integer,
    "posts_id" integer
  );

  CREATE TABLE "car_rentals" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "destination_id" integer NOT NULL,
    "route_from" varchar NOT NULL,
    "route_to" varchar NOT NULL,
    "vehicle_type" "enum_car_rentals_vehicle_type" NOT NULL,
    "duration_text" varchar,
    "price_from" numeric,
    "currency" varchar DEFAULT 'USD',
    "featured_image_id" integer,
    "partner_id" integer,
    "status" "enum_car_rentals_status" DEFAULT 'active' NOT NULL,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_og_image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "car_rentals_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "media_id" integer
  );

  CREATE TABLE "custom_inquiries_accommodation_levels" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar NOT NULL
  );

  CREATE TABLE "custom_inquiries_themes" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar NOT NULL
  );

  CREATE TABLE "custom_inquiries" (
    "id" serial PRIMARY KEY NOT NULL,
    "customer_id" integer,
    "customer_name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "phone" varchar,
    "nationality" varchar,
    "whatsapp_opt_in" boolean DEFAULT false,
    "planning_stage" varchar,
    "referral_source" varchar,
    "travel_companions" varchar,
    "occasion" varchar,
    "adults" numeric NOT NULL,
    "children" numeric DEFAULT 0,
    "exact_dates_known" boolean DEFAULT false,
    "departure_date" timestamp(3) with time zone,
    "return_date" timestamp(3) with time zone,
    "departure_month" varchar,
    "estimated_days" numeric,
    "accompaniment_type" varchar,
    "budget_per_person" numeric,
    "max_budget" numeric,
    "message" varchar,
    "source" varchar DEFAULT 'free-proposal',
    "status" "enum_custom_inquiries_status" DEFAULT 'new' NOT NULL,
    "internal_notes" varchar,
    "idempotency_key" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "custom_inquiries_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "destinations_id" integer
  );

  CREATE TABLE "team_members" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "role" varchar NOT NULL,
    "photo_id" integer,
    "quote" varchar,
    "sort_weight" numeric DEFAULT 0,
    "status" "enum_team_members_status" DEFAULT 'published',
    "is_published" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar DEFAULT 'Default' NOT NULL,
    "hotline" varchar,
    "whatsapp" varchar,
    "sales_email" varchar,
    "footer_company_name" varchar,
    "footer_legal_text" varchar,
    "footer_address" varchar,
    "trust_review_average" numeric,
    "trust_review_count" numeric,
    "trust_summary" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "destinations" ADD COLUMN "summary" varchar;
  ALTER TABLE "destinations" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "destinations" ADD COLUMN "best_time_to_visit" varchar;
  ALTER TABLE "destinations" ADD COLUMN "hub_intro" jsonb;
  ALTER TABLE "destinations" ADD COLUMN "sort_weight" numeric DEFAULT 0;
  ALTER TABLE "tours" ADD COLUMN "duration_days" numeric;
  ALTER TABLE "tours" ADD COLUMN "duration_text" varchar;
  ALTER TABLE "tours" ADD COLUMN "route_summary" varchar;
  ALTER TABLE "tours" ADD COLUMN "group_size_min" numeric;
  ALTER TABLE "tours" ADD COLUMN "group_size_max" numeric;
  ALTER TABLE "tours" ADD COLUMN "rating_average" numeric DEFAULT 0;
  ALTER TABLE "tours" ADD COLUMN "rating_count" numeric DEFAULT 0;
  ALTER TABLE "tours" ADD COLUMN "is_featured" boolean DEFAULT false;
  ALTER TABLE "tours" ADD COLUMN "sort_weight" numeric DEFAULT 0;
  ALTER TABLE "tours_rels" ADD COLUMN "product_categories_id" integer;
  ALTER TABLE "tours_rels" ADD COLUMN "attractions_id" integer;
  ALTER TABLE "posts" ADD COLUMN "guide_category" "enum_posts_guide_category" DEFAULT 'general';
  ALTER TABLE "posts" ADD COLUMN "sort_weight" numeric DEFAULT 0;
  ALTER TABLE "posts_rels" ADD COLUMN "attractions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "product_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "attractions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "car_rentals_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "custom_inquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_members_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_settings_id" integer;
  ALTER TABLE "attractions" ADD CONSTRAINT "attractions_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attractions" ADD CONSTRAINT "attractions_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attractions" ADD CONSTRAINT "attractions_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "attractions_rels" ADD CONSTRAINT "attractions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "attractions_rels" ADD CONSTRAINT "attractions_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_tours_fk" FOREIGN KEY ("tours_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_car_rentals_fk" FOREIGN KEY ("car_rentals_id") REFERENCES "public"."car_rentals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "car_rentals" ADD CONSTRAINT "car_rentals_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "car_rentals" ADD CONSTRAINT "car_rentals_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "car_rentals" ADD CONSTRAINT "car_rentals_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "car_rentals" ADD CONSTRAINT "car_rentals_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "car_rentals_rels" ADD CONSTRAINT "car_rentals_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."car_rentals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "car_rentals_rels" ADD CONSTRAINT "car_rentals_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "custom_inquiries_accommodation_levels" ADD CONSTRAINT "custom_inquiries_accommodation_levels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."custom_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "custom_inquiries_themes" ADD CONSTRAINT "custom_inquiries_themes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."custom_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "custom_inquiries" ADD CONSTRAINT "custom_inquiries_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "custom_inquiries_rels" ADD CONSTRAINT "custom_inquiries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."custom_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "custom_inquiries_rels" ADD CONSTRAINT "custom_inquiries_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "product_categories_slug_idx" ON "product_categories" USING btree ("slug");
  CREATE INDEX "product_categories_type_idx" ON "product_categories" USING btree ("type");
  CREATE INDEX "product_categories_sort_weight_idx" ON "product_categories" USING btree ("sort_weight");
  CREATE INDEX "product_categories_updated_at_idx" ON "product_categories" USING btree ("updated_at");
  CREATE INDEX "product_categories_created_at_idx" ON "product_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "attractions_slug_idx" ON "attractions" USING btree ("slug");
  CREATE INDEX "attractions_destination_idx" ON "attractions" USING btree ("destination_id");
  CREATE INDEX "attractions_featured_image_idx" ON "attractions" USING btree ("featured_image_id");
  CREATE INDEX "attractions_sort_weight_idx" ON "attractions" USING btree ("sort_weight");
  CREATE INDEX "attractions_seo_seo_og_image_idx" ON "attractions" USING btree ("seo_og_image_id");
  CREATE INDEX "attractions_updated_at_idx" ON "attractions" USING btree ("updated_at");
  CREATE INDEX "attractions_created_at_idx" ON "attractions" USING btree ("created_at");
  CREATE INDEX "attractions_rels_order_idx" ON "attractions_rels" USING btree ("order");
  CREATE INDEX "attractions_rels_parent_idx" ON "attractions_rels" USING btree ("parent_id");
  CREATE INDEX "attractions_rels_path_idx" ON "attractions_rels" USING btree ("path");
  CREATE INDEX "attractions_rels_product_categories_id_idx" ON "attractions_rels" USING btree ("product_categories_id");
  CREATE INDEX "destinations_rels_order_idx" ON "destinations_rels" USING btree ("order");
  CREATE INDEX "destinations_rels_parent_idx" ON "destinations_rels" USING btree ("parent_id");
  CREATE INDEX "destinations_rels_path_idx" ON "destinations_rels" USING btree ("path");
  CREATE INDEX "destinations_rels_tours_id_idx" ON "destinations_rels" USING btree ("tours_id");
  CREATE INDEX "destinations_rels_car_rentals_id_idx" ON "destinations_rels" USING btree ("car_rentals_id");
  CREATE INDEX "destinations_rels_posts_id_idx" ON "destinations_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "car_rentals_slug_idx" ON "car_rentals" USING btree ("slug");
  CREATE INDEX "car_rentals_destination_idx" ON "car_rentals" USING btree ("destination_id");
  CREATE INDEX "car_rentals_route_from_idx" ON "car_rentals" USING btree ("route_from");
  CREATE INDEX "car_rentals_route_to_idx" ON "car_rentals" USING btree ("route_to");
  CREATE INDEX "car_rentals_vehicle_type_idx" ON "car_rentals" USING btree ("vehicle_type");
  CREATE INDEX "car_rentals_price_from_idx" ON "car_rentals" USING btree ("price_from");
  CREATE INDEX "car_rentals_featured_image_idx" ON "car_rentals" USING btree ("featured_image_id");
  CREATE INDEX "car_rentals_partner_idx" ON "car_rentals" USING btree ("partner_id");
  CREATE INDEX "car_rentals_status_idx" ON "car_rentals" USING btree ("status");
  CREATE INDEX "car_rentals_seo_seo_og_image_idx" ON "car_rentals" USING btree ("seo_og_image_id");
  CREATE INDEX "car_rentals_updated_at_idx" ON "car_rentals" USING btree ("updated_at");
  CREATE INDEX "car_rentals_created_at_idx" ON "car_rentals" USING btree ("created_at");
  CREATE INDEX "car_rentals_rels_order_idx" ON "car_rentals_rels" USING btree ("order");
  CREATE INDEX "car_rentals_rels_parent_idx" ON "car_rentals_rels" USING btree ("parent_id");
  CREATE INDEX "car_rentals_rels_path_idx" ON "car_rentals_rels" USING btree ("path");
  CREATE INDEX "car_rentals_rels_media_id_idx" ON "car_rentals_rels" USING btree ("media_id");
  CREATE INDEX "custom_inquiries_accommodation_levels_order_idx" ON "custom_inquiries_accommodation_levels" USING btree ("_order");
  CREATE INDEX "custom_inquiries_accommodation_levels_parent_id_idx" ON "custom_inquiries_accommodation_levels" USING btree ("_parent_id");
  CREATE INDEX "custom_inquiries_themes_order_idx" ON "custom_inquiries_themes" USING btree ("_order");
  CREATE INDEX "custom_inquiries_themes_parent_id_idx" ON "custom_inquiries_themes" USING btree ("_parent_id");
  CREATE INDEX "custom_inquiries_customer_idx" ON "custom_inquiries" USING btree ("customer_id");
  CREATE INDEX "custom_inquiries_email_idx" ON "custom_inquiries" USING btree ("email");
  CREATE INDEX "custom_inquiries_status_idx" ON "custom_inquiries" USING btree ("status");
  CREATE UNIQUE INDEX "custom_inquiries_idempotency_key_idx" ON "custom_inquiries" USING btree ("idempotency_key");
  CREATE INDEX "custom_inquiries_updated_at_idx" ON "custom_inquiries" USING btree ("updated_at");
  CREATE INDEX "custom_inquiries_created_at_idx" ON "custom_inquiries" USING btree ("created_at");
  CREATE INDEX "custom_inquiries_rels_order_idx" ON "custom_inquiries_rels" USING btree ("order");
  CREATE INDEX "custom_inquiries_rels_parent_idx" ON "custom_inquiries_rels" USING btree ("parent_id");
  CREATE INDEX "custom_inquiries_rels_path_idx" ON "custom_inquiries_rels" USING btree ("path");
  CREATE INDEX "custom_inquiries_rels_destinations_id_idx" ON "custom_inquiries_rels" USING btree ("destinations_id");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_sort_weight_idx" ON "team_members" USING btree ("sort_weight");
  CREATE INDEX "team_members_status_idx" ON "team_members" USING btree ("status");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "site_settings_updated_at_idx" ON "site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "site_settings" USING btree ("created_at");
  ALTER TABLE "destinations" ADD CONSTRAINT "destinations_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tours_rels" ADD CONSTRAINT "tours_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours_rels" ADD CONSTRAINT "tours_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_car_rentals_fk" FOREIGN KEY ("car_rentals_id") REFERENCES "public"."car_rentals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_inquiries_fk" FOREIGN KEY ("custom_inquiries_id") REFERENCES "public"."custom_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_settings_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "destinations_hero_image_idx" ON "destinations" USING btree ("hero_image_id");
  CREATE INDEX "destinations_sort_weight_idx" ON "destinations" USING btree ("sort_weight");
  CREATE INDEX "tours_duration_days_idx" ON "tours" USING btree ("duration_days");
  CREATE INDEX "tours_group_size_max_idx" ON "tours" USING btree ("group_size_max");
  CREATE INDEX "tours_rating_average_idx" ON "tours" USING btree ("rating_average");
  CREATE INDEX "tours_is_featured_idx" ON "tours" USING btree ("is_featured");
  CREATE INDEX "tours_sort_weight_idx" ON "tours" USING btree ("sort_weight");
  CREATE INDEX "tours_rels_product_categories_id_idx" ON "tours_rels" USING btree ("product_categories_id");
  CREATE INDEX "tours_rels_attractions_id_idx" ON "tours_rels" USING btree ("attractions_id");
  CREATE INDEX "posts_guide_category_idx" ON "posts" USING btree ("guide_category");
  CREATE INDEX "posts_sort_weight_idx" ON "posts" USING btree ("sort_weight");
  CREATE INDEX "posts_rels_attractions_id_idx" ON "posts_rels" USING btree ("attractions_id");
  CREATE INDEX "payload_locked_documents_rels_product_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("product_categories_id");
  CREATE INDEX "payload_locked_documents_rels_attractions_id_idx" ON "payload_locked_documents_rels" USING btree ("attractions_id");
  CREATE INDEX "payload_locked_documents_rels_car_rentals_id_idx" ON "payload_locked_documents_rels" USING btree ("car_rentals_id");
  CREATE INDEX "payload_locked_documents_rels_custom_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("custom_inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_site_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("site_settings_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "product_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "attractions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "attractions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destinations_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "car_rentals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "car_rentals_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "custom_inquiries_accommodation_levels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "custom_inquiries_themes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "custom_inquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "custom_inquiries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "product_categories" CASCADE;
  DROP TABLE "attractions" CASCADE;
  DROP TABLE "attractions_rels" CASCADE;
  DROP TABLE "destinations_rels" CASCADE;
  DROP TABLE "car_rentals" CASCADE;
  DROP TABLE "car_rentals_rels" CASCADE;
  DROP TABLE "custom_inquiries_accommodation_levels" CASCADE;
  DROP TABLE "custom_inquiries_themes" CASCADE;
  DROP TABLE "custom_inquiries" CASCADE;
  DROP TABLE "custom_inquiries_rels" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  ALTER TABLE "destinations" DROP CONSTRAINT "destinations_hero_image_id_media_id_fk";

  ALTER TABLE "tours_rels" DROP CONSTRAINT "tours_rels_product_categories_fk";

  ALTER TABLE "tours_rels" DROP CONSTRAINT "tours_rels_attractions_fk";

  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_attractions_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_categories_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_attractions_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_car_rentals_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_custom_inquiries_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_members_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_settings_fk";

  DROP INDEX "destinations_hero_image_idx";
  DROP INDEX "destinations_sort_weight_idx";
  DROP INDEX "tours_duration_days_idx";
  DROP INDEX "tours_group_size_max_idx";
  DROP INDEX "tours_rating_average_idx";
  DROP INDEX "tours_is_featured_idx";
  DROP INDEX "tours_sort_weight_idx";
  DROP INDEX "tours_rels_product_categories_id_idx";
  DROP INDEX "tours_rels_attractions_id_idx";
  DROP INDEX "posts_guide_category_idx";
  DROP INDEX "posts_sort_weight_idx";
  DROP INDEX "posts_rels_attractions_id_idx";
  DROP INDEX "payload_locked_documents_rels_product_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_attractions_id_idx";
  DROP INDEX "payload_locked_documents_rels_car_rentals_id_idx";
  DROP INDEX "payload_locked_documents_rels_custom_inquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_members_id_idx";
  DROP INDEX "payload_locked_documents_rels_site_settings_id_idx";
  ALTER TABLE "destinations" DROP COLUMN "summary";
  ALTER TABLE "destinations" DROP COLUMN "hero_image_id";
  ALTER TABLE "destinations" DROP COLUMN "best_time_to_visit";
  ALTER TABLE "destinations" DROP COLUMN "hub_intro";
  ALTER TABLE "destinations" DROP COLUMN "sort_weight";
  ALTER TABLE "tours" DROP COLUMN "duration_days";
  ALTER TABLE "tours" DROP COLUMN "duration_text";
  ALTER TABLE "tours" DROP COLUMN "route_summary";
  ALTER TABLE "tours" DROP COLUMN "group_size_min";
  ALTER TABLE "tours" DROP COLUMN "group_size_max";
  ALTER TABLE "tours" DROP COLUMN "rating_average";
  ALTER TABLE "tours" DROP COLUMN "rating_count";
  ALTER TABLE "tours" DROP COLUMN "is_featured";
  ALTER TABLE "tours" DROP COLUMN "sort_weight";
  ALTER TABLE "tours_rels" DROP COLUMN "product_categories_id";
  ALTER TABLE "tours_rels" DROP COLUMN "attractions_id";
  ALTER TABLE "posts" DROP COLUMN "guide_category";
  ALTER TABLE "posts" DROP COLUMN "sort_weight";
  ALTER TABLE "posts_rels" DROP COLUMN "attractions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "product_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "attractions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "car_rentals_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "custom_inquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_members_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_settings_id";
  DROP TYPE "public"."enum_product_categories_type";
  DROP TYPE "public"."enum_car_rentals_vehicle_type";
  DROP TYPE "public"."enum_car_rentals_status";
  DROP TYPE "public"."enum_custom_inquiries_status";
  DROP TYPE "public"."enum_posts_guide_category";
  DROP TYPE "public"."enum_team_members_status";`)
}
