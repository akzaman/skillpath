import { Link } from "@tanstack/react-router";
import { APP_NAME, APP_SHORT } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandMark({
  onDark = false,
  compact = false,
}: {
  onDark?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        onDark ? "text-on-header" : "text-fg",
      )}
    >
      <span
        className="flex size-8 shrink-0 overflow-hidden rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
        aria-hidden="true"
      >
        <span className="h-full w-1/3 bg-[#009246]" />
        <span className="h-full w-1/3 bg-white" />
        <span className="h-full w-1/3 bg-[#ce2b37]" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase opacity-70">
          {APP_SHORT} · Italy
        </span>
        <span className="block font-bold tracking-tight text-sm sm:text-[15px]">
          <span className="sm:hidden">{APP_SHORT}</span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </span>
      </span>
    </Link>
  );
}
