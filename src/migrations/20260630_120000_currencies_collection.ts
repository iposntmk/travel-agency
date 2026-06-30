import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_currencies_symbol_position" AS ENUM('before', 'after');
  CREATE TABLE "currencies" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "name" varchar NOT NULL,
    "symbol" varchar NOT NULL,
    "rate_to_base" numeric DEFAULT 1 NOT NULL,
    "decimals" numeric DEFAULT 2 NOT NULL,
    "symbol_position" "enum_currencies_symbol_position" DEFAULT 'before' NOT NULL,
    "active" boolean DEFAULT true,
    "is_default" boolean DEFAULT false,
    "sort" numeric DEFAULT 0,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "currencies_id" integer;
  CREATE UNIQUE INDEX "currencies_code_idx" ON "currencies" USING btree ("code");
  CREATE INDEX "currencies_active_idx" ON "currencies" USING btree ("active");
  CREATE INDEX "currencies_sort_idx" ON "currencies" USING btree ("sort");
  CREATE INDEX "currencies_updated_at_idx" ON "currencies" USING btree ("updated_at");
  CREATE INDEX "currencies_created_at_idx" ON "currencies" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_currencies_fk" FOREIGN KEY ("currencies_id") REFERENCES "public"."currencies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_currencies_id_idx" ON "payload_locked_documents_rels" USING btree ("currencies_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "currencies" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "currencies" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_currencies_fk";

  DROP INDEX "payload_locked_documents_rels_currencies_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "currencies_id";
  DROP TYPE "public"."enum_currencies_symbol_position";`)
}
