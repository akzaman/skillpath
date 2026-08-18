import { Link } from "@tanstack/react-router";
import { RatingRow } from "@/components/stars";
import { Progress } from "@/components/ui/progress";
import { type Course, courseDuration } from "@/data/catalog";
import { formatPrice, getMarket } from "@/data/market";
import { formatMinutes } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function CourseCard({
  course,
  progress,
  compact = false,
}: {
  course: Course;
  progress?: { completed: number; total: number };
  compact?: boolean;
}) {
  const { t } = useI18n();
  const market = getMarket(course.slug);
  const minutes = courseDuration(course);
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : null;

  return (
    <Link
      to="/course/$slug"
      params={{ slug: course.slug }}
      className="group flex flex-col overflow-hidden rounded-md bg-surface text-fg ring-1 ring-line transition-shadow duration-150 hover:shadow-card"
    >
      <div className="relative aspect-video overflow-hidden bg-elevated">
        <img
          src={course.poster}
          alt=""
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-base leading-snug font-bold text-fg">
          {course.title}
        </h3>
        {!compact ? (
          <p className="line-clamp-1 text-xs text-muted">{course.instructor.name}</p>
        ) : null}
        <RatingRow rating={market.rating} reviews={market.reviews} />
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold tabular-nums">{formatPrice(market.price)}</span>
          <span className="text-xs text-muted line-through tabular-nums">
            {formatPrice(market.listPrice)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {market.badge ? (
            <span className="rounded-sm bg-badge px-1.5 py-0.5 text-[11px] font-bold text-badge-fg">
              {market.badge === "Bestseller" ? t("card.bestseller") : market.badge}
            </span>
          ) : null}
          <span className="text-[11px] text-subtle tabular-nums">
            {t("card.lectures", { n: course.lessons.length, time: formatMinutes(minutes) })}
          </span>
        </div>
        {pct !== null ? (
          <div className="mt-2 flex items-center gap-2">
            <Progress value={pct} className="h-1.5 flex-1 bg-elevated" />
            <span className="text-xs font-medium tabular-nums text-muted">{pct}%</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
