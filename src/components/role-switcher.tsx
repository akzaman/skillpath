import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setMyRole, type Role } from "@/lib/roles";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function RoleSwitcher({ current }: { current: Role }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const roles: { id: Role; label: string; blurb: string }[] = [
    { id: "student", label: t("role.student"), blurb: t("role.studentBlurb") },
    { id: "teacher", label: t("role.teacher"), blurb: t("role.teacherBlurb") },
    { id: "admin", label: t("role.admin"), blurb: t("role.adminBlurb") },
  ];
  const mutation = useMutation({
    mutationFn: (role: Role) => setMyRole({ data: { role } }),
    onSuccess: async (profile) => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast(t("access.now", { role: t(`role.${profile.role}`) }));
    },
    onError: (error) => toast(error.message || t("access.fail")),
  });

  return (
    <section className="rounded-md border border-line bg-surface p-5">
      <p className="text-xs font-bold tracking-wide text-muted uppercase">{t("access.title")}</p>
      <h2 className="mt-1 text-lg font-bold">{t("access.switch")}</h2>
      <p className="mt-1 text-sm text-muted">{t("access.lede")}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {roles.map((role) => {
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
