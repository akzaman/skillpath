import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { CATEGORIES } from "@/data/catalog";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-header text-on-header">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandMark onDark />
          <p className="mt-3 text-sm text-on-header/70">
            Mini-courses for life in Italy: tax, CAF, Patronato, immigration, driving licence,
            and Italian language.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold">Desks</p>
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
          <p className="text-sm font-bold">A public desk, online</p>
          <p className="mt-3 text-sm text-on-header/70">
            Built like a sportello: short lessons, the real forms, and no fixer in the car park.
          </p>
        </div>
      </div>
      <div className="border-t border-on-header/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <p className="text-xs text-on-header/50">© 2026 {APP_NAME}</p>
          <p className="text-xs text-on-header/50">{APP_TAGLINE}</p>
        </div>
      </div>
    </footer>
  );
}
