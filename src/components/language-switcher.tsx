import { LOCALES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ onDark = false }: { onDark?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={cn(
        "flex shrink-0 items-center overflow-hidden rounded-full border text-[11px] font-bold tracking-wide",
        onDark ? "border-on-header/30" : "border-line",
      )}
    >
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setLocale(item.id)}
          className={cn(
            "px-2 py-1 transition-colors",
            locale === item.id
              ? onDark
                ? "bg-on-header text-header"
                : "bg-fg text-bg"
              : onDark
                ? "text-on-header/75 hover:text-on-header"
                : "text-muted hover:text-fg",
          )}
          aria-pressed={locale === item.id}
          title={item.name}
        >
          {item.native}
        </button>
      ))}
    </div>
  );
}
