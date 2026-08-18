import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CourseCard } from "@/components/course-card";
import { RoleSwitcher } from "@/components/role-switcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { listVisibleCourses } from "@/lib/catalog-service";
import { getContinueWatching, getLibrary, getProgressOverview } from "@/lib/learning";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { canAdmin, canTeach } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";
import { useI18n } from "@/lib/i18n";
import { formatMinutes } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — National Education Center" }] }),
});

function DashboardPage() {
  const { t } = useI18n();
  const { user, isPending, profile, error } = useProfile();
  const catalogQuery = useQuery({
    queryKey: ["catalog", user?.id],
    queryFn: () => listVisibleCourses(),
  });
  const libraryQuery = useQuery({
    queryKey: ["library", user?.id],
    queryFn: () => getLibrary(),
    enabled: Boolean(user),
  });
  const continueQuery = useQuery({
    queryKey: ["continue-watching", user?.id],
    queryFn: () => getContinueWatching(),
    enabled: Boolean(user),
  });
  const overviewQuery = useQuery({
    queryKey: ["progress-overview", user?.id],
    queryFn: () => getProgressOverview(),
    enabled: Boolean(user),
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
          <Skeleton className="h-10 w-64" />
        </main>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const catalog = catalogQuery.data ?? [];
  const bySlug = new Map(catalog.map((course) => [course.slug, course]));
  const enrolled = (libraryQuery.data ?? []).filter((item) => item.enrolledAt);
  const resumeRow = continueQuery.data;
  const resumeCourse = resumeRow ? bySlug.get(resumeRow.courseSlug) : undefined;
  let resumeLesson = resumeRow?.lessonSlug;
  if (resumeCourse && resumeRow?.completed) {
    const idx = resumeCourse.lessons.findIndex((lesson) => lesson.slug === resumeRow.lessonSlug);
    resumeLesson = resumeCourse.lessons[idx + 1]?.slug ?? resumeRow.lessonSlug;
  }
  const role = profile?.role ?? "student";
  const overview = overviewQuery.data;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-sm font-bold tracking-wide text-primary uppercase">{t(`role.${role}`)}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {user.displayName
            ? t("dash.welcomeName", { name: user.displayName.split(" ")[0] })
            : t("dash.welcome")}
        </h1>
        <p className="mt-2 max-w-xl text-muted">{t("dash.lede")}</p>

        {error ? (
          <p className="mt-4 rounded-md border border-danger/40 bg-surface px-3 py-2 text-sm text-danger">
            {t("dash.roleError")}
          </p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: t("dash.courses"), value: overview?.enrolledCourses ?? enrolled.length },
            { label: t("dash.done"), value: overview?.completedLessons ?? 0 },
            { label: t("dash.motion"), value: overview?.startedLessons ?? 0 },
            { label: t("dash.watched"), value: formatMinutes(overview?.watchedSeconds ?? 0) },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-surface p-4">
              <p className="text-xs font-bold tracking-wide text-muted uppercase">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <RoleSwitcher current={role} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/progress">{t("dash.openProgress")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/catalog">{t("dash.browse")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/library">{t("dash.learning")}</Link>
          </Button>
          {canTeach(role) ? (
            <Button asChild variant="outline">
              <Link to="/teach">{t("dash.studio")}</Link>
            </Button>
          ) : null}
          {canAdmin(role) ? (
            <Button asChild variant="outline">
              <Link to="/admin">{t("dash.admin")}</Link>
            </Button>
          ) : null}
        </div>

        {resumeCourse && resumeLesson ? (
          <section className="mt-8 rounded-md border border-line bg-surface p-5">
            <p className="text-xs font-bold tracking-wide text-muted uppercase">{t("dash.continue")}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold">{resumeCourse.title}</p>
                <p className="text-sm text-muted">
                  {resumeCourse.lessons.find((lesson) => lesson.slug === resumeLesson)?.title ??
                    resumeCourse.instructor.name}
                </p>
              </div>
              <Button asChild>
                <Link
                  to="/watch/$courseSlug/$lessonSlug"
                  params={{ courseSlug: resumeCourse.slug, lessonSlug: resumeLesson }}
                >
                  {t("dash.resume")}
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-bold">In progress</h2>
            <Link to="/progress" className="text-sm font-bold text-primary hover:underline">
              See all progress
            </Link>
          </div>
          {enrolled.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              You have not enrolled yet. Open a course and click Enroll now.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrolled.slice(0, 6).map((item) => {
                const course = bySlug.get(item.courseSlug);
                if (!course) return null;
                const pct =
                  course.lessons.length > 0
                    ? Math.round((item.completedLessons / course.lessons.length) * 100)
                    : 0;
                return (
                  <div key={item.courseSlug} className="flex flex-col">
                    <CourseCard
                      course={course}
                      progress={{
                        completed: item.completedLessons,
                        total: course.lessons.length,
                      }}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span className="tabular-nums">
                        {item.completedLessons}/{course.lessons.length} · {pct}%
                      </span>
                      {item.lastLessonSlug ? (
                        <Link
                          to="/watch/$courseSlug/$lessonSlug"
                          params={{
                            courseSlug: course.slug,
                            lessonSlug: item.lastLessonSlug,
                          }}
                          className="font-bold text-primary hover:underline"
                        >
                          Continue
                        </Link>
                      ) : null}
                    </div>
                    <Progress value={pct} className="mt-1 h-1 bg-elevated" />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
