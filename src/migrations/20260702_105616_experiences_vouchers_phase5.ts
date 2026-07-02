import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_experiences_experience_type" AS ENUM('show-ticket', 'massage-spa', 'boat-ride', 'other');
  CREATE TYPE "public"."enum_experiences_status" AS ENUM('active', 'paused');
  CREATE TYPE "public"."enum_vouchers_status" AS ENUM('issued', 'redeemed', 'expired', 'void');
  CREATE TABLE "bookings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tours_id" integer,
  	"car_rentals_id" integer,
  	"cruises_id" integer,
  	"experiences_id" integer
  );
  
  CREATE TABLE "experiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"destination_id" integer NOT NULL,
  	"experience_type" "enum_experiences_experience_type" NOT NULL,
  	"featured_image_id" integer,
  	"partner_id" integer,
  	"price_from" numeric,
  	"currency" varchar DEFAULT 'USD',
  	"deal_original_price" numeric,
  	"deal_deal_ends_at" timestamp(3) with time zone,
  	"is_featured" boolean DEFAULT false,
  	"is_best_seller" boolean DEFAULT false,
  	"sort_weight" numeric DEFAULT 0,
  	"status" "enum_experiences_status" DEFAULT 'active' NOT NULL,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "experiences_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"summary" varchar,
  	"description" jsonb,
  	"venue" varchar,
  	"session_duration" varchar,
  	"deal_deal_label" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "experiences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "vouchers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"promotion_id" integer NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_id" integer,
  	"source_booking_id" integer NOT NULL,
  	"status" "enum_vouchers_status" DEFAULT 'issued' NOT NULL,
  	"expires_at" timestamp(3) with time zone,
  	"redeemed_booking_id" integer,
  	"issued_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "bookings" ALTER COLUMN "tour_id" DROP NOT NULL;
  ALTER TABLE "bookings" ADD COLUMN "applied_voucher_id" integer;
  ALTER TABLE "promotions_rels" ADD COLUMN "experiences_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "experiences_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vouchers_id" integer;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_tours_fk" FOREIGN KEY ("tours_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_car_rentals_fk" FOREIGN KEY ("car_rentals_id") REFERENCES "public"."car_rentals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_cruises_fk" FOREIGN KEY ("cruises_id") REFERENCES "public"."cruises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences_locales" ADD CONSTRAINT "experiences_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_rels" ADD CONSTRAINT "experiences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_rels" ADD CONSTRAINT "experiences_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_source_booking_id_bookings_id_fk" FOREIGN KEY ("source_booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_redeemed_booking_id_bookings_id_fk" FOREIGN KEY ("redeemed_booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "bookings_rels_order_idx" ON "bookings_rels" USING btree ("order");
  CREATE INDEX "bookings_rels_parent_idx" ON "bookings_rels" USING btree ("parent_id");
  CREATE INDEX "bookings_rels_path_idx" ON "bookings_rels" USING btree ("path");
  CREATE INDEX "bookings_rels_tours_id_idx" ON "bookings_rels" USING btree ("tours_id");
  CREATE INDEX "bookings_rels_car_rentals_id_idx" ON "bookings_rels" USING btree ("car_rentals_id");
  CREATE INDEX "bookings_rels_cruises_id_idx" ON "bookings_rels" USING btree ("cruises_id");
  CREATE INDEX "bookings_rels_experiences_id_idx" ON "bookings_rels" USING btree ("experiences_id");
  CREATE INDEX "experiences_destination_idx" ON "experiences" USING btree ("destination_id");
  CREATE INDEX "experiences_experience_type_idx" ON "experiences" USING btree ("experience_type");
  CREATE INDEX "experiences_featured_image_idx" ON "experiences" USING btree ("featured_image_id");
  CREATE INDEX "experiences_partner_idx" ON "experiences" USING btree ("partner_id");
  CREATE INDEX "experiences_price_from_idx" ON "experiences" USING btree ("price_from");
  CREATE INDEX "experiences_is_featured_idx" ON "experiences" USING btree ("is_featured");
  CREATE INDEX "experiences_is_best_seller_idx" ON "experiences" USING btree ("is_best_seller");
  CREATE INDEX "experiences_sort_weight_idx" ON "experiences" USING btree ("sort_weight");
  CREATE INDEX "experiences_status_idx" ON "experiences" USING btree ("status");
  CREATE INDEX "experiences_seo_seo_og_image_idx" ON "experiences" USING btree ("seo_og_image_id");
  CREATE INDEX "experiences_updated_at_idx" ON "experiences" USING btree ("updated_at");
  CREATE INDEX "experiences_created_at_idx" ON "experiences" USING btree ("created_at");
  CREATE INDEX "experiences_slug_idx" ON "experiences_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "experiences_locales_locale_parent_id_unique" ON "experiences_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "experiences_rels_order_idx" ON "experiences_rels" USING btree ("order");
  CREATE INDEX "experiences_rels_parent_idx" ON "experiences_rels" USING btree ("parent_id");
  CREATE INDEX "experiences_rels_path_idx" ON "experiences_rels" USING btree ("path");
  CREATE INDEX "experiences_rels_media_id_idx" ON "experiences_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "vouchers_code_idx" ON "vouchers" USING btree ("code");
  CREATE INDEX "vouchers_promotion_idx" ON "vouchers" USING btree ("promotion_id");
  CREATE INDEX "vouchers_customer_email_idx" ON "vouchers" USING btree ("customer_email");
  CREATE INDEX "vouchers_customer_idx" ON "vouchers" USING btree ("customer_id");
  CREATE INDEX "vouchers_source_booking_idx" ON "vouchers" USING btree ("source_booking_id");
  CREATE INDEX "vouchers_status_idx" ON "vouchers" USING btree ("status");
  CREATE INDEX "vouchers_expires_at_idx" ON "vouchers" USING btree ("expires_at");
  CREATE INDEX "vouchers_redeemed_booking_idx" ON "vouchers" USING btree ("redeemed_booking_id");
  CREATE INDEX "vouchers_updated_at_idx" ON "vouchers" USING btree ("updated_at");
  CREATE INDEX "vouchers_created_at_idx" ON "vouchers" USING btree ("created_at");
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_applied_voucher_id_vouchers_id_fk" FOREIGN KEY ("applied_voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vouchers_fk" FOREIGN KEY ("vouchers_id") REFERENCES "public"."vouchers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "bookings_applied_voucher_idx" ON "bookings" USING btree ("applied_voucher_id");
  CREATE INDEX "promotions_rels_experiences_id_idx" ON "promotions_rels" USING btree ("experiences_id");
  CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" USING btree ("experiences_id");
  CREATE INDEX "payload_locked_documents_rels_vouchers_id_idx" ON "payload_locked_documents_rels" USING btree ("vouchers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bookings_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "experiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "experiences_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "experiences_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vouchers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "bookings_rels" CASCADE;
  DROP TABLE "experiences" CASCADE;
  DROP TABLE "experiences_locales" CASCADE;
  DROP TABLE "experiences_rels" CASCADE;
  DROP TABLE "vouchers" CASCADE;
  ALTER TABLE "bookings" DROP CONSTRAINT "bookings_applied_voucher_id_vouchers_id_fk";
  
  ALTER TABLE "promotions_rels" DROP CONSTRAINT "promotions_rels_experiences_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_experiences_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vouchers_fk";
  
  DROP INDEX "bookings_applied_voucher_idx";
  DROP INDEX "promotions_rels_experiences_id_idx";
  DROP INDEX "payload_locked_documents_rels_experiences_id_idx";
  DROP INDEX "payload_locked_documents_rels_vouchers_id_idx";
  ALTER TABLE "bookings" ALTER COLUMN "tour_id" SET NOT NULL;
  ALTER TABLE "bookings" DROP COLUMN "applied_voucher_id";
  ALTER TABLE "promotions_rels" DROP COLUMN "experiences_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "experiences_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vouchers_id";
  DROP TYPE "public"."enum_experiences_experience_type";
  DROP TYPE "public"."enum_experiences_status";
  DROP TYPE "public"."enum_vouchers_status";`)
}
