import { AwsClient } from "aws4fetch";

const MAX_OBJECT_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

const CORS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>https://skillpath-lac.vercel.app</AllowedOrigin>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>`;

function config() {
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const region = process.env.S3_REGION?.trim() || "auto";
  const publicBase = (process.env.S3_PUBLIC_BASE_URL?.trim() || "").replace(/\/$/, "");
  if (!bucket || !accessKeyId || !secretAccessKey || !endpoint || !publicBase) {
    return null;
  }
  return {
    bucket,
    accessKeyId,
    secretAccessKey,
    endpoint: endpoint.replace(/\/$/, ""),
    region,
    publicBase,
  };
}

export function storageEnabled(): boolean {
  return Boolean(config());
}

export function storageLimits() {
  return {
    enabled: storageEnabled(),
    maxBytes: storageEnabled() ? MAX_OBJECT_BYTES : 4 * 1024 * 1024,
  };
}

function safeName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 80) || "lecture.mp4";
}

function clientFor(cfg: NonNullable<ReturnType<typeof config>>): AwsClient {
  return new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    region: cfg.region,
    service: "s3",
  });
}

function objectPutUrl(endpoint: string, bucket: string, key: string): string {
  const base = endpoint.replace(/\/$/, "");
  if (/\.r2\.dev$/i.test(new URL(base).host)) {
    throw new Error(
      "S3_ENDPOINT is the public r2.dev URL. Use the S3 API URL instead (…r2.cloudflarestorage.com).",
    );
  }
  if (base.endsWith(`/${bucket}`)) return `${base}/${key}`;
  return `${base}/${bucket}/${key}`;
}

export async function createLectureUpload(input: {
  userId: string;
  filename: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string; maxBytes: number; host: string }> {
  const cfg = config();
  if (!cfg) throw new Error("Object storage is not configured");
  const mime = input.contentType || "video/mp4";
  if (!mime.startsWith("video/")) throw new Error("Only video files can be uploaded here");
  const key = `lectures/${input.userId}/${Date.now().toString(36)}-${safeName(input.filename)}`;
  const target = objectPutUrl(cfg.endpoint, cfg.bucket, key);
  const signed = await clientFor(cfg).sign(new Request(target, { method: "PUT" }), {
    aws: { signQuery: true },
  });
  return {
    uploadUrl: signed.url,
    publicUrl: `${cfg.publicBase}/${key}`,
    maxBytes: MAX_OBJECT_BYTES,
    host: new URL(target).host,
  };
}

export async function applyBucketCors(): Promise<{ ok: true } | { ok: false; message: string }> {
  const cfg = config();
  if (!cfg) return { ok: false, message: "Object storage is not configured" };
  const url = `${cfg.endpoint.replace(/\/$/, "")}/${cfg.bucket}?cors`;
  const response = await clientFor(cfg).fetch(url, {
    method: "PUT",
    headers: { "content-type": "application/xml" },
    body: CORS_XML,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return {
      ok: false,
      message:
        response.status === 403
          ? "This API token cannot change bucket CORS (Object Read & Write is not enough). Paste the CORS JSON in Cloudflare instead."
          : `R2 CORS update failed (${response.status}). ${text.slice(0, 180)}`,
    };
  }
  return { ok: true };
}
