import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Media } from "@/collections/payload/Media";
import { Users } from "@/collections/payload/Users";
import { migrations } from "@/migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUrl = process.env.DATABASE_URL || "postgres://payload:payload@localhost:5432/travel_agency";
const payloadSecret =
  process.env.PAYLOAD_SECRET || "local-development-payload-secret-change-before-production";

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, "src/app/(payload)"),
      importMapFile: path.resolve(dirname, "src/app/(payload)/admin/importMap.js")
    }
  },
  collections: [Users, Media],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "src/migrations"),
    pool: {
      connectionString: databaseUrl
    },
    prodMigrations: migrations,
    push: false
  }),
  editor: lexicalEditor(),
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts")
  }
});
