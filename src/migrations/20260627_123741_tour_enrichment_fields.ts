import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tours_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "tours_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "tours_exclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "tours_itinerary_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  ALTER TABLE "custom_inquiries" ALTER COLUMN "source" SET DEFAULT 'customize-tour';
  ALTER TABLE "tours_itinerary" ADD COLUMN "location" varchar;
  ALTER TABLE "tours_itinerary" ADD COLUMN "distance" varchar;
  ALTER TABLE "tours_itinerary" ADD COLUMN "title" varchar;
  ALTER TABLE "tours_itinerary" ADD COLUMN "note" varchar;
  ALTER TABLE "tours_itinerary" ADD COLUMN "hotel_name" varchar;
  ALTER TABLE "tours_itinerary" ADD COLUMN "hotel_stars" numeric;
  ALTER TABLE "tours_itinerary" ADD COLUMN "hotel_room" varchar;
  ALTER TABLE "tours" ADD COLUMN "start_end" varchar;
  ALTER TABLE "tours" ADD COLUMN "travel_style" varchar;
  ALTER TABLE "tours" ADD COLUMN "guide_languages" varchar;
  ALTER TABLE "tours" ADD COLUMN "map_image_id" integer;
  ALTER TABLE "tours" ADD COLUMN "highlight_intro" varchar;
  ALTER TABLE "tours_highlights" ADD CONSTRAINT "tours_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours_inclusions" ADD CONSTRAINT "tours_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours_exclusions" ADD CONSTRAINT "tours_exclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours_itinerary_included" ADD CONSTRAINT "tours_itinerary_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tours_itinerary"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tours_highlights_order_idx" ON "tours_highlights" USING btree ("_order");
  CREATE INDEX "tours_highlights_parent_id_idx" ON "tours_highlights" USING btree ("_parent_id");
  CREATE INDEX "tours_inclusions_order_idx" ON "tours_inclusions" USING btree ("_order");
  CREATE INDEX "tours_inclusions_parent_id_idx" ON "tours_inclusions" USING btree ("_parent_id");
  CREATE INDEX "tours_exclusions_order_idx" ON "tours_exclusions" USING btree ("_order");
  CREATE INDEX "tours_exclusions_parent_id_idx" ON "tours_exclusions" USING btree ("_parent_id");
  CREATE INDEX "tours_itinerary_included_order_idx" ON "tours_itinerary_included" USING btree ("_order");
  CREATE INDEX "tours_itinerary_included_parent_id_idx" ON "tours_itinerary_included" USING btree ("_parent_id");
  ALTER TABLE "tours" ADD CONSTRAINT "tours_map_image_id_media_id_fk" FOREIGN KEY ("map_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tours_map_image_idx" ON "tours" USING btree ("map_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tours_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tours_inclusions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tours_exclusions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tours_itinerary_included" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tours_highlights" CASCADE;
  DROP TABLE "tours_inclusions" CASCADE;
  DROP TABLE "tours_exclusions" CASCADE;
  DROP TABLE "tours_itinerary_included" CASCADE;
  ALTER TABLE "tours" DROP CONSTRAINT "tours_map_image_id_media_id_fk";
  
  DROP INDEX "tours_map_image_idx";
  ALTER TABLE "custom_inquiries" ALTER COLUMN "source" SET DEFAULT 'free-proposal';
  ALTER TABLE "tours_itinerary" DROP COLUMN "location";
  ALTER TABLE "tours_itinerary" DROP COLUMN "distance";
  ALTER TABLE "tours_itinerary" DROP COLUMN "title";
  ALTER TABLE "tours_itinerary" DROP COLUMN "note";
  ALTER TABLE "tours_itinerary" DROP COLUMN "hotel_name";
  ALTER TABLE "tours_itinerary" DROP COLUMN "hotel_stars";
  ALTER TABLE "tours_itinerary" DROP COLUMN "hotel_room";
  ALTER TABLE "tours" DROP COLUMN "start_end";
  ALTER TABLE "tours" DROP COLUMN "travel_style";
  ALTER TABLE "tours" DROP COLUMN "guide_languages";
  ALTER TABLE "tours" DROP COLUMN "map_image_id";
  ALTER TABLE "tours" DROP COLUMN "highlight_intro";`)
}
