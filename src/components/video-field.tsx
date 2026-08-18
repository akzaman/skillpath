import { useState } from "react";
import { Field, SelectField } from "@/components/field";
import { Input } from "@/components/ui/input";
import { VIDEO_LIBRARY } from "@/data/media";
import { getBearerToken } from "@/lib/auth/client";
import { uploadVideoFile } from "@/lib/media-file";

export function VideoField({
  videoId,
  customUrl,
  onVideoId,
  onCustomUrl,
}: {
  videoId: string;
  customUrl: string;
  onVideoId: (id: string) => void;
  onCustomUrl: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Field label="Video">
        <SelectField
          value={videoId}
          onChange={(event) => onVideoId(event.target.value)}
        >
          {VIDEO_LIBRARY.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
          <option value="custom">Uploaded file or URL</option>
        </SelectField>
      </Field>
      {videoId === "custom" ? (
        <>
          <Field label="Video URL (MP4, YouTube, Vimeo, or Google Drive)">
            <Input
              value={customUrl}
              onChange={(event) => onCustomUrl(event.target.value)}
              placeholder="https://drive.google.com/file/d/…/view"
            />
          </Field>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-medium hover:border-fg">
            {busy ? "Uploading…" : "Upload video file"}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className="sr-only"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setBusy(true);
                setError(null);
                void uploadVideoFile(file, getBearerToken())
                  .then((url) => {
                    onVideoId("custom");
                    onCustomUrl(url);
                  })
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : "Upload failed"),
                  )
                  .finally(() => setBusy(false));
              }}
            />
          </label>
          <p className="text-xs text-muted">
            Upload an MP4/WebM up to 4 MB, or paste a hosted file, YouTube, Vimeo, or
            Google Drive link. Drive files must be shared as “Anyone with the link”.
          </p>
        </>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
