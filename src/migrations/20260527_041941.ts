import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_affiliate_clicks_target_type" AS ENUM('addon', 'ota');
  CREATE TABLE "affiliate_clicks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"target_type" "enum_affiliate_clicks_target_type" NOT NULL,
  	"target_id" varchar NOT NULL,
  	"target_url" varchar NOT NULL,
  	"source" varchar NOT NULL,
  	"referrer" varchar,
  	"user_agent" varchar,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_clicks_id" integer;
  CREATE INDEX "affiliate_clicks_target_type_idx" ON "affiliate_clicks" USING btree ("target_type");
  CREATE INDEX "affiliate_clicks_target_id_idx" ON "affiliate_clicks" USING btree ("target_id");
  CREATE INDEX "affiliate_clicks_source_idx" ON "affiliate_clicks" USING btree ("source");
  CREATE INDEX "affiliate_clicks_updated_at_idx" ON "affiliate_clicks" USING btree ("updated_at");
  CREATE INDEX "affiliate_clicks_created_at_idx" ON "affiliate_clicks" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_clicks_fk" FOREIGN KEY ("affiliate_clicks_id") REFERENCES "public"."affiliate_clicks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_affiliate_clicks_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_clicks_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "affiliate_clicks" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "affiliate_clicks" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_affiliate_clicks_fk";
  
  DROP INDEX "payload_locked_documents_rels_affiliate_clicks_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "affiliate_clicks_id";
  DROP TYPE "public"."enum_affiliate_clicks_target_type";`)
}
