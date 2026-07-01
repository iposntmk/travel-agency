import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Hand-written (same pattern as 20260630_151020_i18n_localization).
// Marks the SiteSettings `homepage` group copy fields localized: scalar section
// copy moves from `site_settings` into the existing `site_settings_locales`
// table, and the two homepage arrays (hero trust items, why-us items) get their
// own `*_locales` tables. Existing values are copied into the `en` locale BEFORE
// the base columns are dropped so no content is lost. `enabled` toggles, action
// hrefs (URLs) and the why-us `icon` stay non-localized.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Add localized columns + array locale tables.
  await db.execute(sql`
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_hero_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_hero_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_hero_body" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_search_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_search_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_search_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_who_we_are_heading" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_who_we_are_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_who_we_are_body" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_who_we_are_action_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_tours_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_tours_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_tours_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_tours_action_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_tours_tab_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_cruises_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_cruises_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_cruises_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_cruises_action_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_destinations_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_destinations_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_destinations_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_destinations_action_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_free_tours_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_free_tours_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_free_tours_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_free_tours_action_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_experiences_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_experiences_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_featured_experiences_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_testimonials_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_testimonials_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_testimonials_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_team_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_team_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_team_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_team_action_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_why_us_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_why_us_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_why_us_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_blog_eyebrow" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_blog_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_blog_subtitle" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_blog_action_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_newsletter_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "homepage_newsletter_subtitle" varchar;
  CREATE TABLE "site_settings_homepage_hero_trust_items_locales" (
  	"label" varchar NOT NULL,
  	"hint" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "site_settings_homepage_why_us_items_locales" (
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  ALTER TABLE "site_settings_homepage_hero_trust_items_locales" ADD CONSTRAINT "site_settings_homepage_hero_trust_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_homepage_hero_trust_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_homepage_why_us_items_locales" ADD CONSTRAINT "site_settings_homepage_why_us_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_homepage_why_us_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "site_settings_homepage_hero_trust_items_locales_locale_parent_id_unique" ON "site_settings_homepage_hero_trust_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_settings_homepage_why_us_items_locales_locale_parent_id_unique" ON "site_settings_homepage_why_us_items_locales" USING btree ("_locale","_parent_id");`)

  // 2. Copy existing values into the `en` locale.
  await db.execute(sql`
  UPDATE "site_settings_locales" l SET "homepage_hero_title" = b."homepage_hero_title", "homepage_hero_subtitle" = b."homepage_hero_subtitle", "homepage_hero_body" = b."homepage_hero_body", "homepage_search_eyebrow" = b."homepage_search_eyebrow", "homepage_search_title" = b."homepage_search_title", "homepage_search_subtitle" = b."homepage_search_subtitle", "homepage_who_we_are_heading" = b."homepage_who_we_are_heading", "homepage_who_we_are_title" = b."homepage_who_we_are_title", "homepage_who_we_are_body" = b."homepage_who_we_are_body", "homepage_who_we_are_action_label" = b."homepage_who_we_are_action_label", "homepage_featured_tours_eyebrow" = b."homepage_featured_tours_eyebrow", "homepage_featured_tours_title" = b."homepage_featured_tours_title", "homepage_featured_tours_subtitle" = b."homepage_featured_tours_subtitle", "homepage_featured_tours_action_label" = b."homepage_featured_tours_action_label", "homepage_featured_tours_tab_label" = b."homepage_featured_tours_tab_label", "homepage_cruises_eyebrow" = b."homepage_cruises_eyebrow", "homepage_cruises_title" = b."homepage_cruises_title", "homepage_cruises_subtitle" = b."homepage_cruises_subtitle", "homepage_cruises_action_label" = b."homepage_cruises_action_label", "homepage_destinations_eyebrow" = b."homepage_destinations_eyebrow", "homepage_destinations_title" = b."homepage_destinations_title", "homepage_destinations_subtitle" = b."homepage_destinations_subtitle", "homepage_destinations_action_label" = b."homepage_destinations_action_label", "homepage_free_tours_eyebrow" = b."homepage_free_tours_eyebrow", "homepage_free_tours_title" = b."homepage_free_tours_title", "homepage_free_tours_subtitle" = b."homepage_free_tours_subtitle", "homepage_free_tours_action_label" = b."homepage_free_tours_action_label", "homepage_featured_experiences_eyebrow" = b."homepage_featured_experiences_eyebrow", "homepage_featured_experiences_title" = b."homepage_featured_experiences_title", "homepage_featured_experiences_subtitle" = b."homepage_featured_experiences_subtitle", "homepage_testimonials_eyebrow" = b."homepage_testimonials_eyebrow", "homepage_testimonials_title" = b."homepage_testimonials_title", "homepage_testimonials_subtitle" = b."homepage_testimonials_subtitle", "homepage_team_eyebrow" = b."homepage_team_eyebrow", "homepage_team_title" = b."homepage_team_title", "homepage_team_subtitle" = b."homepage_team_subtitle", "homepage_team_action_label" = b."homepage_team_action_label", "homepage_why_us_eyebrow" = b."homepage_why_us_eyebrow", "homepage_why_us_title" = b."homepage_why_us_title", "homepage_why_us_subtitle" = b."homepage_why_us_subtitle", "homepage_blog_eyebrow" = b."homepage_blog_eyebrow", "homepage_blog_title" = b."homepage_blog_title", "homepage_blog_subtitle" = b."homepage_blog_subtitle", "homepage_blog_action_label" = b."homepage_blog_action_label", "homepage_newsletter_title" = b."homepage_newsletter_title", "homepage_newsletter_subtitle" = b."homepage_newsletter_subtitle"
    FROM "site_settings" b WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  INSERT INTO "site_settings_homepage_hero_trust_items_locales" ("label","hint","_locale","_parent_id")
    SELECT "label","hint",'en',"id" FROM "site_settings_homepage_hero_trust_items";
  INSERT INTO "site_settings_homepage_why_us_items_locales" ("title","body","_locale","_parent_id")
    SELECT "title","body",'en',"id" FROM "site_settings_homepage_why_us_items";`)

  // 3. Drop the now-migrated base columns.
  await db.execute(sql`
  ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_hero_body";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_search_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_search_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_search_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_who_we_are_heading";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_who_we_are_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_who_we_are_body";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_who_we_are_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_tours_tab_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_cruises_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_destinations_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_free_tours_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_experiences_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_experiences_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_featured_experiences_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_testimonials_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_testimonials_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_testimonials_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_team_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_why_us_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_why_us_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_why_us_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_eyebrow";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_subtitle";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_blog_action_label";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_newsletter_title";
  ALTER TABLE "site_settings" DROP COLUMN "homepage_newsletter_subtitle";
  ALTER TABLE "site_settings_homepage_hero_trust_items" DROP COLUMN "label";
  ALTER TABLE "site_settings_homepage_hero_trust_items" DROP COLUMN "hint";
  ALTER TABLE "site_settings_homepage_why_us_items" DROP COLUMN "title";
  ALTER TABLE "site_settings_homepage_why_us_items" DROP COLUMN "body";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // 1. Re-add base columns (nullable first).
  await db.execute(sql`
  ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_hero_body" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_search_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_search_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_search_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_who_we_are_heading" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_who_we_are_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_who_we_are_body" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_who_we_are_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_tours_tab_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_cruises_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_destinations_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_free_tours_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_experiences_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_experiences_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_featured_experiences_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_testimonials_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_testimonials_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_testimonials_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_team_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_why_us_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_why_us_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_why_us_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_eyebrow" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_subtitle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_blog_action_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_newsletter_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "homepage_newsletter_subtitle" varchar;
  ALTER TABLE "site_settings_homepage_hero_trust_items" ADD COLUMN "label" varchar;
  ALTER TABLE "site_settings_homepage_hero_trust_items" ADD COLUMN "hint" varchar;
  ALTER TABLE "site_settings_homepage_why_us_items" ADD COLUMN "title" varchar;
  ALTER TABLE "site_settings_homepage_why_us_items" ADD COLUMN "body" varchar;`)

  // 2. Copy the `en` locale values back.
  await db.execute(sql`
  UPDATE "site_settings" b SET "homepage_hero_title" = l."homepage_hero_title", "homepage_hero_subtitle" = l."homepage_hero_subtitle", "homepage_hero_body" = l."homepage_hero_body", "homepage_search_eyebrow" = l."homepage_search_eyebrow", "homepage_search_title" = l."homepage_search_title", "homepage_search_subtitle" = l."homepage_search_subtitle", "homepage_who_we_are_heading" = l."homepage_who_we_are_heading", "homepage_who_we_are_title" = l."homepage_who_we_are_title", "homepage_who_we_are_body" = l."homepage_who_we_are_body", "homepage_who_we_are_action_label" = l."homepage_who_we_are_action_label", "homepage_featured_tours_eyebrow" = l."homepage_featured_tours_eyebrow", "homepage_featured_tours_title" = l."homepage_featured_tours_title", "homepage_featured_tours_subtitle" = l."homepage_featured_tours_subtitle", "homepage_featured_tours_action_label" = l."homepage_featured_tours_action_label", "homepage_featured_tours_tab_label" = l."homepage_featured_tours_tab_label", "homepage_cruises_eyebrow" = l."homepage_cruises_eyebrow", "homepage_cruises_title" = l."homepage_cruises_title", "homepage_cruises_subtitle" = l."homepage_cruises_subtitle", "homepage_cruises_action_label" = l."homepage_cruises_action_label", "homepage_destinations_eyebrow" = l."homepage_destinations_eyebrow", "homepage_destinations_title" = l."homepage_destinations_title", "homepage_destinations_subtitle" = l."homepage_destinations_subtitle", "homepage_destinations_action_label" = l."homepage_destinations_action_label", "homepage_free_tours_eyebrow" = l."homepage_free_tours_eyebrow", "homepage_free_tours_title" = l."homepage_free_tours_title", "homepage_free_tours_subtitle" = l."homepage_free_tours_subtitle", "homepage_free_tours_action_label" = l."homepage_free_tours_action_label", "homepage_featured_experiences_eyebrow" = l."homepage_featured_experiences_eyebrow", "homepage_featured_experiences_title" = l."homepage_featured_experiences_title", "homepage_featured_experiences_subtitle" = l."homepage_featured_experiences_subtitle", "homepage_testimonials_eyebrow" = l."homepage_testimonials_eyebrow", "homepage_testimonials_title" = l."homepage_testimonials_title", "homepage_testimonials_subtitle" = l."homepage_testimonials_subtitle", "homepage_team_eyebrow" = l."homepage_team_eyebrow", "homepage_team_title" = l."homepage_team_title", "homepage_team_subtitle" = l."homepage_team_subtitle", "homepage_team_action_label" = l."homepage_team_action_label", "homepage_why_us_eyebrow" = l."homepage_why_us_eyebrow", "homepage_why_us_title" = l."homepage_why_us_title", "homepage_why_us_subtitle" = l."homepage_why_us_subtitle", "homepage_blog_eyebrow" = l."homepage_blog_eyebrow", "homepage_blog_title" = l."homepage_blog_title", "homepage_blog_subtitle" = l."homepage_blog_subtitle", "homepage_blog_action_label" = l."homepage_blog_action_label", "homepage_newsletter_title" = l."homepage_newsletter_title", "homepage_newsletter_subtitle" = l."homepage_newsletter_subtitle"
    FROM "site_settings_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "site_settings_homepage_hero_trust_items" b SET "label" = l."label", "hint" = l."hint"
    FROM "site_settings_homepage_hero_trust_items_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
  UPDATE "site_settings_homepage_why_us_items" b SET "title" = l."title", "body" = l."body"
    FROM "site_settings_homepage_why_us_items_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';`)

  // 3. Restore NOT NULL on required array columns.
  await db.execute(sql`
  ALTER TABLE "site_settings_homepage_hero_trust_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "site_settings_homepage_why_us_items" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "site_settings_homepage_why_us_items" ALTER COLUMN "body" SET NOT NULL;`)

  // 4. Drop the localized columns + array locale tables.
  await db.execute(sql`
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_hero_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_hero_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_hero_body";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_search_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_search_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_search_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_who_we_are_heading";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_who_we_are_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_who_we_are_body";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_who_we_are_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_tours_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_tours_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_tours_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_tours_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_tours_tab_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_cruises_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_cruises_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_cruises_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_cruises_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_destinations_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_destinations_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_destinations_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_destinations_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_free_tours_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_free_tours_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_free_tours_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_free_tours_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_experiences_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_experiences_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_featured_experiences_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_testimonials_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_testimonials_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_testimonials_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_team_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_team_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_team_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_team_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_why_us_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_why_us_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_why_us_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_blog_eyebrow";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_blog_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_blog_subtitle";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_blog_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_newsletter_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "homepage_newsletter_subtitle";
  ALTER TABLE "site_settings_homepage_hero_trust_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_homepage_why_us_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_homepage_hero_trust_items_locales" CASCADE;
  DROP TABLE "site_settings_homepage_why_us_items_locales" CASCADE;`)
}
