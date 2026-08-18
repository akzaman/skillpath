import { POSTERS } from "@/data/media";
import { cn } from "@/lib/utils";

export function PosterPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (src: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {POSTERS.map((item) => (
        <button
          key={item.src}
          type="button"
          onClick={() => onChange(item.src)}
          className={cn(
            "overflow-hidden rounded-md border-2",
            value === item.src ? "border-primary" : "border-transparent hover:border-line-strong",
          )}
        >
          <img src={item.src} alt={item.label} className="aspect-video w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
