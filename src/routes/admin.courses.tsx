import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { adoptPlatformCourse, listAdminCourses, setCourseFlags } from "@/lib/cms";
import { canAdmin } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/admin/courses")({
  component: AdminCoursesPage,
  head: () => ({ meta: [{ title: "Catalog — Admin" }] }),
});

function AdminCoursesPage() {
  const { user, isPending, profile } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const coursesQuery = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => listAdminCourses(),
    enabled: Boolean(user && profile && canAdmin(profile.role)),
  });

  const flags = useMutation({
    mutationFn: (input: { slug: string; published: boolean; featured: boolean }) =>
      setCourseFlags({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast("Catalog updated");
    },
    onError: (error) => toast(error.message),
  });

  const adopt = useMutation({
    mutationFn: (slug: string) => adoptPlatformCourse({ data: { slug } }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["studio-courses"] });
      toast("Opening the studio editor");
      void navigate({ to: "/teach/$slug", params: { slug: result.slug } });
    },
    onError: (error) => toast(error.message || "Could not open editor"),
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
          <Skeleton className="h-10 w-48" />
        </main>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!profile || !canAdmin(profile.role)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="grid flex-1 place-items-center">Admin only.</main>
      </div>
    );
  }

  const courses = coursesQuery.data ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link to="/admin" className="text-sm text-muted hover:text-fg">
          ← Admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Catalog</h1>
        <p className="mt-2 text-sm text-muted">
          Publish, unpublish, feature, or open any course in the studio to change its content.
        </p>

        <div className="mt-6 overflow-x-auto rounded-md border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Students</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.slug} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-muted">
                      {course.instructor} · {course.lessons} lectures
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize">{course.source}</td>
                  <td className="px-4 py-3 tabular-nums">{course.students}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={course.published ? "solid" : "outline"}>
                        {course.published ? "Live" : "Hidden"}
                      </Badge>
                      {course.featured ? <Badge>Featured</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          flags.mutate({
                            slug: course.slug,
                            published: !course.published,
                            featured: course.featured,
                          })
                        }
                      >
                        {course.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          flags.mutate({
                            slug: course.slug,
                            published: course.published,
                            featured: !course.featured,
                          })
                        }
                      >
                        {course.featured ? "Unfeature" : "Feature"}
                      </Button>
                      {course.source === "studio" ? (
                        <Button asChild size="sm">
                          <Link to="/teach/$slug" params={{ slug: course.slug }}>
                            Edit content
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={adopt.isPending}
                          onClick={() => adopt.mutate(course.slug)}
                        >
                          Edit content
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
