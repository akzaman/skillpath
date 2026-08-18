import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Bookmark,
  Check,
  ChevronDown,
  Clock,
  Globe,
  Play,
  Signal,
} from "lucide-react";
import { toast } from "sonner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RatingRow, Stars } from "@/components/stars";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { courseDuration } from "@/data/catalog";
import { getCourseRecord } from "@/lib/catalog-service";
import { formatPrice, getMarket, getReviews } from "@/data/market";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { enrollInCourse, getCourseLearning, toggleBookmark } from "@/lib/learning";
import { accessLabel } from "@/lib/access";
import { cn, formatMinutes } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/course/$slug")({
  loader: async ({ params }) => {
    const course = await getCourseRecord({ data: { slug: params.slug } });
    if (!course) throw notFound();
    return { course };
  },
  component: CoursePage,
  notFoundComponent: CourseMissing,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.course.title ?? "Course"} | National Education Center` }],
  }),
});

function CourseMissing() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("course.missing")}</h1>
        <p className="mt-2 text-sm text-muted">{t("course.missingBody")}</p>
        <Button asChild className="mt-6">
          <Link to="/catalog">{t("dash.browse")}</Link>
        </Button>
      </main>
    </div>
  );
}

function CoursePage() {
  const { t, category: trCat, level: trLevel } = useI18n();
  const { course } = Route.useLoaderData();
  const market = getMarket(course.slug);
  const courseReviews = getReviews(course.slug);
  const { user, isPending } = useCurrentUserState();
  const queryClient = useQueryClient();
  const learningQuery = useQuery({
    queryKey: ["course-learning", course.slug, user?.id],
    queryFn: () => getCourseLearning({ data: { courseSlug: course.slug } }),
    enabled: Boolean(user),
  });
  const learning = learningQuery.data;
  const completedSet = new Set(
    learning?.progress.filter((row) => row.completed).map((row) => row.lessonSlug) ?? [],
  );
  const last = learning?.progress
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0];
  const nextLesson =
    course.lessons.find((lesson) => !completedSet.has(lesson.slug)) ?? course.lessons[0]!;
  const continueLesson =
    last && !last.completed
      ? (course.lessons.find((lesson) => lesson.slug === last.lessonSlug) ?? nextLesson)
      : nextLesson;
  const completedCount = completedSet.size;
  const total = course.lessons.length;
  const pct = Math.round((completedCount / total) * 100);
  const watchTo = {
    to: "/watch/$courseSlug/$lessonSlug" as const,
    params: { courseSlug: course.slug, lessonSlug: continueLesson.slug },
  };

  const enroll = useMutation({
    mutationFn: () => enrollInCourse({ data: { courseSlug: course.slug } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-learning", course.slug] });
      toast(t("course.enrolled"));
    },
    onError: () => toast(t("course.loginEnroll")),
  });

  const bookmark = useMutation({
    mutationFn: () => toggleBookmark({ data: { courseSlug: course.slug } }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["course-learning", course.slug] });
      toast(result.bookmarked ? t("course.wishlistAdd") : t("course.wishlistRemove"));
    },
    onError: () => toast(t("course.loginSave")),
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <section className="bg-header text-on-header">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_20rem]">
          <div>
            <p className="text-sm font-bold text-primary">
              {trCat(course.category)} · {trLevel(course.level)}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-base text-on-header/80">{course.subtitle}</p>
            <div className="mt-4">
              <RatingRow
                rating={market.rating}
                reviews={market.reviews}
                students={market.students}
              />
            </div>
            <p className="mt-3 text-sm text-on-header/75">
              {t("course.createdBy")}{" "}
              <span className="font-bold text-on-header underline decoration-on-header/30">
                {course.instructor.name}
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-on-header/70">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {t("course.updated", { date: market.updatedLabel })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-4" />
                English
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Signal className="size-4" />
                {t("course.total", { time: formatMinutes(courseDuration(course)) })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <section className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-xl font-bold">{t("course.learn")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {market.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">{t("course.content")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t("course.lectures", {
                n: course.lessons.length,
                time: formatMinutes(courseDuration(course)),
              })}
            </p>
            {user && completedCount > 0 ? (
              <div className="mt-3 max-w-sm">
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>{t("course.yourProgress")}</span>
                  <span className="tabular-nums">
                    {completedCount}/{total}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5 bg-elevated" />
              </div>
            ) : null}
            <ol className="mt-4 divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {course.lessons.map((lesson, index) => {
                const done = completedSet.has(lesson.slug);
                return (
                  <li key={lesson.slug}>
                    <Link
                      to="/watch/$courseSlug/$lessonSlug"
                      params={{ courseSlug: course.slug, lessonSlug: lesson.slug }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-elevated"
                    >
                      <ChevronDown className="mt-1 size-4 rotate-[-90deg] text-muted" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {done ? t("course.completed") : ""}
                            {index + 1}. {lesson.title}
                          </span>
                          {lesson.preview ? (
                            <span className="text-xs font-bold text-primary">{t("course.preview")}</span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{lesson.summary}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted tabular-nums">
                        {formatMinutes(lesson.durationSeconds)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold">{t("course.description")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {course.description}
            </p>
          </section>

          <section className="mt-10 rounded-md border border-line bg-surface p-5">
            <h2 className="text-xl font-bold">{t("course.instructor")}</h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-14 place-items-center rounded-full bg-header text-sm font-bold text-on-header">
                {course.instructor.initials}
              </span>
              <div>
                <p className="font-bold">{course.instructor.name}</p>
                <p className="text-sm text-muted">{course.instructor.title}</p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              {course.instructor.bio}
            </p>
          </section>

          {courseReviews.length > 0 ? (
            <section className="mt-10 mb-8">
              <h2 className="text-xl font-bold">{t("course.feedback")}</h2>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-bold text-star tabular-nums">
                  {market.rating.toFixed(1)}
                </span>
                <div>
                  <Stars rating={market.rating} size="md" />
                  <p className="text-xs text-muted">Course rating</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-line border-t border-line">
                {courseReviews.map((review) => (
                  <li key={review.name} className="py-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-elevated text-xs font-bold">
                        {review.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold">{review.name}</p>
                        <div className="flex items-center gap-2">
                          <Stars rating={review.rating} />
                          <span className="text-xs text-muted">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                      {review.body}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-20 lg:-mt-40 lg:self-start">
          <div className="overflow-hidden rounded-md border border-line bg-surface shadow-soft">
            <Link {...watchTo} className="relative block">
              <img src={course.poster} alt="" className="aspect-video w-full object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-header/25">
                <span className="grid size-14 place-items-center rounded-full bg-surface text-fg shadow-soft">
                  <Play className="size-6 translate-x-0.5 fill-current" />
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-3 text-center text-sm font-bold text-on-header">
                Preview this course
              </span>
            </Link>
            <div className="p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums">{formatPrice(market.price)}</span>
                <span className="text-sm text-muted line-through tabular-nums">
                  {formatPrice(market.listPrice)}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-danger">
                {Math.round((1 - market.price / market.listPrice) * 100)}% off · demo enrollment is
                free
              </p>
              <p className="mt-2 text-sm text-muted">
                {learning?.enrolled
                  ? accessLabel(learning.expiresAt)
                  : course.accessDays > 0
                    ? `Access for ${course.accessDays} days after enrollment`
                    : "Unlimited access after enrollment"}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {user && !learning?.enrolled ? (
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={enroll.isPending}
                    onClick={() => enroll.mutate()}
                  >
                    {t("course.enroll")}
                  </Button>
                ) : user && learning?.enrolled && !learning.accessActive ? (
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={enroll.isPending}
                    onClick={() => enroll.mutate()}
                  >
                    Renew access
                  </Button>
                ) : (
                  <Button asChild size="lg" className="w-full">
                    <Link {...watchTo}>
                      {completedCount > 0 ? t("course.continue") : t("course.enroll")}
                    </Link>
                  </Button>
                )}
                {!isPending && !user ? (
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/login" search={{ next: `/course/${course.slug}` }}>
                      {t("course.loginEnroll")}
                    </Link>
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => bookmark.mutate()}
                  disabled={bookmark.isPending}
                >
                  <Bookmark className={cn("size-4", learning?.bookmarked && "fill-current")} />
                  {learning?.bookmarked ? t("course.wishlistRemove") : t("course.wishlist")}
                </Button>
              </div>
              <ul className="mt-4 space-y-1.5 text-xs text-muted">
                <li>{course.lessons.length} video lectures</li>
                <li>Full lifetime access</li>
                <li>Notes saved to your account</li>
                <li>First lecture free to preview</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
