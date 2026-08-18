import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { listVisibleCourses } from "@/lib/catalog-service";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { getCourseLearning, getLibrary, getProgressOverview } from "@/lib/learning";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatMinutes } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
  head: () => ({ meta: [{ title: "Progress — National Education Center" }] }),
});

function ProgressPage() {
  const { t } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const overviewQuery = useQuery({
    queryKey: ["progress-overview", user?.id],
    queryFn: () => getProgressOverview(),
    enabled: Boolean(user),
  });
  const libraryQuery = useQuery({
    queryKey: ["library", user?.id],
    queryFn: () => getLibrary(),
    enabled: Boolean(user),
  });
  const catalogQuery = useQuery({
    queryKey: ["catalog", user?.id],
    queryFn: () => listVisibleCourses(),
    enabled: Boolean(user),
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          <Skeleton className="h-10 w-56" />
        </main>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const overview = overviewQuery.data;
  const catalog = catalogQuery.data ?? [];
  const enrolled = (libraryQuery.data ?? []).filter((item) => item.enrolledAt);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-sm font-bold tracking-wide text-primary uppercase">{t("prog.kicker")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{t("prog.title")}</h1>
        <p className="mt-2 max-w-xl text-muted">{t("prog.lede")}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: t("dash.courses"), value: overview?.enrolledCourses ?? enrolled.length },
            { label: t("dash.done"), value: overview?.completedLessons ?? 0 },
            { label: t("prog.started"), value: overview?.startedLessons ?? 0 },
            {
              label: t("prog.time"),
              value: formatMinutes(overview?.watchedSeconds ?? 0),
            },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-surface p-4">
              <p className="text-xs font-bold tracking-wide text-muted uppercase">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 space-y-6">
          {enrolled.length === 0 ? (
            <div className="rounded-md border border-line bg-surface p-8 text-center">
              <p className="font-bold">No courses in progress</p>
              <p className="mt-1 text-sm text-muted">Enroll, watch a lecture, and it will show here.</p>
              <Button asChild className="mt-4">
                <Link to="/catalog">Browse courses</Link>
              </Button>
            </div>
          ) : (
            enrolled.map((item) => {
              const course = catalog.find((row) => row.slug === item.courseSlug);
              if (!course) return null;
              return (
                <CourseProgress
                  key={item.courseSlug}
                  courseSlug={item.courseSlug}
                  title={course.title}
                  poster={course.poster}
                  total={course.lessons.length}
                  completed={item.completedLessons}
                  lastLessonSlug={item.lastLessonSlug ?? course.lessons[0]?.slug ?? ""}
                  lessons={course.lessons}
                  userId={user.id}
                />
              );
            })
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CourseProgress({
  courseSlug,
  title,
  poster,
  total,
  completed,
  lastLessonSlug,
  lessons,
  userId,
}: {
  courseSlug: string;
  title: string;
  poster: string;
  total: number;
  completed: number;
  lastLessonSlug: string;
  lessons: { slug: string; title: string }[];
  userId: string;
}) {
  const learningQuery = useQuery({
    queryKey: ["course-learning", courseSlug, userId],
    queryFn: () => getCourseLearning({ data: { courseSlug } }),
  });
  const done = new Set(
    learningQuery.data?.progress.filter((row) => row.completed).map((row) => row.lessonSlug) ?? [],
  );
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const resume =
    lessons.find((lesson) => !done.has(lesson.slug))?.slug ?? lastLessonSlug ?? lessons[0]?.slug;

  return (
    <article className="overflow-hidden rounded-md border border-line bg-surface">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <img src={poster} alt="" className="h-16 w-28 rounded-sm object-cover" />
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">{title}</h2>
          <p className="text-sm text-muted">
            {completed}/{total} lectures · {pct}%
          </p>
          <Progress value={pct} className="mt-2 h-1.5 max-w-sm bg-elevated" />
        </div>
        {resume ? (
          <Button asChild>
            <Link
              to="/watch/$courseSlug/$lessonSlug"
              params={{ courseSlug, lessonSlug: resume }}
            >
              {pct === 100 ? "Review" : "Continue"}
            </Link>
          </Button>
        ) : null}
      </div>
      <ul className="border-t border-line">
        {lessons.map((lesson, index) => (
          <li key={lesson.slug} className="border-b border-line last:border-0">
            <Link
              to="/watch/$courseSlug/$lessonSlug"
              params={{ courseSlug, lessonSlug: lesson.slug }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated"
            >
              <span className="grid size-6 place-items-center rounded-full bg-elevated text-[11px] text-muted">
                {done.has(lesson.slug) ? (
                  <Check className="size-3 text-primary" />
                ) : (
                  index + 1
                )}
              </span>
              <span className={done.has(lesson.slug) ? "text-muted line-through" : ""}>
                {lesson.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
