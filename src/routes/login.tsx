import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Log in to Skillpath" }],
  }),
});

function LoginPage() {
  const { next } = Route.useSearch();
  return (
    <main className="min-h-dvh bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-fg">
            <span className="grid size-7 place-items-center rounded-sm bg-primary">
              <svg viewBox="0 0 12 12" className="size-3.5 fill-primary-fg" aria-hidden="true">
                <path d="M3 1.6v8.8L11 6z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">Skillpath</span>
          </Link>
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-md flex-col px-4 py-14">
        <AuthForm callbackURL={next ?? "/"} />
      </section>
    </main>
  );
}
