import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Bookings } from "@/collections/payload/Bookings";
import { Comments } from "@/collections/payload/Comments";
import { Customers } from "@/collections/payload/Customers";
import { Destinations } from "@/collections/payload/Destinations";
import { Media } from "@/collections/payload/Media";
import { Partners } from "@/collections/payload/Partners";
import { Payments } from "@/collections/payload/Payments";
import { Posts } from "@/collections/payload/Posts";
import { Promotions } from "@/collections/payload/Promotions";
import { Reviews } from "@/collections/payload/Reviews";
import { Tours } from "@/collections/payload/Tours";
import { Users } from "@/collections/payload/Users";
import { getPayloadConfigEnv, getPayloadStorageEnv } from "@/config/env";
import { migrations } from "@/migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const env = getPayloadConfigEnv();
const storageEnv = getPayloadStorageEnv();

export default buildConfig({
  serverURL: process.env.DEV_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  cors: [
    ...new Set([
      process.env.DEV_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "http://localhost:3000",
      ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
      ...(process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : [])
    ])
  ],
  csrf: [
    ...new Set([
      process.env.DEV_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "http://localhost:3000", 
      ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
      ...(process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : [])
    ])
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, "src/app/(payload)"),
      importMapFile: path.resolve(dirname, "src/app/(payload)/admin/importMap.js")
    }
  },
  collections: [
    Users,
    Media,
    Destinations,
    Partners,
    Tours,
    Customers,
    Bookings,
    Posts,
    Comments,
    Reviews,
    Promotions,
    Payments
  ],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "src/migrations"),
    pool: {
      connectionString: env.DATABASE_URL
    },
    prodMigrations: migrations,
    push: false
  }),
  editor: lexicalEditor(),
  plugins: [
    ...(storageEnv
      ? [
          s3Storage({
            bucket: storageEnv.R2_BUCKET,
            clientUploads: true,
            collections: {
              media: true
            },
            config: {
              credentials: {
                accessKeyId: storageEnv.R2_ACCESS_KEY_ID,
                secretAccessKey: storageEnv.R2_SECRET_ACCESS_KEY
              },
              endpoint: `https://${storageEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
              forcePathStyle: true,
              region: "auto"
            }
          })
        ]
      : [])
  ],
  secret: env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts")
  }
});
