import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'sales';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "users" SET "role" = 'editor' WHERE "role" = 'sales';
    ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::text;
    DROP TYPE "public"."enum_users_role";
    CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::"public"."enum_users_role";
    ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  `);
}
