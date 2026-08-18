import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getCourse } from "@/data/catalog";

async function courseExists(slug: string): Promise<boolean> {
  if (getCourse(slug)) return true;
  const sql = await getSql();
  const row = await sql<{ slug: string }>`
    select slug from studio_courses where slug = ${slug} limit 1
  `;
  return Boolean(row[0]);
}

export type ProgressRow = {
  courseSlug: string;
  lessonSlug: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
};

export type LibraryItem = {
  courseSlug: string;
  enrolledAt: string;
  completedLessons: number;
  lastLessonSlug: string | null;
  lastPosition: number;
  bookmarked: boolean;
};

const courseSlugSchema = z.object({ courseSlug: z.string().min(1) });
const lessonKeySchema = z.object({
  courseSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
});

export const enrollInCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => courseSlugSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!(await courseExists(data.courseSlug))) throw new Error("Course not found");
    const sql = await getSql();
    await sql`
      insert into enrollments (user_id, course_slug)
      values (${context.userId}, ${data.courseSlug})
      on conflict (user_id, course_slug) do nothing
    `;
    return { ok: true as const };
  });

export const toggleBookmark = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => courseSlugSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!(await courseExists(data.courseSlug))) throw new Error("Course not found");
    const sql = await getSql();
    const existing = await sql<{ course_slug: string }>`
      select course_slug from bookmarks
      where user_id = ${context.userId} and course_slug = ${data.courseSlug}
    `;
    if (existing.length) {
      await sql`
        delete from bookmarks
        where user_id = ${context.userId} and course_slug = ${data.courseSlug}
      `;
      return { bookmarked: false };
    }
    await sql`
      insert into bookmarks (user_id, course_slug)
      values (${context.userId}, ${data.courseSlug})
    `;
    return { bookmarked: true };
  });

export const saveProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        courseSlug: z.string().min(1),
        lessonSlug: z.string().min(1),
        positionSeconds: z.number().int().min(0),
        durationSeconds: z.number().int().min(0),
        completed: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into enrollments (user_id, course_slug)
      values (${context.userId}, ${data.courseSlug})
      on conflict (user_id, course_slug) do nothing
    `;
    await sql`
      insert into lesson_progress (
        user_id, course_slug, lesson_slug,
        position_seconds, duration_seconds, completed, updated_at
      )
      values (
        ${context.userId}, ${data.courseSlug}, ${data.lessonSlug},
        ${data.positionSeconds}, ${data.durationSeconds}, ${data.completed}, now()
      )
      on conflict (user_id, course_slug, lesson_slug) do update set
        position_seconds = excluded.position_seconds,
        duration_seconds = excluded.duration_seconds,
        completed = (lesson_progress.completed or excluded.completed),
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const saveNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        courseSlug: z.string().min(1),
        lessonSlug: z.string().min(1),
        body: z.string().max(8000),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into lesson_notes (user_id, course_slug, lesson_slug, body, updated_at)
      values (${context.userId}, ${data.courseSlug}, ${data.lessonSlug}, ${data.body}, now())
      on conflict (user_id, course_slug, lesson_slug) do update set
        body = excluded.body,
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const getCourseLearning = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => courseSlugSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const enrolled = await sql<{ enrolled_at: string }>`
      select enrolled_at::text from enrollments
      where user_id = ${context.userId} and course_slug = ${data.courseSlug}
    `;
    const bookmarked = await sql<{ course_slug: string }>`
      select course_slug from bookmarks
      where user_id = ${context.userId} and course_slug = ${data.courseSlug}
    `;
    const progress = await sql<{
      lesson_slug: string;
      position_seconds: number;
      duration_seconds: number;
      completed: boolean;
      updated_at: string;
    }>`
      select lesson_slug, position_seconds, duration_seconds, completed, updated_at::text
      from lesson_progress
      where user_id = ${context.userId} and course_slug = ${data.courseSlug}
    `;
    const notes = await sql<{ lesson_slug: string; body: string }>`
      select lesson_slug, body from lesson_notes
      where user_id = ${context.userId} and course_slug = ${data.courseSlug}
    `;
    return {
      enrolled: enrolled.length > 0,
      bookmarked: bookmarked.length > 0,
      progress: progress.map((row) => ({
        courseSlug: data.courseSlug,
        lessonSlug: row.lesson_slug,
        positionSeconds: row.position_seconds,
        durationSeconds: row.duration_seconds,
        completed: row.completed,
        updatedAt: row.updated_at,
      })) satisfies ProgressRow[],
      notes: Object.fromEntries(notes.map((row) => [row.lesson_slug, row.body])) as Record<
        string,
        string
      >,
    };
  });

export const getLibrary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const enrolled = await sql<{ course_slug: string; enrolled_at: string }>`
      select course_slug, enrolled_at::text
      from enrollments
      where user_id = ${context.userId}
      order by enrolled_at desc
    `;
    const bookmarks = await sql<{ course_slug: string }>`
      select course_slug from bookmarks where user_id = ${context.userId}
    `;
    const bookmarkedSet = new Set(bookmarks.map((row) => row.course_slug));
    const progress = await sql<{
      course_slug: string;
      lesson_slug: string;
      position_seconds: number;
      completed: boolean;
      updated_at: string;
    }>`
      select course_slug, lesson_slug, position_seconds, completed, updated_at::text
      from lesson_progress
      where user_id = ${context.userId}
      order by updated_at desc
    `;

    const byCourse = new Map<string, typeof progress>();
    for (const row of progress) {
      const list = byCourse.get(row.course_slug) ?? [];
      list.push(row);
      byCourse.set(row.course_slug, list);
    }

    const enrolledSlugs = new Set(enrolled.map((row) => row.course_slug));
    const items: LibraryItem[] = [];

    for (const row of enrolled) {
      const rows = byCourse.get(row.course_slug) ?? [];
      const latest = rows[0];
      items.push({
        courseSlug: row.course_slug,
        enrolledAt: row.enrolled_at,
        completedLessons: rows.filter((item) => item.completed).length,
        lastLessonSlug: latest?.lesson_slug ?? null,
        lastPosition: latest?.position_seconds ?? 0,
        bookmarked: bookmarkedSet.has(row.course_slug),
      });
    }

    for (const slug of bookmarkedSet) {
      if (enrolledSlugs.has(slug)) continue;
      const rows = byCourse.get(slug) ?? [];
      const latest = rows[0];
      items.push({
        courseSlug: slug,
        enrolledAt: "",
        completedLessons: rows.filter((item) => item.completed).length,
        lastLessonSlug: latest?.lesson_slug ?? null,
        lastPosition: latest?.position_seconds ?? 0,
        bookmarked: true,
      });
    }

    return items;
  });

export const getContinueWatching = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      course_slug: string;
      lesson_slug: string;
      position_seconds: number;
      duration_seconds: number;
      completed: boolean;
    }>`
      select course_slug, lesson_slug, position_seconds, duration_seconds, completed
      from lesson_progress
      where user_id = ${context.userId}
      order by updated_at desc
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      courseSlug: row.course_slug,
      lessonSlug: row.lesson_slug,
      positionSeconds: row.position_seconds,
      durationSeconds: row.duration_seconds,
      completed: row.completed,
    };
  });

export const getLessonNote = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => lessonKeySchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ body: string }>`
      select body from lesson_notes
      where user_id = ${context.userId}
        and course_slug = ${data.courseSlug}
        and lesson_slug = ${data.lessonSlug}
    `;
    return rows[0]?.body ?? "";
  });

export type ProgressOverview = {
  enrolledCourses: number;
  startedLessons: number;
  completedLessons: number;
  watchedSeconds: number;
};

export const getProgressOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ProgressOverview> => {
    const sql = await getSql();
    const enrolled = await sql<{ n: number | string }>`
      select count(*)::int as n from enrollments where user_id = ${context.userId}
    `;
    const lessons = await sql<{
      started: number | string;
      completed: number | string;
      watched: number | string;
    }>`
      select
        count(*)::int as started,
        count(*) filter (where completed)::int as completed,
        coalesce(
          sum(
            case
              when completed then greatest(duration_seconds, position_seconds)
              else position_seconds
            end
          ),
          0
        )::int as watched
      from lesson_progress
      where user_id = ${context.userId}
    `;
    return {
      enrolledCourses: Number(enrolled[0]?.n ?? 0),
      startedLessons: Number(lessons[0]?.started ?? 0),
      completedLessons: Number(lessons[0]?.completed ?? 0),
      watchedSeconds: Number(lessons[0]?.watched ?? 0),
    };
  });

export const markLessonComplete = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => lessonKeySchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into enrollments (user_id, course_slug)
      values (${context.userId}, ${data.courseSlug})
      on conflict (user_id, course_slug) do nothing
    `;
    await sql`
      insert into lesson_progress (
        user_id, course_slug, lesson_slug,
        position_seconds, duration_seconds, completed, updated_at
      )
      values (
        ${context.userId}, ${data.courseSlug}, ${data.lessonSlug},
        0, 0, true, now()
      )
      on conflict (user_id, course_slug, lesson_slug) do update set
        completed = true,
        updated_at = now()
    `;
    return { ok: true as const };
  });

