import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { expiryFromDays, isAccessActive, daysLeft } from "@/lib/access";
import { resolveVideoSources } from "@/data/media";
import { getCourse as getSeedCourse } from "@/data/catalog";
import { authMiddleware } from "@/lib/auth/middleware";
import { loadAllCourses } from "@/lib/catalog-service";
import { getSql } from "@/lib/db";
import { canAdmin, canTeach, ensureProfile } from "@/lib/roles";
import { slugify } from "@/lib/utils";

const courseInput = z.object({
  title: z.string().min(3).max(80),
  subtitle: z.string().max(160),
  description: z.string().max(8000),
  category: z.enum([
    "Fisco e tasse",
    "CAF e Patronato",
    "Lingua italiana",
    "Patente B",
    "Immigrazione",
    "Lavoro e impresa",
  ]),
  level: z.enum(["Foundations", "Intermediate", "Advanced"]),
  poster: z.string().min(1).max(700_000),
  instructorName: z.string().min(2).max(80),
  instructorTitle: z.string().max(80),
  instructorBio: z.string().max(600),
  published: z.boolean(),
  accessDays: z.number().int().min(0).max(3650).optional().default(0),
});

const lessonInput = z.object({
  title: z.string().min(2).max(80),
  summary: z.string().max(240),
  transcript: z.string().max(8000),
  videoId: z.string().min(1),
  customUrl: z.string().max(2000).optional().default(""),
  preview: z.boolean(),
  durationSeconds: z.number().int().min(0).max(72000).optional().default(0),
});

async function assertCanEdit(userId: string, slug: string) {
  const profile = await ensureProfile(userId);
  if (canAdmin(profile.role)) return profile;
  if (!canTeach(profile.role)) throw new Error("Forbidden");
  const sql = await getSql();
  const rows = await sql<{ owner_id: string }>`
    select owner_id from studio_courses where slug = ${slug}
  `;
  if (!rows[0] || rows[0].owner_id !== userId) throw new Error("Forbidden");
  return profile;
}

export const listMyStudioCourses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const profile = await ensureProfile(context.userId);
    if (!canTeach(profile.role)) throw new Error("Forbidden");
    const all = await loadAllCourses();
    const mine = canAdmin(profile.role)
      ? all.filter((course) => course.source === "studio")
      : all.filter((course) => course.ownerId === context.userId);
    const sql = await getSql();
    const counts = await sql<{ course_slug: string; n: number }>`
      select course_slug, count(*)::int as n from enrollments group by course_slug
    `;
    const countMap = new Map(counts.map((row) => [row.course_slug, row.n]));
    return mine.map((course) => ({
      ...course,
      students: countMap.get(course.slug) ?? 0,
    }));
  });

export const createStudioCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => courseInput.parse(input))
  .handler(async ({ context, data }) => {
    const profile = await ensureProfile(context.userId);
    if (!canTeach(profile.role)) throw new Error("Forbidden");
    const sql = await getSql();
    const base = slugify(data.title);
    let slug = base;
    for (let i = 0; i < 8; i += 1) {
      const exists =
        (await sql<{ slug: string }>`select slug from studio_courses where slug = ${slug}`)[0] ||
        (await loadAllCourses()).find((course) => course.slug === slug);
      if (!exists) break;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    await sql`
      insert into studio_courses (
        slug, owner_id, title, subtitle, description, category, level, poster,
        instructor_name, instructor_title, instructor_bio, published, featured, access_days
      ) values (
        ${slug}, ${context.userId}, ${data.title.trim()}, ${data.subtitle.trim()},
        ${data.description.trim()}, ${data.category}, ${data.level}, ${data.poster},
        ${data.instructorName.trim()}, ${data.instructorTitle.trim()}, ${data.instructorBio.trim()},
        ${data.published}, false, ${data.accessDays ?? 0}
      )
    `;
    return { slug };
  });

export const updateStudioCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => courseInput.extend({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.slug);
    const sql = await getSql();
    const updated = await sql<{ slug: string }>`
      update studio_courses set
        title = ${data.title.trim()},
        subtitle = ${data.subtitle.trim()},
        description = ${data.description.trim()},
        category = ${data.category},
        level = ${data.level},
        poster = ${data.poster},
        instructor_name = ${data.instructorName.trim()},
        instructor_title = ${data.instructorTitle.trim()},
        instructor_bio = ${data.instructorBio.trim()},
        published = ${data.published},
        access_days = ${data.accessDays ?? 0},
        updated_at = now()
      where slug = ${data.slug}
      returning slug
    `;
    if (!updated[0]) throw new Error("Course not found");
    return { slug: data.slug };
  });

export const adoptPlatformCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const profile = await ensureProfile(context.userId);
    if (!canAdmin(profile.role)) throw new Error("Only an admin can edit catalogue courses");
    const sql = await getSql();
    const existing = await sql<{ slug: string }>`
      select slug from studio_courses where slug = ${data.slug}
    `;
    if (existing[0]) return { slug: data.slug, created: false };
    const seed = getSeedCourse(data.slug);
    if (!seed) throw new Error("That catalogue course was not found");
    await sql`
      insert into studio_courses (
        slug, owner_id, title, subtitle, description, category, level, poster,
        instructor_name, instructor_title, instructor_bio, published, featured, access_days
      ) values (
        ${seed.slug}, ${context.userId}, ${seed.title}, ${seed.subtitle},
        ${seed.description}, ${seed.category}, ${seed.level}, ${seed.poster},
        ${seed.instructor.name}, ${seed.instructor.title}, ${seed.instructor.bio},
        true, ${Boolean(seed.featured)}, 0
      )
    `;
    for (const [index, lesson] of seed.lessons.entries()) {
      await sql`
        insert into studio_lessons (
          course_slug, lesson_slug, sort_order, title, summary, transcript,
          video_json, preview, duration_seconds
        ) values (
          ${seed.slug}, ${lesson.slug}, ${index}, ${lesson.title}, ${lesson.summary},
          ${lesson.transcript}, ${JSON.stringify(lesson.sources)}, ${lesson.preview},
          ${lesson.durationSeconds}
        )
      `;
    }
    return { slug: seed.slug, created: true };
  });

export const deleteStudioCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.slug);
    const sql = await getSql();
    await sql`delete from studio_courses where slug = ${data.slug}`;
    return { ok: true as const };
  });

export const addStudioLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => lessonInput.extend({ courseSlug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.courseSlug);
    const sql = await getSql();
    const last = await sql<{ n: number }>`
      select coalesce(max(sort_order), -1)::int as n from studio_lessons where course_slug = ${data.courseSlug}
    `;
    const base = slugify(data.title);
    let lessonSlug = base;
    for (let i = 0; i < 6; i += 1) {
      const clash = await sql<{ lesson_slug: string }>`
        select lesson_slug from studio_lessons
        where course_slug = ${data.courseSlug} and lesson_slug = ${lessonSlug}
      `;
      if (!clash[0]) break;
      lessonSlug = `${base}-${i + 2}`;
    }
    const sources = JSON.stringify(resolveVideoSources(data.videoId, data.customUrl));
    await sql`
      insert into studio_lessons (
        course_slug, lesson_slug, sort_order, title, summary, transcript, video_json, preview, duration_seconds
      ) values (
        ${data.courseSlug}, ${lessonSlug}, ${(last[0]?.n ?? -1) + 1},
        ${data.title.trim()}, ${data.summary.trim()}, ${data.transcript.trim()},
        ${sources}, ${data.preview}, ${data.durationSeconds ?? 0}
      )
    `;
    return { lessonSlug };
  });

export const updateStudioLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    lessonInput.extend({ courseSlug: z.string().min(1), lessonSlug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.courseSlug);
    const sql = await getSql();
    const sources = JSON.stringify(resolveVideoSources(data.videoId, data.customUrl));
    await sql`
      update studio_lessons set
        title = ${data.title.trim()},
        summary = ${data.summary.trim()},
        transcript = ${data.transcript.trim()},
        video_json = ${sources},
        preview = ${data.preview},
        duration_seconds = ${data.durationSeconds ?? 0}
      where course_slug = ${data.courseSlug} and lesson_slug = ${data.lessonSlug}
    `;
    return { ok: true as const };
  });

export const deleteStudioLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ courseSlug: z.string().min(1), lessonSlug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.courseSlug);
    const sql = await getSql();
    await sql`
      delete from studio_lessons
      where course_slug = ${data.courseSlug} and lesson_slug = ${data.lessonSlug}
    `;
    return { ok: true as const };
  });

export const setCourseFlags = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        published: z.boolean(),
        featured: z.boolean(),
        accessDays: z.number().int().min(0).max(3650).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const profile = await ensureProfile(context.userId);
    if (!canAdmin(profile.role)) throw new Error("Forbidden");
    const sql = await getSql();
    const studio = await sql<{ slug: string }>`select slug from studio_courses where slug = ${data.slug}`;
    if (studio[0]) {
      if (data.accessDays === undefined) {
        await sql`
          update studio_courses
          set published = ${data.published}, featured = ${data.featured}, updated_at = now()
          where slug = ${data.slug}
        `;
      } else {
        await sql`
          update studio_courses
          set published = ${data.published}, featured = ${data.featured},
              access_days = ${data.accessDays}, updated_at = now()
          where slug = ${data.slug}
        `;
      }
    } else {
      await sql`
        insert into course_overrides (course_slug, published, featured, access_days)
        values (${data.slug}, ${data.published}, ${data.featured}, ${data.accessDays ?? 0})
        on conflict (course_slug) do update set
          published = excluded.published,
          featured = excluded.featured,
          access_days = coalesce(excluded.access_days, course_overrides.access_days)
      `;
    }
    return { ok: true as const };
  });

export const listAdminCourses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const profile = await ensureProfile(context.userId);
    if (!canAdmin(profile.role)) throw new Error("Forbidden");
    const all = await loadAllCourses();
    const sql = await getSql();
    const counts = await sql<{ course_slug: string; n: number }>`
      select course_slug, count(*)::int as n from enrollments group by course_slug
    `;
    const countMap = new Map(counts.map((row) => [row.course_slug, row.n]));
    return all.map((course) => ({
      slug: course.slug,
      title: course.title,
      source: course.source,
      ownerId: course.ownerId,
      published: course.published,
      featured: Boolean(course.featured),
      lessons: course.lessons.length,
      students: countMap.get(course.slug) ?? 0,
      instructor: course.instructor.name,
    }));
  });

export const getTeacherStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const profile = await ensureProfile(context.userId);
    if (!canTeach(profile.role)) throw new Error("Forbidden");
    const sql = await getSql();
    const mine = canAdmin(profile.role)
      ? await sql<{ slug: string }>`select slug from studio_courses`
      : await sql<{ slug: string }>`select slug from studio_courses where owner_id = ${context.userId}`;
    const slugs = mine.map((row) => row.slug);
    if (!slugs.length) {
      return { courses: 0, published: 0, students: 0, lessons: 0 };
    }
    const publishedCount = canAdmin(profile.role)
      ? ((await sql<{ n: number }>`select count(*)::int as n from studio_courses where published = true`)[0]?.n ?? 0)
      : ((
          await sql<{ n: number }>`
            select count(*)::int as n from studio_courses
            where published = true and owner_id = ${context.userId}
          `
        )[0]?.n ?? 0);
    const lessonCount = canAdmin(profile.role)
      ? ((await sql<{ n: number }>`select count(*)::int as n from studio_lessons`)[0]?.n ?? 0)
      : ((
          await sql<{ n: number }>`
            select count(*)::int as n from studio_lessons
            where course_slug in (select slug from studio_courses where owner_id = ${context.userId})
          `
        )[0]?.n ?? 0);
    const students = canAdmin(profile.role)
      ? await sql<{ n: number }>`
          select count(distinct user_id)::int as n from enrollments
          where course_slug in (select slug from studio_courses)
        `
      : await sql<{ n: number }>`
          select count(distinct user_id)::int as n from enrollments
          where course_slug in (select slug from studio_courses where owner_id = ${context.userId})
        `;
    return {
      courses: slugs.length,
      published: publishedCount,
      students: students[0]?.n ?? 0,
      lessons: lessonCount,
    };
  });

export const getStudioCourse = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.slug);
    const all = await loadAllCourses();
    return all.find((course) => course.slug === data.slug && course.source === "studio") ?? null;
  });

export const setStudioPublished = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ slug: z.string().min(1), published: z.boolean() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.slug);
    const sql = await getSql();
    const updated = await sql<{ slug: string }>`
      update studio_courses
      set published = ${data.published}, updated_at = now()
      where slug = ${data.slug}
      returning slug
    `;
    if (!updated[0]) throw new Error("Course not found");
    return { published: data.published };
  });

export const reorderStudioLessons = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        courseSlug: z.string().min(1),
        lessonSlugs: z.array(z.string().min(1)).min(1),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.courseSlug);
    const sql = await getSql();
    for (const [index, lessonSlug] of data.lessonSlugs.entries()) {
      await sql`
        update studio_lessons
        set sort_order = ${index}
        where course_slug = ${data.courseSlug} and lesson_slug = ${lessonSlug}
      `;
    }
    return { ok: true as const };
  });

export type CourseStudent = {
  userId: string;
  name: string;
  email: string;
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  lastLessonSlug: string | null;
  lastActive: string | null;
  expiresAt: string | null;
  accessActive: boolean;
  daysRemaining: number | null;
  source: string;
};

export const listCourseStudents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }): Promise<CourseStudent[]> => {
    await assertCanEdit(context.userId, data.slug);
    const sql = await getSql();
    const totalRow = await sql<{ n: number | string }>`
      select count(*)::int as n from studio_lessons where course_slug = ${data.slug}
    `;
    const totalLessons = Number(totalRow[0]?.n ?? 0);
    const enrolled = await sql<{
      user_id: string;
      enrolled_at: string;
      expires_at: string | null;
      source: string;
    }>`
      select user_id, enrolled_at::text as enrolled_at, expires_at::text, coalesce(source, 'self') as source
      from enrollments
      where course_slug = ${data.slug}
      order by enrolled_at desc
    `;
    if (!enrolled.length) return [];

    const progress = await sql<{
      user_id: string;
      completed: number | string;
      last_lesson: string | null;
      last_active: string | null;
    }>`
      select
        user_id,
        count(*) filter (where completed)::int as completed,
        (array_agg(lesson_slug order by updated_at desc))[1] as last_lesson,
        max(updated_at)::text as last_active
      from lesson_progress
      where course_slug = ${data.slug}
      group by user_id
    `;
    const progressByUser = new Map(progress.map((row) => [row.user_id, row]));

    let people: { id: string; name: string; email: string }[] = [];
    try {
      people = await sql<{ id: string; name: string; email: string }>`
        select "id" as id, "name" as name, "email" as email from "user"
      `;
    } catch {
      people = [];
    }
    const personById = new Map(people.map((row) => [row.id, row]));

    return enrolled.map((row) => {
      const person = personById.get(row.user_id);
      const stats = progressByUser.get(row.user_id);
      return {
        userId: row.user_id,
        name: person?.name || "Student",
        email: person?.email || "",
        enrolledAt: row.enrolled_at,
        completedLessons: Number(stats?.completed ?? 0),
        totalLessons,
        lastLessonSlug: stats?.last_lesson ?? null,
        lastActive: stats?.last_active ?? null,
        expiresAt: row.expires_at,
        accessActive: isAccessActive(row.expires_at),
        daysRemaining: daysLeft(row.expires_at),
        source: row.source,
      };
    });
  });

export const enrollStudentByEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        email: z.string().email(),
        accessDays: z.number().int().min(0).max(3650),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.slug);
    const sql = await getSql();
    const people = await sql<{ id: string; email: string }>`
      select "id" as id, "email" as email from "user"
      where lower("email") = ${data.email.trim().toLowerCase()}
    `;
    const student = people[0];
    if (!student) {
      throw new Error("No account with that email. Create the student first, then enroll them.");
    }
    const expires = expiryFromDays(data.accessDays);
    await sql`
      insert into enrollments (user_id, course_slug, access_days, expires_at, source, enrolled_by)
      values (
        ${student.id}, ${data.slug}, ${data.accessDays || null},
        ${expires ? expires.toISOString() : null}, 'manual', ${context.userId}
      )
      on conflict (user_id, course_slug) do update set
        access_days = excluded.access_days,
        expires_at = excluded.expires_at,
        source = 'manual',
        enrolled_by = excluded.enrolled_by,
        enrolled_at = now()
    `;
    return { ok: true as const, userId: student.id };
  });

export const setEnrollmentAccess = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        userId: z.string().min(1),
        accessDays: z.number().int().min(0).max(3650),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.slug);
    const sql = await getSql();
    const expires = expiryFromDays(data.accessDays);
    const updated = await sql<{ user_id: string }>`
      update enrollments
      set access_days = ${data.accessDays || null},
          expires_at = ${expires ? expires.toISOString() : null},
          enrolled_at = now()
      where course_slug = ${data.slug} and user_id = ${data.userId}
      returning user_id
    `;
    if (!updated[0]) throw new Error("Enrollment not found");
    return { ok: true as const };
  });

export const removeEnrollment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ slug: z.string().min(1), userId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertCanEdit(context.userId, data.slug);
    const sql = await getSql();
    await sql`
      delete from enrollments
      where course_slug = ${data.slug} and user_id = ${data.userId}
    `;
    return { ok: true as const };
  });

