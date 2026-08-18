import { AwsClient } from "aws4fetch";

const MAX_OBJECT_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

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
}): Promise<{ uploadUrl: string; publicUrl: string; maxBytes: number }> {
  const cfg = config();
  if (!cfg) throw new Error("Object storage is not configured");
  const mime = input.contentType || "video/mp4";
  if (!mime.startsWith("video/")) throw new Error("Only video files can be uploaded here");
  const key = `lectures/${input.userId}/${Date.now().toString(36)}-${safeName(input.filename)}`;
  const target = objectPutUrl(cfg.endpoint, cfg.bucket, key);
  const client = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    region: cfg.region,
    service: "s3",
  });
  const signed = await client.sign(new Request(target, { method: "PUT" }), {
    aws: { signQuery: true },
  });
  return {
    uploadUrl: signed.url,
    publicUrl: `${cfg.publicBase}/${key}`,
    maxBytes: MAX_OBJECT_BYTES,
  };
}
