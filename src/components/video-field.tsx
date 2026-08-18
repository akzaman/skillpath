import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Field, SelectField } from "@/components/field";
import { Input } from "@/components/ui/input";
import { VIDEO_LIBRARY } from "@/data/media";
import { getBearerToken } from "@/lib/auth/client";
import { uploadVideoFile, uploadVideoToBucket } from "@/lib/media-file";
import { getStorageStatus } from "@/lib/storage";

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
  const storage = useQuery({ queryKey: ["media-storage"], queryFn: () => getStorageStatus() });
  const cloud = Boolean(storage.data?.enabled);

  return (
    <div className="space-y-3">
      <Field label="Video">
        <SelectField value={videoId} onChange={(event) => onVideoId(event.target.value)}>
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
            {busy ? "Uploading…" : cloud ? "Upload long video (up to 2 GB)" : "Upload video file (4 MB)"}
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
                const task = cloud
                  ? uploadVideoToBucket(file)
                  : uploadVideoFile(file, getBearerToken());
                void task
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
            {cloud
              ? "Files go to your cloud bucket (MP4/WebM up to 2 GB). You can still paste YouTube, Vimeo, or Drive."
              : "Built-in upload is 4 MB. Add Cloudflare R2 or Google Cloud (S3 keys) on Vercel to send long MP4s. Or paste YouTube / Drive."}
          </p>
        </>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
