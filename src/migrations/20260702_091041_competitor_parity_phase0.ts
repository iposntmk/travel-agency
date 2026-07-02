import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Hand-reviewed: the auto-generated version also re-emitted the homepage
// localization moves from 20260701_120000_homepage_localized (snapshot chain
// was broken — earlier hand-written migrations ship no .json snapshot), which
// would fail against the real DB. Those phantom statements were removed; this
// file contains ONLY the genuinely new Phase-0 schema:
// - Attractions: content/gallery/highlights/practicalInfo/faqs
// - Destinations: faqs/nearbyDestinations/themeChips
// - Tours/Cruises/CarRentals: deal group + pickupAvailable/privateOption/isBestSeller
// - Promotions: isPublic/bannerText/showCountdown/trigger+reward rels/voucher fields
// - Reviews: public-submission fields + photos rels, customer now optional
// - SiteSettings: giveaway group, cancellationPolicy, generalFaqs

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reviews_submission_source" AS ENUM('staff', 'public');
  CREATE TABLE "attractions_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );

  CREATE TABLE "attractions_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );

  CREATE TABLE "destinations_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );

  CREATE TABLE "site_settings_general_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );

  CREATE TABLE "reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );

  CREATE TABLE "promotions_locales" (
  	"banner_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "reviews" ALTER COLUMN "customer_id" DROP NOT NULL;
  ALTER TABLE "attractions" ADD COLUMN "practical_info_latitude" numeric;
  ALTER TABLE "attractions" ADD COLUMN "practical_info_longitude" numeric;
  ALTER TABLE "attractions_locales" ADD COLUMN "content" jsonb;
  ALTER TABLE "attractions_locales" ADD COLUMN "practical_info_address" varchar;
  ALTER TABLE "attractions_locales" ADD COLUMN "practical_info_opening_hours" varchar;
  ALTER TABLE "attractions_locales" ADD COLUMN "practical_info_price_range" varchar;
  ALTER TABLE "attractions_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "destinations_rels" ADD COLUMN "destinations_id" integer;
  ALTER TABLE "destinations_rels" ADD COLUMN "product_categories_id" integer;
  ALTER TABLE "tours" ADD COLUMN "deal_original_price" numeric;
  ALTER TABLE "tours" ADD COLUMN "deal_deal_ends_at" timestamp(3) with time zone;
  ALTER TABLE "tours" ADD COLUMN "pickup_available" boolean DEFAULT false;
  ALTER TABLE "tours" ADD COLUMN "private_option" boolean DEFAULT false;
  ALTER TABLE "tours" ADD COLUMN "is_best_seller" boolean DEFAULT false;
  ALTER TABLE "tours_locales" ADD COLUMN "deal_deal_label" varchar;
  ALTER TABLE "cruises" ADD COLUMN "deal_original_price" numeric;
  ALTER TABLE "cruises" ADD COLUMN "deal_deal_ends_at" timestamp(3) with time zone;
  ALTER TABLE "cruises" ADD COLUMN "pickup_available" boolean DEFAULT false;
  ALTER TABLE "cruises" ADD COLUMN "private_option" boolean DEFAULT false;
  ALTER TABLE "cruises" ADD COLUMN "is_best_seller" boolean DEFAULT false;
  ALTER TABLE "cruises_locales" ADD COLUMN "deal_deal_label" varchar;
  ALTER TABLE "car_rentals" ADD COLUMN "deal_original_price" numeric;
  ALTER TABLE "car_rentals" ADD COLUMN "deal_deal_ends_at" timestamp(3) with time zone;
  ALTER TABLE "car_rentals" ADD COLUMN "pickup_available" boolean DEFAULT false;
  ALTER TABLE "car_rentals" ADD COLUMN "private_option" boolean DEFAULT false;
  ALTER TABLE "car_rentals" ADD COLUMN "is_best_seller" boolean DEFAULT false;
  ALTER TABLE "car_rentals_locales" ADD COLUMN "deal_deal_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "giveaway_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "giveaway_delay_seconds" numeric DEFAULT 15;
  ALTER TABLE "site_settings" ADD COLUMN "giveaway_frequency_days" numeric DEFAULT 14;
  ALTER TABLE "site_settings_locales" ADD COLUMN "giveaway_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "giveaway_description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "giveaway_prize_text" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "giveaway_cta_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "cancellation_policy" jsonb;
  ALTER TABLE "reviews" ADD COLUMN "author_name" varchar;
  ALTER TABLE "reviews" ADD COLUMN "author_email" varchar;
  ALTER TABLE "reviews" ADD COLUMN "submission_source" "enum_reviews_submission_source" DEFAULT 'staff' NOT NULL;
  ALTER TABLE "reviews" ADD COLUMN "honeypot_flagged" boolean DEFAULT false;
  ALTER TABLE "promotions" ADD COLUMN "is_public" boolean DEFAULT false;
  ALTER TABLE "promotions" ADD COLUMN "show_countdown" boolean DEFAULT false;
  ALTER TABLE "promotions" ADD COLUMN "voucher_validity_days" numeric;
  ALTER TABLE "promotions" ADD COLUMN "auto_issue_voucher" boolean DEFAULT false;
  ALTER TABLE "promotions_rels" ADD COLUMN "car_rentals_id" integer;
  ALTER TABLE "promotions_rels" ADD COLUMN "cruises_id" integer;
  ALTER TABLE "attractions_highlights" ADD CONSTRAINT "attractions_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "attractions_faqs" ADD CONSTRAINT "attractions_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_faqs" ADD CONSTRAINT "destinations_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_general_faqs" ADD CONSTRAINT "site_settings_general_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions_locales" ADD CONSTRAINT "promotions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "attractions_highlights_order_idx" ON "attractions_highlights" USING btree ("_order");
  CREATE INDEX "attractions_highlights_parent_id_idx" ON "attractions_highlights" USING btree ("_parent_id");
  CREATE INDEX "attractions_highlights_locale_idx" ON "attractions_highlights" USING btree ("_locale");
  CREATE INDEX "attractions_faqs_order_idx" ON "attractions_faqs" USING btree ("_order");
  CREATE INDEX "attractions_faqs_parent_id_idx" ON "attractions_faqs" USING btree ("_parent_id");
  CREATE INDEX "attractions_faqs_locale_idx" ON "attractions_faqs" USING btree ("_locale");
  CREATE INDEX "destinations_faqs_order_idx" ON "destinations_faqs" USING btree ("_order");
  CREATE INDEX "destinations_faqs_parent_id_idx" ON "destinations_faqs" USING btree ("_parent_id");
  CREATE INDEX "destinations_faqs_locale_idx" ON "destinations_faqs" USING btree ("_locale");
  CREATE INDEX "site_settings_general_faqs_order_idx" ON "site_settings_general_faqs" USING btree ("_order");
  CREATE INDEX "site_settings_general_faqs_parent_id_idx" ON "site_settings_general_faqs" USING btree ("_parent_id");
  CREATE INDEX "site_settings_general_faqs_locale_idx" ON "site_settings_general_faqs" USING btree ("_locale");
  CREATE INDEX "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_media_id_idx" ON "reviews_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "promotions_locales_locale_parent_id_unique" ON "promotions_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "attractions_rels" ADD CONSTRAINT "attractions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_rels" ADD CONSTRAINT "destinations_rels_product_categories_fk" FOREIGN KEY ("product_categories_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_car_rentals_fk" FOREIGN KEY ("car_rentals_id") REFERENCES "public"."car_rentals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_cruises_fk" FOREIGN KEY ("cruises_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "attractions_rels_media_id_idx" ON "attractions_rels" USING btree ("media_id");
  CREATE INDEX "destinations_rels_destinations_id_idx" ON "destinations_rels" USING btree ("destinations_id");
  CREATE INDEX "destinations_rels_product_categories_id_idx" ON "destinations_rels" USING btree ("product_categories_id");
  CREATE INDEX "tours_is_best_seller_idx" ON "tours" USING btree ("is_best_seller");
  CREATE INDEX "cruises_is_best_seller_idx" ON "cruises" USING btree ("is_best_seller");
  CREATE INDEX "car_rentals_is_best_seller_idx" ON "car_rentals" USING btree ("is_best_seller");
  CREATE INDEX "promotions_is_public_idx" ON "promotions" USING btree ("is_public");
  CREATE INDEX "promotions_rels_car_rentals_id_idx" ON "promotions_rels" USING btree ("car_rentals_id");
  CREATE INDEX "promotions_rels_cruises_id_idx" ON "promotions_rels" USING btree ("cruises_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "attractions_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "attractions_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destinations_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_general_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "promotions_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "attractions_highlights" CASCADE;
  DROP TABLE "attractions_faqs" CASCADE;
  DROP TABLE "destinations_faqs" CASCADE;
  DROP TABLE "site_settings_general_faqs" CASCADE;
  DROP TABLE "reviews_rels" CASCADE;
  DROP TABLE "promotions_locales" CASCADE;
  ALTER TABLE "attractions_rels" DROP CONSTRAINT "attractions_rels_media_fk";

  ALTER TABLE "destinations_rels" DROP CONSTRAINT "destinations_rels_destinations_fk";

  ALTER TABLE "destinations_rels" DROP CONSTRAINT "destinations_rels_product_categories_fk";

  ALTER TABLE "promotions_rels" DROP CONSTRAINT "promotions_rels_car_rentals_fk";

  ALTER TABLE "promotions_rels" DROP CONSTRAINT "promotions_rels_cruises_fk";

  DROP INDEX "attractions_rels_media_id_idx";
  DROP INDEX "destinations_rels_destinations_id_idx";
  DROP INDEX "destinations_rels_product_categories_id_idx";
  DROP INDEX "tours_is_best_seller_idx";
  DROP INDEX "cruises_is_best_seller_idx";
  DROP INDEX "car_rentals_is_best_seller_idx";
  DROP INDEX "promotions_is_public_idx";
  DROP INDEX "promotions_rels_car_rentals_id_idx";
  DROP INDEX "promotions_rels_cruises_id_idx";
  ALTER TABLE "reviews" ALTER COLUMN "customer_id" SET NOT NULL;
  ALTER TABLE "attractions" DROP COLUMN "practical_info_latitude";
  ALTER TABLE "attractions" DROP COLUMN "practical_info_longitude";
  ALTER TABLE "attractions_locales" DROP COLUMN "content";
  ALTER TABLE "attractions_locales" DROP COLUMN "practical_info_address";
  ALTER TABLE "attractions_locales" DROP COLUMN "practical_info_opening_hours";
  ALTER TABLE "attractions_locales" DROP COLUMN "practical_info_price_range";
  ALTER TABLE "attractions_rels" DROP COLUMN "media_id";
  ALTER TABLE "destinations_rels" DROP COLUMN "destinations_id";
  ALTER TABLE "destinations_rels" DROP COLUMN "product_categories_id";
  ALTER TABLE "tours" DROP COLUMN "deal_original_price";
  ALTER TABLE "tours" DROP COLUMN "deal_deal_ends_at";
  ALTER TABLE "tours" DROP COLUMN "pickup_available";
  ALTER TABLE "tours" DROP COLUMN "private_option";
  ALTER TABLE "tours" DROP COLUMN "is_best_seller";
  ALTER TABLE "tours_locales" DROP COLUMN "deal_deal_label";
  ALTER TABLE "cruises" DROP COLUMN "deal_original_price";
  ALTER TABLE "cruises" DROP COLUMN "deal_deal_ends_at";
  ALTER TABLE "cruises" DROP COLUMN "pickup_available";
  ALTER TABLE "cruises" DROP COLUMN "private_option";
  ALTER TABLE "cruises" DROP COLUMN "is_best_seller";
  ALTER TABLE "cruises_locales" DROP COLUMN "deal_deal_label";
  ALTER TABLE "car_rentals" DROP COLUMN "deal_original_price";
  ALTER TABLE "car_rentals" DROP COLUMN "deal_deal_ends_at";
  ALTER TABLE "car_rentals" DROP COLUMN "pickup_available";
  ALTER TABLE "car_rentals" DROP COLUMN "private_option";
  ALTER TABLE "car_rentals" DROP COLUMN "is_best_seller";
  ALTER TABLE "car_rentals_locales" DROP COLUMN "deal_deal_label";
  ALTER TABLE "site_settings" DROP COLUMN "giveaway_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "giveaway_delay_seconds";
  ALTER TABLE "site_settings" DROP COLUMN "giveaway_frequency_days";
  ALTER TABLE "site_settings_locales" DROP COLUMN "giveaway_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "giveaway_description";
  ALTER TABLE "site_settings_locales" DROP COLUMN "giveaway_prize_text";
  ALTER TABLE "site_settings_locales" DROP COLUMN "giveaway_cta_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "cancellation_policy";
  ALTER TABLE "reviews" DROP COLUMN "author_name";
  ALTER TABLE "reviews" DROP COLUMN "author_email";
  ALTER TABLE "reviews" DROP COLUMN "submission_source";
  ALTER TABLE "reviews" DROP COLUMN "honeypot_flagged";
  ALTER TABLE "promotions" DROP COLUMN "is_public";
  ALTER TABLE "promotions" DROP COLUMN "show_countdown";
  ALTER TABLE "promotions" DROP COLUMN "voucher_validity_days";
  ALTER TABLE "promotions" DROP COLUMN "auto_issue_voucher";
  ALTER TABLE "promotions_rels" DROP COLUMN "car_rentals_id";
  ALTER TABLE "promotions_rels" DROP COLUMN "cruises_id";
  DROP TYPE "public"."enum_reviews_submission_source";`)
}
