import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_navigation_items_children_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum_navigation_items_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum_navigation_location" AS ENUM('header', 'footer');
  CREATE TYPE "public"."enum_navigation_status" AS ENUM('draft', 'published');
  CREATE TABLE "navigation_items_children" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "href" varchar NOT NULL,
    "target" "enum_navigation_items_children_target" DEFAULT '_self'
  );

  CREATE TABLE "navigation_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "href" varchar,
    "target" "enum_navigation_items_target" DEFAULT '_self'
  );

  CREATE TABLE "navigation" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "location" "enum_navigation_location" NOT NULL,
    "status" "enum_navigation_status" DEFAULT 'published' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "navigation_id" integer;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "navigation_items_children_order_idx" ON "navigation_items_children" USING btree ("_order");
  CREATE INDEX "navigation_items_children_parent_id_idx" ON "navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_location_idx" ON "navigation" USING btree ("location");
  CREATE INDEX "navigation_status_idx" ON "navigation" USING btree ("status");
  CREATE INDEX "navigation_updated_at_idx" ON "navigation" USING btree ("updated_at");
  CREATE INDEX "navigation_created_at_idx" ON "navigation" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_fk" FOREIGN KEY ("navigation_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_navigation_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "navigation_items_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "navigation_items_children" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_navigation_fk";

  DROP INDEX "payload_locked_documents_rels_navigation_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "navigation_id";
  DROP TYPE "public"."enum_navigation_items_children_target";
  DROP TYPE "public"."enum_navigation_items_target";
  DROP TYPE "public"."enum_navigation_location";
  DROP TYPE "public"."enum_navigation_status";`)
}
