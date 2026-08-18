export type ParsedVideo =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "drive"; id: string }
  | { kind: "file"; src: string };

function driveId(url: string): string | null {
  const file = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (file?.[1]) return file[1];
  const docs = url.match(/docs\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (docs?.[1]) return docs[1];
  const query = url.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (query?.[1] && /google\.com/.test(url)) return query[1];
  return null;
}

export function parseVideoUrl(url: string): ParsedVideo {
  const value = url.trim();
  const youtube = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/,
  );
  if (youtube?.[1]) return { kind: "youtube", id: youtube[1] };
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) return { kind: "vimeo", id: vimeo[1] };
  const drive = driveId(value);
  if (drive) return { kind: "drive", id: drive };
  return { kind: "file", src: value };
}

export function embedSrc(parsed: ParsedVideo): string | null {
  if (parsed.kind === "youtube") {
    return `https://www.youtube.com/embed/${parsed.id}?rel=0&modestbranding=1`;
  }
  if (parsed.kind === "vimeo") {
    return `https://player.vimeo.com/video/${parsed.id}`;
  }
  if (parsed.kind === "drive") {
    return `https://drive.google.com/file/d/${parsed.id}/preview`;
  }
  return null;
}
