import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { AuthSlot } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CATEGORIES } from "@/data/catalog";
import { canAdmin, canTeach } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";
import { cn } from "@/lib/utils";

export function SiteHeader(_props?: { solid?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [explore, setExplore] = useState(false);

  const nav = [
    { to: "/catalog" as const, label: "Courses" },
    ...(user
      ? [
          { to: "/dashboard" as const, label: "Dashboard" },
          { to: "/progress" as const, label: "Progress" },
          { to: "/library" as const, label: "My learning" },
        ]
      : []),
    ...(profile && canTeach(profile.role)
      ? [{ to: "/teach" as const, label: "Teach" }]
      : []),
    ...(profile && canAdmin(profile.role)
      ? [{ to: "/admin" as const, label: "Admin" }]
      : []),
  ];

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    void navigate({ to: "/catalog", search: { q: query.trim() || undefined } });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-header bg-header text-on-header">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-on-header hover:bg-on-header/10 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>

        <Link to="/" className="flex shrink-0 items-center gap-2 text-on-header">
          <span className="grid size-7 place-items-center rounded-sm bg-primary">
            <svg viewBox="0 0 12 12" className="size-3.5 fill-primary-fg" aria-hidden="true">
              <path d="M3 1.6v8.8L11 6z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">Skillpath</span>
        </Link>

        <div className="relative hidden md:block">
          <button
            type="button"
            className="h-10 px-3 text-sm text-on-header/80 hover:text-on-header"
            onClick={() => setExplore((value) => !value)}
            onBlur={() => window.setTimeout(() => setExplore(false), 150)}
          >
            Explore
          </button>
          {explore ? (
            <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-md border border-line bg-surface py-2 text-fg shadow-soft">
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  to="/catalog"
                  search={{ category }}
                  className="block px-4 py-2 text-sm hover:bg-elevated"
                  onClick={() => setExplore(false)}
                >
                  {category}
                </Link>
              ))}
              <Link
                to="/catalog"
                className="block border-t border-line px-4 py-2 text-sm font-medium hover:bg-elevated"
                onClick={() => setExplore(false)}
              >
                All courses
              </Link>
            </div>
          ) : null}
        </div>

        <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for anything"
              className="h-11 w-full rounded-full border border-line-strong bg-surface pr-4 pl-10 text-sm text-fg placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            />
          </label>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-sm px-3 py-2 text-sm text-on-header/80 hover:text-on-header",
                pathname.startsWith(item.to) && "text-on-header",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <AuthSlot onDark />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="bg-surface text-fg">
          <SheetHeader>
            <SheetTitle>Skillpath</SheetTitle>
          </SheetHeader>
          <form onSubmit={submitSearch} className="mt-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for anything"
                className="h-11 w-full rounded-full border border-line bg-elevated pr-4 pl-10 text-sm text-fg placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              />
            </label>
          </form>
          <nav className="mt-4 flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base hover:bg-elevated"
              >
                {item.label}
              </Link>
            ))}
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                to="/catalog"
                search={{ category }}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base text-muted hover:bg-elevated hover:text-fg"
              >
                {category}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
