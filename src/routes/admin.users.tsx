import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CreateUserForm } from "@/components/create-user-form";
import { SelectField } from "@/components/field";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import {
  canAdmin,
  listAdminUsers,
  reviewTeacherApplication,
  setUserRole,
  type Role,
} from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
});

function AdminUsersPage() {
  const { user, isPending, profile } = useProfile();
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listAdminUsers(),
    enabled: Boolean(user && profile && canAdmin(profile.role)),
  });

  const setRole = useMutation({
    mutationFn: (input: { userId: string; role: Role }) => setUserRole({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast("Role updated");
    },
    onError: (error) => toast(error.message),
  });

  const review = useMutation({
    mutationFn: (input: { userId: string; status: "approved" | "rejected" }) =>
      reviewTeacherApplication({ data: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast("Application updated");
    },
    onError: (error) => toast(error.message),
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
        <main className="grid flex-1 place-items-center px-4 text-center">
          <p>Admin only.</p>
        </main>
      </div>
    );
  }

  const users = usersQuery.data ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link to="/admin" className="text-sm text-muted hover:text-fg">
          ← Admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-2 text-sm text-muted">Add people by hand, change roles, review applications.</p>

        <div className="mt-6">
          <CreateUserForm />
        </div>

        <div className="mt-6 overflow-x-auto rounded-md border border-line bg-surface">
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
              {users.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted">{row.email}</p>
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
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No users yet. Sign up with a second account to see the list grow.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
