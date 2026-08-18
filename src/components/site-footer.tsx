import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/catalog";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-header text-on-header">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-lg font-bold">Skillpath</p>
          <p className="mt-2 text-sm text-on-header/70">
            A marketplace for video courses in design, photography, writing, cinema, and
            engineering.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold">Discover</p>
          <ul className="mt-3 space-y-2 text-sm text-on-header/70">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link to="/catalog" search={{ category }} className="hover:text-on-header">
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-on-header/70">
            <li>
              <Link to="/catalog" className="hover:text-on-header">
                All courses
              </Link>
            </li>
            <li>
              <Link to="/library" className="hover:text-on-header">
                My learning
              </Link>
            </li>
            <li>
              <Link to="/teach" className="hover:text-on-header">
                Teach
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-on-header">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold">Teach</p>
          <p className="mt-3 text-sm text-on-header/70">
            Practitioners on Skillpath keep the work they still do. Courses stay short,
            specific, and usable on Monday.
          </p>
        </div>
      </div>
      <div className="border-t border-on-header/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <p className="text-xs text-on-header/50">© 2026 Skillpath, Inc.</p>
          <p className="text-xs text-on-header/50">Learn a skill. Keep it.</p>
        </div>
      </div>
    </footer>
  );
}
