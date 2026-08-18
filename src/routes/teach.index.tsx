import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Field, TextArea } from "@/components/field";
import { RoleSwitcher } from "@/components/role-switcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { adoptPlatformCourse, getTeacherStats, listMyStudioCourses, setStudioPublished } from "@/lib/cms";
import { listVisibleCourses } from "@/lib/catalog-service";
import { applyToTeach, canAdmin, canTeach } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/teach/")({
  component: TeachPage,
  head: () => ({ meta: [{ title: "Teach — National Education Center" }] }),
});

function TeachPage() {
  const { user, isPending, profile } = useProfile();
  const queryClient = useQueryClient();
  const [pitch, setPitch] = useState("");

  const coursesQuery = useQuery({
    queryKey: ["studio-courses", user?.id],
    queryFn: () => listMyStudioCourses(),
    enabled: Boolean(user && profile && canTeach(profile.role)),
  });
  const statsQuery = useQuery({
    queryKey: ["teacher-stats", user?.id],
    queryFn: () => getTeacherStats(),
    enabled: Boolean(user && profile && canTeach(profile.role)),
  });
  const catalogQuery = useQuery({
    queryKey: ["catalog", user?.id],
    queryFn: () => listVisibleCourses(),
    enabled: Boolean(user && profile && canAdmin(profile.role)),
  });
  const adopt = useMutation({
    mutationFn: (slug: string) => adoptPlatformCourse({ data: { slug } }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["studio-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast(result.created ? "Course is now editable in the studio" : "Opening studio editor");
      window.location.assign(`/teach/${result.slug}`);
    },
    onError: (error) => toast(error.message),
  });
  const apply = useMutation({
    mutationFn: () => applyToTeach({ data: { pitch } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast("Application sent");
    },
    onError: (error) => toast(error.message),
  });
  const publish = useMutation({
    mutationFn: (input: { slug: string; published: boolean }) => setStudioPublished({ data: input }),
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: ["studio-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["teacher-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast(input.published ? "Course is live" : "Course unpublished");
    },
    onError: (error) => toast(error.message),
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
          <Skeleton className="h-10 w-64" />
        </main>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  if (!profile || !canTeach(profile.role)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight">Teach at the Centre</h1>
          <p className="mt-2 text-muted">
            Open the studio to publish courses, add lectures, and see who is enrolled.
          </p>
          <div className="mt-6">
            <RoleSwitcher current={profile?.role ?? "student"} />
          </div>
          {profile?.application === "pending" ? (
            <p className="mt-6 rounded-md border border-line bg-surface p-4 text-sm">
              Your teacher application is waiting on an admin. Or switch this account to
              Teacher above to enter the studio now.
            </p>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                apply.mutate();
              }}
            >
              <Field label="Or apply for teacher access">
                <TextArea
                  required
                  minLength={12}
                  value={pitch}
                  onChange={(event) => setPitch(event.target.value)}
                  placeholder="What you teach, who it is for, and what a student can do after the last lecture."
                />
              </Field>
              <Button type="submit" disabled={apply.isPending}>
                {apply.isPending ? "Sending…" : "Apply to teach"}
              </Button>
            </form>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const stats = statsQuery.data;
  const courses = coursesQuery.data ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold tracking-wide text-primary uppercase">Teacher studio</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Your courses</h1>
            <p className="mt-1 text-sm text-muted">
              Draft, add lectures, publish to the catalog, and track students.
            </p>
          </div>
          <Button asChild>
            <Link to="/teach/new">New course</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Courses", value: stats?.courses ?? 0 },
            { label: "Published", value: stats?.published ?? 0 },
            { label: "Lectures", value: stats?.lessons ?? 0 },
            { label: "Students", value: stats?.students ?? 0 },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-surface p-4">
              <p className="text-xs font-bold tracking-wide text-muted uppercase">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>

        {coursesQuery.error ? (
          <p className="mt-4 text-sm text-danger">
            {(coursesQuery.error as Error).message || "Could not load your courses."}
          </p>
        ) : null}

        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
          {coursesQuery.isLoading ? (
            <li className="p-6 text-sm text-muted">Loading studio…</li>
          ) : courses.length === 0 ? (
            <li className="p-8 text-center">
              <p className="font-bold">No courses yet</p>
              <p className="mt-1 text-sm text-muted">
                Create a draft, add at least one lecture, then publish.
              </p>
              <Button asChild className="mt-4">
                <Link to="/teach/new">Create your first course</Link>
              </Button>
            </li>
          ) : (
            courses.map((course) => (
              <li key={course.slug} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <img src={course.poster} alt="" className="h-16 w-28 rounded-sm object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{course.title}</p>
                  <p className="text-sm text-muted">
                    {course.lessons.length} lectures · {course.students} students
                    {course.lessons.length === 0 ? " · add a lecture before publishing" : ""}
                  </p>
                </div>
                <Badge variant={course.published ? "solid" : "outline"}>
                  {course.published ? "Live" : "Draft"}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={publish.isPending || (!course.published && course.lessons.length === 0)}
                    onClick={() =>
                      publish.mutate({ slug: course.slug, published: !course.published })
                    }
                  >
                    {course.published ? "Unpublish" : "Publish"}
                  </Button>
                  {course.published ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/course/$slug" params={{ slug: course.slug }}>
                        View
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild size="sm">
                    <Link to="/teach/$slug" params={{ slug: course.slug }}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>

        {profile && canAdmin(profile.role) ? (
          <section className="mt-12">
            <h2 className="text-xl font-bold">Catalogue courses</h2>
            <p className="mt-1 text-sm text-muted">
              Take over a demo course to change its title, poster, lectures, and video.
            </p>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {(catalogQuery.data ?? [])
                .filter((course) => course.source === "platform")
                .map((course) => (
                  <li
                    key={course.slug}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <img src={course.poster} alt="" className="h-16 w-28 rounded-sm object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{course.title}</p>
                      <p className="text-sm text-muted">
                        {course.lessons.length} lectures · catalogue
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={adopt.isPending}
                      onClick={() => adopt.mutate(course.slug)}
                    >
                      Edit content
                    </Button>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
