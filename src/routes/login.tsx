import { createFileRoute } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { AuthForm } from "@/components/auth-form";
import { APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  component: LoginPage,
  head: () => ({
    meta: [{ title: `Log in — ${APP_NAME}` }],
  }),
});

function LoginPage() {
  const { next } = Route.useSearch();
  return (
    <main className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
          <BrandMark />
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-md flex-col px-4 py-14">
        <AuthForm callbackURL={next ?? "/"} />
      </section>
    </main>
  );
}
