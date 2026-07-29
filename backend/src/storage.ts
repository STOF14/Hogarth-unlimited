import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env.js";

// Thin wrapper around the S3-compatible client (Cloudflare R2 in prod).
// Keeping this as the *only* module that imports the AWS SDK means if you
// ever swap providers, this is the sole file that changes.

const client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

const PRESIGNED_URL_TTL_SECONDS = 60 * 10; // 10 minutes — long enough for a page load, short enough to not leak.

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteObject(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}

/** Deletes every object under a key prefix (e.g. all pages for a deleted comic). */
export async function deletePrefix(prefix: string): Promise<void> {
  let continuationToken: string | undefined;
  do {
    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: env.S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    const keys = (listed.Contents ?? []).map((o) => o.Key).filter((k): k is string => !!k);
    await Promise.all(keys.map((key) => deleteObject(key)));
    continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (continuationToken);
}

/**
 * Returns a URL the browser can fetch an object from directly.
 * If S3_PUBLIC_BASE_URL is set (e.g. R2 behind a custom domain / CDN), we
 * return a plain public URL — cacheable, no per-request signing cost.
 * Otherwise we fall back to a short-lived presigned URL.
 */
export async function getObjectUrl(key: string): Promise<string> {
  if (env.S3_PUBLIC_BASE_URL) {
    return `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
  return getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });
}
