import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  courses as seedCourses,
  getCourse as getSeedCourse,
  type Category,
  type Course,
  type Lesson,
} from "@/data/catalog";
import { getSql } from "@/lib/db";
import { canAdmin, canTeach, ensureProfile, optionalAuth } from "@/lib/roles";

export type CourseRecord = Course & {
  source: "platform" | "studio";
  ownerId: string | null;
  published: boolean;
  accessDays: number;
};

type StudioCourseRow = {
  slug: string;
  owner_id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  poster: string;
  instructor_name: string;
  instructor_title: string;
  instructor_bio: string;
  published: boolean;
  featured: boolean;
  access_days: number | null;
};

type StudioLessonRow = {
  course_slug: string;
  lesson_slug: string;
  sort_order: number;
  title: string;
  summary: string;
  transcript: string;
  video_json: string;
  preview: boolean;
  duration_seconds: number;
};

function parseLessons(rows: StudioLessonRow[]): Lesson[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => {
      let sources: Lesson["sources"] = [];
      try {
        sources = JSON.parse(row.video_json) as Lesson["sources"];
      } catch {
        sources = [];
      }
      return {
        slug: row.lesson_slug,
        title: row.title,
        durationSeconds: row.duration_seconds,
        sources,
        summary: row.summary,
        transcript: row.transcript,
        preview: row.preview,
      };
    });
}

function studioToCourse(row: StudioCourseRow, lessons: Lesson[]): CourseRecord {
  const name = row.instructor_name;
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category as Category,
    level: row.level as Course["level"],
    poster: row.poster,
    featured: row.featured,
    instructor: {
      name,
      title: row.instructor_title,
      initials: name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? "")
        .join("")
        .toUpperCase(),
      bio: row.instructor_bio,
    },
    lessons,
    source: "studio",
    ownerId: row.owner_id,
    published: row.published,
    accessDays: Number(row.access_days ?? 0) || 0,
  };
}

async function loadStudio(): Promise<CourseRecord[]> {
  const sql = await getSql();
  const courseRows = await sql<StudioCourseRow>`
    select slug, owner_id, title, subtitle, description, category, level, poster,
           instructor_name, instructor_title, instructor_bio, published, featured, access_days
    from studio_courses
  `;
  if (!courseRows.length) return [];
  const slugs = courseRows.map((row) => row.slug);
  const lessonRows = await sql<StudioLessonRow>`
    select course_slug, lesson_slug, sort_order, title, summary, transcript, video_json, preview, duration_seconds
    from studio_lessons
  `;
  const byCourse = new Map<string, StudioLessonRow[]>();
  for (const lesson of lessonRows) {
    if (!slugs.includes(lesson.course_slug)) continue;
    const list = byCourse.get(lesson.course_slug) ?? [];
    list.push(lesson);
    byCourse.set(lesson.course_slug, list);
  }
  return courseRows.map((row) => studioToCourse(row, parseLessons(byCourse.get(row.slug) ?? [])));
}

async function loadOverrides(): Promise<
  Map<string, { published: boolean; featured: boolean; accessDays: number }>
> {
  const sql = await getSql();
  const rows = await sql<{
    course_slug: string;
    published: boolean;
    featured: boolean;
    access_days: number | null;
  }>`
    select course_slug, published, featured, access_days from course_overrides
  `;
  return new Map(
    rows.map((row) => [
      row.course_slug,
      {
        published: row.published,
        featured: row.featured,
        accessDays: Number(row.access_days ?? 0) || 0,
      },
    ]),
  );
}

export async function loadAllCourses(): Promise<CourseRecord[]> {
  const overrides = await loadOverrides();
  const platform: CourseRecord[] = seedCourses.map((course) => {
    const flag = overrides.get(course.slug);
    return {
      ...course,
      source: "platform",
      ownerId: null,
      published: flag?.published ?? true,
      featured: flag?.featured ?? Boolean(course.featured),
      accessDays: flag?.accessDays ?? 0,
    };
  });
  const studio = await loadStudio();
  const bySlug = new Map<string, CourseRecord>();
  for (const course of platform) bySlug.set(course.slug, course);
  for (const course of studio) bySlug.set(course.slug, course);
  return [...bySlug.values()];
}

function canSee(course: CourseRecord, userId: string | null, role: "student" | "teacher" | "admin" | null): boolean {
  if (course.published) return true;
  if (!userId || !role) return false;
  if (canAdmin(role)) return true;
  return canTeach(role) && course.ownerId === userId;
}

export const listVisibleCourses = createServerFn({ method: "GET" })
  .middleware([optionalAuth])
  .handler(async ({ context }) => {
    const all = await loadAllCourses();
    let role: ProfileRole = null;
    if (context.userId) {
      const profile = await ensureProfile(context.userId);
      role = profile.role;
    }
    return all.filter((course) => canSee(course, context.userId, role));
  });

type ProfileRole = "student" | "teacher" | "admin" | null;

export const listPublishedCourses = createServerFn({ method: "GET" }).handler(async () => {
  const all = await loadAllCourses();
  return all.filter((course) => course.published);
});

export const getCourseRecord = createServerFn({ method: "GET" })
  .middleware([optionalAuth])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    const all = await loadAllCourses();
    const course = all.find((item) => item.slug === data.slug);
    if (!course) return null;
    let role: ProfileRole = null;
    if (context.userId) {
      const profile = await ensureProfile(context.userId);
      role = profile.role;
    }
    if (!canSee(course, context.userId, role)) return null;
    return course;
  });

export function findSeedOrStatic(slug: string): Course | undefined {
  return getSeedCourse(slug);
}
