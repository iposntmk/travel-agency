import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_blog_media_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );

  ALTER TABLE "site_settings" ADD COLUMN "blog_media_video_eyebrow" varchar DEFAULT 'Video highlight';
  ALTER TABLE "site_settings" ADD COLUMN "blog_media_video_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "blog_media_video_subtitle" varchar DEFAULT 'Explore the real captures of Central Vietnam through filming.';
  ALTER TABLE "site_settings" ADD COLUMN "blog_media_video_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "blog_media_gallery_eyebrow" varchar DEFAULT 'Travel photos gallery';
  ALTER TABLE "site_settings" ADD COLUMN "blog_media_gallery_subtitle" varchar DEFAULT 'A collection of amazing photos from Central Vietnam.';
  ALTER TABLE "site_settings_blog_media_gallery" ADD CONSTRAINT "site_settings_blog_media_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_blog_media_gallery" ADD CONSTRAINT "site_settings_blog_media_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_blog_media_gallery_order_idx" ON "site_settings_blog_media_gallery" USING btree ("_order");
  CREATE INDEX "site_settings_blog_media_gallery_parent_id_idx" ON "site_settings_blog_media_gallery" USING btree ("_parent_id");
  CREATE INDEX "site_settings_blog_media_gallery_image_idx" ON "site_settings_blog_media_gallery" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_blog_media_gallery" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_blog_media_gallery" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "blog_media_video_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "blog_media_video_title";
  ALTER TABLE "site_settings" DROP COLUMN "blog_media_video_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "blog_media_video_url";
  ALTER TABLE "site_settings" DROP COLUMN "blog_media_gallery_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "blog_media_gallery_subtitle";`)
}
