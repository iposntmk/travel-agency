import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { AffiliateClicks } from "@/collections/payload/AffiliateClicks";
import { Attractions } from "@/collections/payload/Attractions";
import { Bookings } from "@/collections/payload/Bookings";
import { CarRentals } from "@/collections/payload/CarRentals";
import { Comments } from "@/collections/payload/Comments";
import { Cruises } from "@/collections/payload/Cruises";
import { Currencies } from "@/collections/payload/Currencies";
import { CustomInquiries } from "@/collections/payload/CustomInquiries";
import { Customers } from "@/collections/payload/Customers";
import { Destinations } from "@/collections/payload/Destinations";
import { Experiences } from "@/collections/payload/Experiences";
import { Media } from "@/collections/payload/Media";
import { Navigation } from "@/collections/payload/Navigation";
import { Partners } from "@/collections/payload/Partners";
import { Payments } from "@/collections/payload/Payments";
import { Posts } from "@/collections/payload/Posts";
import { ProductCategories } from "@/collections/payload/ProductCategories";
import { Promotions } from "@/collections/payload/Promotions";
import { Reviews } from "@/collections/payload/Reviews";
import { SiteSettings } from "@/collections/payload/SiteSettings";
import { TeamMembers } from "@/collections/payload/TeamMembers";
import { Tours } from "@/collections/payload/Tours";
import { Translations } from "@/collections/payload/Translations";
import { Users } from "@/collections/payload/Users";
import { Vouchers } from "@/collections/payload/Vouchers";
import { getPayloadConfigEnv, getPayloadStorageEnv } from "@/config/env";
import { migrations } from "@/migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const env = getPayloadConfigEnv();
const storageEnv = getPayloadStorageEnv();
const migrationConnectionString =
  env.PAYLOAD_COMMAND?.startsWith("migrate") || process.argv.some((arg) => arg.includes("migrate"))
    ? (env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL)
    : env.DATABASE_URL;
const originAllowlist = Array.from(
  new Set(
    ["http://localhost:3000", env.NEXT_PUBLIC_SITE_URL, env.DEV_ORIGIN].filter(
      (origin): origin is string => Boolean(origin)
    )
  )
);

export default buildConfig({
  // Leave serverURL empty in dev so the admin panel uses same-origin (relative)
  // URLs. If we hardcode it to DEV_ORIGIN or NEXT_PUBLIC_SITE_URL, accessing the
  // admin from the other origin makes API calls cross-origin and the session
  // cookie doesn't travel — causing "You are not allowed to perform this action"
  // on uploads and other mutations.
  serverURL: env.NODE_ENV === "production" ? (env.NEXT_PUBLIC_SITE_URL ?? "") : "",
  cors: originAllowlist,
  // In production every admin origin is HTTPS (a secure context), so the browser
  // sends Sec-Fetch-* metadata and Payload's CSRF cookie check works. In dev we
  // also serve the admin over plain HTTP on a LAN IP (e.g. http://192.168.2.7:3000),
  // which is NOT a secure context — browsers omit Sec-Fetch-Site there, so Payload's
  // extractJWT drops the auth cookie and the admin redirects back to /login. Leaving
  // csrf empty in dev makes cookie auth work over HTTP-IP. SameSite=Lax cookies still
  // provide baseline CSRF protection. Production keeps the strict allowlist.
  csrf: env.NODE_ENV === "production" ? originAllowlist : [],
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
    ProductCategories,
    Attractions,
    Destinations,
    Partners,
    Tours,
    Cruises,
    CarRentals,
    Customers,
    Bookings,
    CustomInquiries,
    Posts,
    TeamMembers,
    SiteSettings,
    Navigation,
    Comments,
    Reviews,
    Promotions,
    Payments,
    AffiliateClicks,
    Currencies,
    Translations,
    Experiences,
    Vouchers
  ],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, "src/migrations"),
    pool: {
      connectionString: migrationConnectionString,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    },
    prodMigrations: migrations,
    push: false
  }),
  editor: lexicalEditor(),
  localization: {
    // Locale codes are BCP-47 so they map 1:1 to next-intl routing + hreflang.
    // PH/MY/SG/IN are English-speaking markets served by `en` — no separate locale.
    locales: [
      { label: "English", code: "en" },
      { label: "Français", code: "fr" },
      { label: "Español", code: "es" },
      { label: "Deutsch", code: "de" },
      { label: "Italiano", code: "it" },
      { label: "Português", code: "pt" },
      { label: "简体中文", code: "zh-Hans" },
      { label: "繁體中文", code: "zh-Hant" }
    ],
    defaultLocale: "en",
    fallback: true
  },
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
