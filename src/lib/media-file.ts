/** Client-side image compression and video upload helpers. */

export const MAX_VIDEO_BYTES = 4 * 1024 * 1024;

export async function compressImageFile(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (dataUrl.length > 550_000) {
    return canvas.toDataURL("image/jpeg", 0.65);
  }
  return dataUrl;
}

export async function uploadVideoFile(file: File, bearerToken?: string | null): Promise<string> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Clips up to 4 MB can be uploaded here. For longer films, paste a hosted MP4 or YouTube URL.");
  }
  const body = new FormData();
  body.append("file", file);
  const headers = new Headers();
  if (bearerToken) headers.set("Authorization", `Bearer ${bearerToken}`);
  const response = await fetch("/api/media/upload", {
    method: "POST",
    body,
    credentials: "include",
    headers,
  });
  const payload = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.message ?? "Could not upload that video");
  }
  return payload.url;
}
