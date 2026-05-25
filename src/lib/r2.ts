import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/config/env";

let _client: S3Client | undefined;

function getClient(): S3Client {
  if (!_client) {
    const env = getEnv();
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

export function r2Bucket(): string {
  return getEnv().R2_BUCKET;
}

export function r2PublicUrl(key: string): string {
  return `${getEnv().R2_PUBLIC_URL}/${key}`;
}

export async function createSignedPutUrl(key: string, mimeType: string, expiresIn = 300): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: r2Bucket(), Key: key, ContentType: mimeType });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

export async function r2GetObject(key: string): Promise<Buffer> {
  const cmd = new GetObjectCommand({ Bucket: r2Bucket(), Key: key });
  const res = await getClient().send(cmd);
  if (!res.Body) throw new Error(`No body for R2 key: ${key}`);
  return Buffer.from(await res.Body.transformToByteArray());
}

export async function r2PutObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const cmd = new PutObjectCommand({ Bucket: r2Bucket(), Key: key, Body: body, ContentType: contentType });
  await getClient().send(cmd);
}
