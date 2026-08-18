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
import { getContinueWatching } from "@/lib/learning";

export const Route = createFileRoute("/")({
  loader: () => listPublishedCourses(),
  component: HomePage,
});

function HomePage() {
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
  const design = courses.filter((course) => course.category === "Design");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-header text-on-header">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
            <div>
              <h1 className="max-w-xl text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl">
                Learn anything. On your schedule.
              </h1>
              <p className="mt-4 max-w-lg text-base text-on-header/75">
                Video courses from working practitioners. Students learn. Teachers publish.
                Admins run the school.
              </p>
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
                  placeholder="What do you want to learn?"
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
                    Featured course
                  </p>
                  <p className="mt-1 text-xl font-bold">{featured.title}</p>
                  <p className="mt-1 text-sm text-on-header/70">
                    {featured.instructor.name} · {featuredMarket.rating.toFixed(1)} ·{" "}
                    {featuredMarket.students.toLocaleString()} students
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
                {category}
              </Link>
            ))}
          </div>
        </nav>

        {!isPending && user && resume?.course ? (
          <section className="border-b border-line bg-elevated">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold tracking-wide text-muted uppercase">
                  Let's jump back in
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
                  Continue learning
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-2xl font-bold">Learners are viewing</h2>
          <p className="mt-1 text-sm text-muted">
            Courses people on Skillpath are taking this week.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {courses.slice(0, 4).map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>

        {bestsellers.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold">Bestsellers</h2>
              <Link to="/catalog" className="text-sm font-bold text-primary hover:underline">
                Show all
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bestsellers.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </section>
        ) : null}

        {design.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
            <h2 className="text-2xl font-bold">Featured in Design</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {design.map((course) => (
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
                title: "Students",
                body: "Enroll, watch, take notes, and pick up exactly where you stopped.",
              },
              {
                icon: Award,
                title: "Teachers",
                body: "Publish a course from the studio. Track students and keep drafts private.",
              },
              {
                icon: Infinity,
                title: "Admins",
                body: "The first account is admin. Promote teachers and run the catalog.",
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
