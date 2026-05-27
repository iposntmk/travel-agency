import { readFileSync } from "node:fs";
import path from "node:path";
import {
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  S3Client
} from "@aws-sdk/client-s3";

const DESIRED_CACHE_CONTROL = "public, max-age=31536000, immutable";

function loadEnv() {
  const file = path.resolve(process.cwd(), ".env");
  const raw = readFileSync(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
  console.error("Missing R2_* env vars in .env");
  process.exit(1);
}

const apply = process.argv.includes("--apply");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey }
});

interface Summary {
  scanned: number;
  alreadyOk: number;
  needsUpdate: number;
  updated: number;
  skipped: number;
  errors: number;
}

async function listAllKeys(): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const res: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken
      })
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

async function inspectAndMaybeUpdate(key: string, summary: Summary): Promise<void> {
  let head;
  try {
    head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  } catch (err) {
    summary.errors += 1;
    console.error(`HEAD failed for ${key}:`, (err as Error).message);
    return;
  }

  const current = head.CacheControl ?? "";
  summary.scanned += 1;

  if (current === DESIRED_CACHE_CONTROL) {
    summary.alreadyOk += 1;
    return;
  }

  summary.needsUpdate += 1;
  const contentType = head.ContentType ?? "application/octet-stream";
  const sizeMb = head.ContentLength ? (head.ContentLength / (1024 * 1024)).toFixed(2) : "?";

  console.log(
    `[${apply ? "APPLY" : "DRY"}] ${key} (${contentType}, ${sizeMb} MB)\n` +
      `        cache-control: "${current}" -> "${DESIRED_CACHE_CONTROL}"`
  );

  if (!apply) return;

  try {
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: key,
        CopySource: `${bucket}/${encodeURIComponent(key)}`,
        MetadataDirective: "REPLACE",
        CacheControl: DESIRED_CACHE_CONTROL,
        ContentType: contentType
      })
    );
    summary.updated += 1;
  } catch (err) {
    summary.errors += 1;
    console.error(`COPY failed for ${key}:`, (err as Error).message);
  }
}

async function main() {
  console.log(`Bucket: ${bucket}`);
  console.log(`Mode: ${apply ? "APPLY (will rewrite metadata)" : "DRY-RUN (no writes)"}`);
  console.log(`Desired Cache-Control: ${DESIRED_CACHE_CONTROL}`);
  console.log("---");

  const keys = await listAllKeys();
  console.log(`Found ${keys.length} object(s) in bucket\n`);

  const summary: Summary = {
    scanned: 0,
    alreadyOk: 0,
    needsUpdate: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  for (const key of keys) {
    await inspectAndMaybeUpdate(key, summary);
  }

  console.log("\n--- Summary ---");
  console.log(`Scanned:        ${summary.scanned}`);
  console.log(`Already OK:     ${summary.alreadyOk}`);
  console.log(`Needs update:   ${summary.needsUpdate}`);
  if (apply) console.log(`Updated:        ${summary.updated}`);
  console.log(`Errors:         ${summary.errors}`);

  if (!apply && summary.needsUpdate > 0) {
    console.log("\nRe-run with `--apply` to write the new Cache-Control header.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
