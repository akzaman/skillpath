import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Award, Infinity, MonitorPlay, Search } from "lucide-react";
import { useState } from "react";
import { CourseCard } from "@/components/course-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/catalog";
import { getMarket } from "@/data/market";
import { listPublishedCourses } from "@/lib/catalog-service";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { getContinueWatching } from "@/lib/learning";

export const Route = createFileRoute("/")({
  loader: () => listPublishedCourses(),
  component: HomePage,
});

function HomePage() {
  const { t, category: trCat } = useI18n();
  const courses = Route.useLoaderData();
  const featured = courses.find((course) => course.featured) ?? courses[0];
  const featuredMarket = featured ? getMarket(featured.slug) : null;
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { user, isPending } = useCurrentUserState();
  const continueQuery = useQuery({
    queryKey: ["continue-watching", user?.id],
    queryFn: () => getContinueWatching(),
    enabled: Boolean(user),
  });
  const resume = continueQuery.data
    ? {
        course: courses.find((course) => course.slug === continueQuery.data?.courseSlug),
        lessonSlug: continueQuery.data.lessonSlug,
      }
    : null;

  const bestsellers = courses.filter((course) => getMarket(course.slug).badge === "Bestseller");
  const language = courses.filter((course) => course.category === "Lingua italiana");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-header text-on-header">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-badge uppercase">
                {t("home.kicker")}
              </p>
              <h1 className="mt-3 max-w-xl text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
                {t("home.hero")}
              </h1>
              <p className="mt-4 max-w-lg text-base text-on-header/75">{t("home.lede")}</p>
              <form
                className="relative mt-6 max-w-lg"
                onSubmit={(event) => {
                  event.preventDefault();
                  void navigate({
                    to: "/catalog",
                    search: { q: query.trim() || undefined },
                  });
                }}
              >
                <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("home.search")}
                  className="h-14 w-full rounded-sm border-0 bg-surface pr-4 pl-12 text-base text-fg placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                />
              </form>
            </div>
            {featured && featuredMarket ? (
              <Link
                to="/course/$slug"
                params={{ slug: featured.slug }}
                className="relative hidden overflow-hidden rounded-md lg:block"
              >
                <img src={featured.poster} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-header/85 p-5">
                  <p className="text-xs font-bold tracking-wide text-badge uppercase">
                    {t("home.featured")}
                  </p>
                  <p className="mt-1 text-xl font-bold">{featured.title}</p>
                  <p className="mt-1 text-sm text-on-header/70">
                    {featured.instructor.name} · {featuredMarket.rating.toFixed(1)} ·{" "}
                    {t("home.students", { n: featuredMarket.students.toLocaleString() })}
                  </p>
                </div>
              </Link>
            ) : null}
          </div>
        </section>

        <nav className="border-b border-line bg-surface">
          <div className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                to="/catalog"
                search={{ category }}
                className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted hover:border-fg hover:text-fg"
              >
                {trCat(category)}
              </Link>
            ))}
          </div>
        </nav>

        <section className="border-b border-line bg-surface">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 px-4 py-3 sm:px-6">
            {[
              "Agenzia delle Entrate",
              "CAF",
              "Patronato",
              "Questura",
              "Autoscuola",
              "CPIA",
            ].map((desk) => (
              <span
                key={desk}
                className="rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted"
              >
                {desk}
              </span>
            ))}
          </div>
        </section>

        {!isPending && user && resume?.course ? (
          <section className="border-b border-line bg-elevated">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold tracking-wide text-muted uppercase">
                  {t("home.resumeKicker")}
                </p>
                <p className="mt-1 text-lg font-bold">{resume.course.title}</p>
              </div>
              <Button asChild>
                <Link
                  to="/watch/$courseSlug/$lessonSlug"
                  params={{
                    courseSlug: resume.course.slug,
                    lessonSlug: resume.lessonSlug,
                  }}
                >
                  {t("home.continue")}
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-2xl font-bold">{t("home.openWeek")}</h2>
          <p className="mt-1 text-sm text-muted">{t("home.openWeekSub")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {courses.slice(0, 4).map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>

        {bestsellers.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold">{t("home.mostRequested")}</h2>
              <Link to="/catalog" className="text-sm font-bold text-primary hover:underline">
                {t("home.showAll")}
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bestsellers.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </section>
        ) : null}

        {language.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
            <h2 className="text-2xl font-bold">{trCat("Lingua italiana")}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {language.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
            {[
              {
                icon: MonitorPlay,
                title: t("home.studentsTitle"),
                body: t("home.studentsBody"),
              },
              {
                icon: Award,
                title: t("home.teachersTitle"),
                body: t("home.teachersBody"),
              },
              {
                icon: Infinity,
                title: t("home.adminsTitle"),
                body: t("home.adminsBody"),
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <item.icon className="mt-0.5 size-8 shrink-0 text-primary" />
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
