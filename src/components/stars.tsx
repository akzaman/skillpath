import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const icon = size === "md" ? "size-4" : "size-3.5";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = rating >= index + 0.75;
        const half = !filled && rating >= index + 0.25;
        return (
          <Star
            key={index}
            className={cn(
              icon,
              filled || half ? "text-star" : "text-line",
              filled && "fill-star",
              half && "fill-star/50",
            )}
          />
        );
      })}
    </span>
  );
}

export function RatingRow({
  rating,
  reviews,
  students,
}: {
  rating: number;
  reviews?: number;
  students?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="font-bold text-star tabular-nums">{rating.toFixed(1)}</span>
      <Stars rating={rating} />
      {reviews !== undefined ? (
        <span className="text-muted">({reviews.toLocaleString()} ratings)</span>
      ) : null}
      {students !== undefined ? (
        <span className="text-muted">{students.toLocaleString()} students</span>
      ) : null}
    </div>
  );
}
