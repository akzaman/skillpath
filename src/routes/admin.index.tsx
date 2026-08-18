import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RoleSwitcher } from "@/components/role-switcher";
import { CreateUserForm } from "@/components/create-user-form";
import { SelectField } from "@/components/field";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { listAdminCourses, setCourseFlags } from "@/lib/cms";
import {
  canAdmin,
  getAdminStats,
  listAdminUsers,
  reviewTeacherApplication,
  setUserRole,
  type Role,
} from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Skillpath" }] }),
});

function AdminPage() {
  const { user, isPending, profile } = useProfile();
  const queryClient = useQueryClient();
  const isAdmin = Boolean(profile && canAdmin(profile.role));

  const statsQuery = useQuery({
    queryKey: ["admin-stats", user?.id],
    queryFn: () => getAdminStats(),
    enabled: Boolean(user && isAdmin),
  });
  const usersQuery = useQuery({
    queryKey: ["admin-users", user?.id],
    queryFn: () => listAdminUsers(),
    enabled: Boolean(user && isAdmin),
  });
  const coursesQuery = useQuery({
    queryKey: ["admin-courses", user?.id],
    queryFn: () => listAdminCourses(),
    enabled: Boolean(user && isAdmin),
  });

  const setRole = useMutation({
    mutationFn: (input: { userId: string; role: Role }) => setUserRole({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast("Role updated");
    },
    onError: (error) => toast(error.message || "Could not update role"),
  });

  const review = useMutation({
    mutationFn: (input: { userId: string; status: "approved" | "rejected" }) =>
      reviewTeacherApplication({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast("Application updated");
    },
    onError: (error) => toast(error.message || "Could not review application"),
  });

  const flags = useMutation({
    mutationFn: (input: { slug: string; published: boolean; featured: boolean }) =>
      setCourseFlags({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast("Catalog updated");
    },
    onError: (error) => toast(error.message || "Could not update course"),
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
          <Skeleton className="h-10 w-64" />
          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        </main>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!profile || !isAdmin) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
          <h1 className="text-2xl font-bold">Admin only</h1>
          <p className="mt-2 text-sm text-muted">
            Switch this account to Admin to open the console.
          </p>
          <div className="mt-6">
            <RoleSwitcher current={profile?.role ?? "student"} />
          </div>
        </main>
      </div>
    );
  }

  const stats = statsQuery.data;
  const users = usersQuery.data ?? [];
  const courses = coursesQuery.data ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-sm font-bold tracking-wide text-primary uppercase">Admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Platform console</h1>
        <p className="mt-2 max-w-xl text-muted">
          Users, roles, and the live catalog — change them here.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          {[
            { label: "Users", value: stats?.users ?? users.length },
            { label: "Teachers", value: stats?.teachers ?? "—" },
            { label: "Pending", value: stats?.pending ?? "—" },
            { label: "Enrollments", value: stats?.enrollments ?? "—" },
            { label: "Studio courses", value: stats?.studioCourses ?? "—" },
          ].map((item) => (
            <div key={item.label} className="rounded-md border border-line bg-surface p-4">
              <p className="text-xs font-bold tracking-wide text-muted uppercase">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>

        {statsQuery.error || usersQuery.error || coursesQuery.error ? (
          <p className="mt-4 rounded-md border border-danger/40 bg-surface px-3 py-2 text-sm text-danger">
            {(statsQuery.error as Error | undefined)?.message ||
              (usersQuery.error as Error | undefined)?.message ||
              (coursesQuery.error as Error | undefined)?.message ||
              "Admin data failed to load."}
          </p>
        ) : null}

        <div className="mt-8">
          <CreateUserForm />
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Users</h2>
              <p className="text-sm text-muted">Change anyone’s role. Approve teacher applications.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/users">Open full list</Link>
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Person</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Application</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-muted">
                      Loading users…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-muted">
                      No users yet. Sign up another account, then refresh.
                    </td>
                  </tr>
                ) : (
                  users.map((row) => (
                    <tr key={row.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted">{row.email || row.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <SelectField
                          value={row.role}
                          onChange={(event) =>
                            setRole.mutate({ userId: row.id, role: event.target.value as Role })
                          }
                          className="h-9 w-36"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </SelectField>
                      </td>
                      <td className="px-4 py-3 capitalize">{row.application}</td>
                      <td className="px-4 py-3">
                        {row.application === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => review.mutate({ userId: row.id, status: "approved" })}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => review.mutate({ userId: row.id, status: "rejected" })}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 mb-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Catalog</h2>
              <p className="text-sm text-muted">Publish, hide, or feature a course.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/courses">Open full catalog</Link>
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
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
                {coursesQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-muted">
                      Loading catalog…
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
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
                            disabled={flags.isPending}
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
                            disabled={flags.isPending}
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
