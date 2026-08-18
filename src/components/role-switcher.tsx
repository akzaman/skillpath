import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setMyRole, type Role } from "@/lib/roles";
import { cn } from "@/lib/utils";

const ROLES: { id: Role; label: string; blurb: string }[] = [
  { id: "student", label: "Student", blurb: "Learn, enroll, take notes" },
  { id: "teacher", label: "Teacher", blurb: "Publish courses in the studio" },
  { id: "admin", label: "Admin", blurb: "Users, roles, and the catalog" },
];

export function RoleSwitcher({ current }: { current: Role }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (role: Role) => setMyRole({ data: { role } }),
    onSuccess: async (profile) => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast(`You are now ${profile.role}`);
    },
    onError: (error) => toast(error.message || "Could not change role"),
  });

  return (
    <section className="rounded-md border border-line bg-surface p-5">
      <p className="text-xs font-bold tracking-wide text-muted uppercase">Your access</p>
      <h2 className="mt-1 text-lg font-bold">Switch role</h2>
      <p className="mt-1 text-sm text-muted">
        Use this to open the student desk, teacher studio, or admin console on this account.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {ROLES.map((role) => {
          const active = current === role.id;
          return (
            <button
              key={role.id}
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(role.id)}
              className={cn(
                "rounded-md border px-3 py-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary text-primary-fg"
                  : "border-line bg-bg hover:border-fg",
              )}
            >
              <span className="block text-sm font-bold">{role.label}</span>
              <span className={cn("mt-0.5 block text-xs", active ? "opacity-80" : "text-muted")}>
                {role.blurb}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
