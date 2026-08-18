import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { CATEGORIES, type Category } from "@/data/catalog";
import { listPublishedCourses } from "@/lib/catalog-service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string; category?: Category } => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: CATEGORIES.includes(search.category as Category)
      ? (search.category as Category)
      : undefined,
  }),
  loader: () => listPublishedCourses(),
  component: CatalogPage,
  head: () => ({
    meta: [{ title: "Courses — Skillpath" }],
  }),
});

function CatalogPage() {
  const catalog = Route.useLoaderData();
  const { q = "", category: initialCategory } = Route.useSearch();
  const [query, setQuery] = useState(q);
  const [category, setCategory] = useState<Category | "All">(initialCategory ?? "All");
  useEffect(() => {
    setQuery(q);
  }, [q]);
  useEffect(() => {
    setCategory(initialCategory ?? "All");
  }, [initialCategory]);

  const results = useMemo(() => {
    const needle = (query || q).trim().toLowerCase();
    return catalog.filter((course) => {
      if (category !== "All" && course.category !== category) return false;
      if (!needle) return true;
      const hay = [
        course.title,
        course.subtitle,
        course.description,
        course.instructor.name,
        course.category,
        ...course.lessons.map((lesson) => lesson.title),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [catalog, query, q, category]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-sm text-muted">
          {results.length} result{results.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {category === "All" ? "All courses" : `${category} courses`}
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses"
            aria-label="Search courses"
            className="h-12 max-w-md rounded-sm bg-surface"
          />
          <div className="flex flex-wrap gap-2">
            {(["All", ...CATEGORIES] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                  category === item
                    ? "border-fg bg-fg text-bg"
                    : "border-line bg-surface text-muted hover:border-fg hover:text-fg",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
        {results.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted">
            No courses match that search. Try another topic or a shorter query.
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
