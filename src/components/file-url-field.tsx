import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { getBearerToken } from "@/lib/auth/client";
import { uploadMediaToBucket, uploadVideoFile } from "@/lib/media-file";
import { getStorageStatus } from "@/lib/storage";

export function FileUrlField({
  label,
  value,
  onChange,
  accept,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept: string;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storage = useQuery({ queryKey: ["media-storage"], queryFn: () => getStorageStatus() });
  const cloud = Boolean(storage.data?.enabled);

  return (
    <div className="space-y-2">
      <Field label={label}>
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://…" />
      </Field>
      <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-medium hover:border-fg">
        {busy ? "Uploading…" : cloud ? "Upload file" : "Upload small file (4 MB)"}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setBusy(true);
            setError(null);
            const task = cloud ? uploadMediaToBucket(file) : uploadVideoFile(file, getBearerToken());
            void task
              .then(onChange)
              .catch((err) => setError(err instanceof Error ? err.message : "Upload failed"))
              .finally(() => setBusy(false));
          }}
        />
      </label>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
