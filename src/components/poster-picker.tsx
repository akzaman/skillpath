import { useState } from "react";
import { POSTERS } from "@/data/media";
import { compressImageFile } from "@/lib/media-file";
import { cn } from "@/lib/utils";

export function PosterPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (src: string) => void;
}) {
  const [url, setUrl] = useState(value.startsWith("http") ? value : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {value ? (
        <img src={value} alt="" className="aspect-video w-full max-w-sm rounded-md object-cover ring-1 ring-line" />
      ) : null}
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
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-medium hover:border-fg">
          {busy ? "Compressing…" : "Upload photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setBusy(true);
              setError(null);
              void compressImageFile(file)
                .then((src) => {
                  onChange(src);
                  setUrl("");
                })
                .catch(() => setError("Could not read that image"))
                .finally(() => setBusy(false));
            }}
          />
        </label>
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onBlur={() => {
            const next = url.trim();
            if (next) onChange(next);
          }}
          placeholder="https://…/poster.jpg"
          className="h-10 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
