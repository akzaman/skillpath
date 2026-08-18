import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CourseCard } from "@/components/course-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listVisibleCourses } from "@/lib/catalog-service";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getLibrary } from "@/lib/learning";
import { accessLabel } from "@/lib/access";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): { tab?: "saved" | "learning" } => {
    if (search.tab === "saved") return { tab: "saved" };
    if (search.tab === "learning") return { tab: "learning" };
    return {};
  },
  component: LibraryPage,
  head: () => ({
    meta: [{ title: "My learning — National Education Center" }],
  }),
});

function LibraryPage() {
  const { t } = useI18n();
  const { tab = "learning" } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
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
        <SiteHeader solid />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <Skeleton className="h-10 w-48" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="aspect-[4/5] rounded-xl" />
            <Skeleton className="aspect-[4/5] rounded-xl" />
            <Skeleton className="aspect-[4/5] rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) return <RedirectToSignIn />;

  const items = libraryQuery.data ?? [];
  const learning = items.filter((item) => item.enrolledAt);
  const saved = items.filter((item) => item.bookmarked);
  const shown = tab === "saved" ? saved : learning;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader solid />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("lib.title")}</h1>
        <p className="mt-2 max-w-xl text-muted">{t("lib.lede")}</p>

        <div className="mt-8 flex gap-2">
          <TabLink to="/library" search={{ tab: "learning" }} active={tab === "learning"}>
            {t("lib.all")}
          </TabLink>
          <TabLink to="/library" search={{ tab: "saved" }} active={tab === "saved"}>
            {t("lib.wish")}
          </TabLink>
        </div>

        {libraryQuery.isLoading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="aspect-[4/5] rounded-xl" />
            <Skeleton className="aspect-[4/5] rounded-xl" />
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-16 max-w-md">
            <h2 className="text-2xl font-bold tracking-tight">
              {tab === "saved" ? "Your wishlist is empty" : "Start a course"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {tab === "saved"
                ? "Save a course from its page and it will wait here."
                : "Enroll from any course page and it will show up here, with your place kept."}
            </p>
            <Button asChild className="mt-6">
              <Link to="/catalog">Browse courses</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => {
              const course = catalogQuery.data?.find((row) => row.slug === item.courseSlug);
              if (!course) return null;
              return (
                <div key={item.courseSlug}>
                  <CourseCard
                    course={course}
                    progress={{
                      completed: item.completedLessons,
                      total: course.lessons.length,
                    }}
                  />
                  {item.enrolledAt ? (
                    <p
                      className={cn(
                        "mt-2 text-xs",
                        item.accessActive ? "text-muted" : "font-medium text-danger",
                      )}
                    >
                      {accessLabel(item.expiresAt)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function TabLink({
  to,
  search,
  active,
  children,
}: {
  to: "/library";
  search: { tab: "learning" | "saved" };
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        "h-9 rounded-full border px-3.5 text-sm leading-9 transition-colors duration-150",
        active
          ? "border-primary bg-primary text-primary-fg"
          : "border-line text-muted hover:text-fg",
      )}
    >
      {children}
    </Link>
  );
}
