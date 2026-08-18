import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { loadAllCourses } from "@/lib/catalog-service";
import { getSql } from "@/lib/db";
import { canAdmin, canTeach, ensureProfile } from "@/lib/roles";

const eventInput = z.object({
  courseSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
  topicId: z.string().max(40).optional(),
  kind: z.enum(["view", "topic_view", "complete"]),
  positionSeconds: z.number().int().min(0).optional().default(0),
  durationSeconds: z.number().int().min(0).optional().default(0),
});

async function assertCourseAccess(userId: string, slug: string) {
  const profile = await ensureProfile(userId);
  if (canAdmin(profile.role)) return;
  if (!canTeach(profile.role)) throw new Error("Forbidden");
  const sql = await getSql();
  const rows = await sql<{ owner_id: string }>`
    select owner_id from studio_courses where slug = ${slug}
  `;
  if (!rows[0] || rows[0].owner_id !== userId) throw new Error("Forbidden");
}

export const trackLessonEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => eventInput.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.kind === "view") {
      const recent = await sql<{ id: number }>`
        select id from lesson_events
        where user_id = ${context.userId}
          and course_slug = ${data.courseSlug}
          and lesson_slug = ${data.lessonSlug}
          and kind = 'view'
          and created_at > now() - interval '30 minutes'
        limit 1
      `;
      if (recent[0]) return { ok: true as const, recorded: false };
    }
    await sql`
      insert into lesson_events (
        user_id, course_slug, lesson_slug, topic_id, kind, position_seconds, duration_seconds
      ) values (
        ${context.userId}, ${data.courseSlug}, ${data.lessonSlug},
        ${data.topicId ?? null}, ${data.kind},
        ${data.positionSeconds ?? 0}, ${data.durationSeconds ?? 0}
      )
    `;
    if (data.topicId) {
      await sql`
        insert into topic_progress (
          user_id, course_slug, lesson_slug, topic_id, viewed, completed, seconds, updated_at
        ) values (
          ${context.userId}, ${data.courseSlug}, ${data.lessonSlug}, ${data.topicId},
          true, ${data.kind === "complete"}, ${data.positionSeconds ?? 0}, now()
        )
        on conflict (user_id, course_slug, lesson_slug, topic_id) do update set
          viewed = true,
          completed = (topic_progress.completed or excluded.completed),
          seconds = greatest(topic_progress.seconds, excluded.seconds),
          updated_at = now()
      `;
    }
    return { ok: true as const, recorded: true };
  });

export type LessonAnalyticsRow = {
  slug: string;
  title: string;
  kind: string;
  topicCount: number;
  views: number;
  viewers: number;
  started: number;
  completed: number;
  completionRate: number;
  avgPercent: number;
  topics: {
    id: string;
    title: string;
    viewers: number;
    completed: number;
  }[];
};

export type CourseAnalytics = {
  enrolled: number;
  uniqueViewers: number;
  completions: number;
  completionRate: number;
  watchedSeconds: number;
  lessons: LessonAnalyticsRow[];
};

export const getCourseAnalytics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }): Promise<CourseAnalytics> => {
    await assertCourseAccess(context.userId, data.slug);
    const courses = await loadAllCourses();
    const course = courses.find((item) => item.slug === data.slug);
    if (!course) throw new Error("Course not found");
    const sql = await getSql();

    const enrolled = await sql<{ n: number | string }>`
      select count(*)::int as n from enrollments where course_slug = ${data.slug}
    `;
    const viewers = await sql<{ n: number | string }>`
      select count(distinct user_id)::int as n
      from lesson_events
      where course_slug = ${data.slug} and kind = 'view'
    `;
    const eventRows = await sql<{
      lesson_slug: string;
      views: number | string;
      viewers: number | string;
      completers: number | string;
    }>`
      select
        lesson_slug,
        count(*) filter (where kind = 'view')::int as views,
        count(distinct user_id) filter (where kind = 'view')::int as viewers,
        count(distinct user_id) filter (where kind = 'complete')::int as completers
      from lesson_events
      where course_slug = ${data.slug}
      group by lesson_slug
    `;
    const progressRows = await sql<{
      lesson_slug: string;
      started: number | string;
      completed: number | string;
      avg_pos: number | string | null;
      avg_dur: number | string | null;
      watched: number | string;
    }>`
      select
        lesson_slug,
        count(*)::int as started,
        count(*) filter (where completed)::int as completed,
        avg(position_seconds)::int as avg_pos,
        nullif(avg(duration_seconds), 0)::int as avg_dur,
        coalesce(sum(case when completed then greatest(duration_seconds, position_seconds) else position_seconds end), 0)::int as watched
      from lesson_progress
      where course_slug = ${data.slug}
      group by lesson_slug
    `;
    const topicRows = await sql<{
      lesson_slug: string;
      topic_id: string;
      viewers: number | string;
      completed: number | string;
    }>`
      select
        lesson_slug,
        topic_id,
        count(*)::int as viewers,
        count(*) filter (where completed)::int as completed
      from topic_progress
      where course_slug = ${data.slug}
      group by lesson_slug, topic_id
    `;

    const eventsByLesson = new Map(eventRows.map((row) => [row.lesson_slug, row]));
    const progressByLesson = new Map(progressRows.map((row) => [row.lesson_slug, row]));
    const topicsByLesson = new Map<string, typeof topicRows>();
    for (const row of topicRows) {
      const list = topicsByLesson.get(row.lesson_slug) ?? [];
      list.push(row);
      topicsByLesson.set(row.lesson_slug, list);
    }

    const lessons: LessonAnalyticsRow[] = course.lessons.map((lesson) => {
      const events = eventsByLesson.get(lesson.slug);
      const progress = progressByLesson.get(lesson.slug);
      const started = Number(progress?.started ?? 0);
      const completed = Number(progress?.completed ?? events?.completers ?? 0);
      const avgPos = Number(progress?.avg_pos ?? 0);
      const avgDur = Number(progress?.avg_dur ?? 0);
      const topicStats = topicsByLesson.get(lesson.slug) ?? [];
      const topicMeta = lesson.topics ?? lesson.content.topics ?? [];
      return {
        slug: lesson.slug,
        title: lesson.title,
        kind: lesson.kind ?? "video",
        topicCount: topicMeta.length || 1,
        views: Number(events?.views ?? 0),
        viewers: Number(events?.viewers ?? started),
        started,
        completed,
        completionRate: started ? Math.round((completed / started) * 100) : 0,
        avgPercent: avgDur > 0 ? Math.min(100, Math.round((avgPos / avgDur) * 100)) : completed ? 100 : 0,
        topics: topicMeta.map((topic) => {
          const stat = topicStats.find((row) => row.topic_id === topic.id);
          return {
            id: topic.id,
            title: topic.title,
            viewers: Number(stat?.viewers ?? 0),
            completed: Number(stat?.completed ?? 0),
          };
        }),
      };
    });

    const enrolledN = Number(enrolled[0]?.n ?? 0);
    const completions = lessons.reduce((sum, row) => sum + row.completed, 0);
    const possible = enrolledN * Math.max(course.lessons.length, 1);
    const watchedSeconds = progressRows.reduce((sum, row) => sum + Number(row.watched ?? 0), 0);

    return {
      enrolled: enrolledN,
      uniqueViewers: Number(viewers[0]?.n ?? 0),
      completions,
      completionRate: possible ? Math.round((completions / possible) * 100) : 0,
      watchedSeconds,
      lessons,
    };
  });
