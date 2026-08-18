import { isAccessActive } from "@/lib/access";
import { getSessionUser } from "@/lib/auth/verify.server";
import { loadAllCourses } from "@/lib/catalog-service";
import { getSql } from "@/lib/db";
import { canAdmin, canTeach, ensureProfile } from "@/lib/roles";

const PROTECTED = new Set(["pdf", "ppt", "scorm", "download"]);

function mimeFromName(url: string): string {
  const path = url.split("?")[0] ?? url;
  if (/\.pdf$/i.test(path)) return "application/pdf";
  if (/\.pptx?$/i.test(path)) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (/\.html?$/i.test(path)) return "text/html";
  if (/\.zip$/i.test(path)) return "application/zip";
  return "application/octet-stream";
}

export function isProtectedLessonKind(kind: string | undefined): boolean {
  return PROTECTED.has(kind ?? "");
}

async function canViewLesson(input: {
  userId: string | null;
  courseSlug: string;
  ownerId: string | null;
  preview: boolean;
}): Promise<boolean> {
  if (input.preview) return true;
  if (!input.userId) return false;
  const profile = await ensureProfile(input.userId);
  if (canAdmin(profile.role)) return true;
  if (canTeach(profile.role) && input.ownerId === input.userId) return true;
  const sql = await getSql();
  const rows = await sql<{ expires_at: string | null }>`
    select expires_at::text from enrollments
    where user_id = ${input.userId} and course_slug = ${input.courseSlug}
  `;
  return Boolean(rows[0] && isAccessActive(rows[0].expires_at));
}

async function readMediaAsset(id: string): Promise<{ bytes: Uint8Array; mime: string } | null> {
  const sql = await getSql();
  const rows = await sql<{ mime: string; bytes: Uint8Array | string }>`
    select mime, bytes from media_assets where id = ${id}
  `;
  const row = rows[0];
  if (!row) return null;
  if (typeof row.bytes === "string") {
    const binary = atob(row.bytes);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return { bytes: out, mime: row.mime };
  }
  return { bytes: row.bytes instanceof Uint8Array ? row.bytes : new Uint8Array(row.bytes), mime: row.mime };
}

function allowedRemote(url: string): boolean {
  const publicBase = process.env.S3_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (publicBase && url.startsWith(publicBase)) return true;
  if (url.startsWith("/api/media/")) return true;
  return false;
}

async function fetchRemote(url: string): Promise<{ bytes: Uint8Array; mime: string } | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  const buffer = new Uint8Array(await response.arrayBuffer());
  const mime = response.headers.get("content-type") || mimeFromName(url);
  return { bytes: buffer, mime };
}

export async function loadProtectedLessonFile(input: {
  courseSlug: string;
  lessonSlug: string;
}): Promise<{ bytes: Uint8Array; mime: string } | { error: string; status: number }> {
  const user = await getSessionUser();
  const courses = await loadAllCourses();
  const course = courses.find((item) => item.slug === input.courseSlug);
  const lesson = course?.lessons.find((item) => item.slug === input.lessonSlug);
  if (!course || !lesson) return { error: "Not found", status: 404 };

  const allowed = await canViewLesson({
    userId: user?.id ?? null,
    courseSlug: course.slug,
    ownerId: course.ownerId,
    preview: lesson.preview,
  });
  if (!allowed) return { error: "Forbidden", status: 403 };

  const raw = lesson.content?.fileUrl || lesson.sources[0]?.src || "";
  if (!raw) return { error: "No file", status: 404 };

  const mediaId = raw.match(/^\/api\/media\/([^/?#]+)/)?.[1];
  if (mediaId) {
    const asset = await readMediaAsset(mediaId);
    if (!asset) return { error: "Not found", status: 404 };
    return asset;
  }

  if (!allowedRemote(raw)) return { error: "File is not available in the viewer", status: 400 };
  const remote = await fetchRemote(raw);
  if (!remote) return { error: "Could not load file", status: 502 };
  return remote;
}
