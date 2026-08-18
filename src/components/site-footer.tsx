import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { CATEGORIES } from "@/data/catalog";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t, category: trCat } = useI18n();
  return (
    <footer className="mt-auto bg-header text-on-header">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandMark onDark />
          <p className="mt-3 text-sm text-on-header/70">{t("footer.blurb")}</p>
        </div>
        <div>
          <p className="text-sm font-bold">{t("footer.desks")}</p>
          <ul className="mt-3 space-y-2 text-sm text-on-header/70">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link to="/catalog" search={{ category }} className="hover:text-on-header">
                  {trCat(category)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold">{t("footer.learn")}</p>
          <ul className="mt-3 space-y-2 text-sm text-on-header/70">
            <li>
              <Link to="/catalog" className="hover:text-on-header">
                {t("nav.allCourses")}
              </Link>
            </li>
            <li>
              <Link to="/library" className="hover:text-on-header">
                {t("nav.learning")}
              </Link>
            </li>
            <li>
              <Link to="/teach" className="hover:text-on-header">
                {t("nav.teach")}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-on-header">
                {t("nav.dashboard")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold">{t("footer.deskTitle")}</p>
          <p className="mt-3 text-sm text-on-header/70">{t("footer.deskBody")}</p>
        </div>
      </div>
      <div className="border-t border-on-header/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <p className="text-xs text-on-header/50">© 2026 {t("app.name")}</p>
          <p className="text-xs text-on-header/50">{t("app.tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
