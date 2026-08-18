export type ParsedVideo =
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "file"; src: string };

export function parseVideoUrl(url: string): ParsedVideo {
  const value = url.trim();
  const youtube = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/,
  );
  if (youtube?.[1]) return { kind: "youtube", id: youtube[1] };
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) return { kind: "vimeo", id: vimeo[1] };
  return { kind: "file", src: value };
}

export function embedSrc(parsed: ParsedVideo): string | null {
  if (parsed.kind === "youtube") {
    return `https://www.youtube.com/embed/${parsed.id}?rel=0&modestbranding=1`;
  }
  if (parsed.kind === "vimeo") {
    return `https://player.vimeo.com/video/${parsed.id}`;
  }
  return null;
}
