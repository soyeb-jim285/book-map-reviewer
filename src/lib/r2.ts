import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Config() {
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 credentials are not fully configured");
  }

  return { endpoint, accessKeyId, secretAccessKey, bucket };
}

export function hasR2() {
  return Boolean(
    process.env.CLOUDFLARE_R2_ENDPOINT &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_BUCKET_NAME,
  );
}

export function getR2Client() {
  const config = getR2Config();
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function getAssetSignedUrl(key: string) {
  const { bucket } = getR2Config();
  const seconds = Number(process.env.CLOUDFLARE_R2_SIGNED_URL_EXPIRES_SECONDS ?? 3600);
  return getSignedUrl(getR2Client(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: seconds });
}

export async function uploadAsset(key: string, body: Buffer, contentType: string) {
  const { bucket } = getR2Config();
  await getR2Client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function assetExists(key: string) {
  const { bucket } = getR2Config();
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}
