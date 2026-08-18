import type { Category, Level, VideoSource } from "@/data/catalog";

export const POSTERS = [
  { src: "/courses/type.jpg", label: "Type studio" },
  { src: "/courses/light.jpg", label: "Window light" },
  { src: "/courses/interface.jpg", label: "Interface" },
  { src: "/courses/written.jpg", label: "Writing desk" },
  { src: "/courses/color.jpg", label: "Color" },
  { src: "/courses/build.jpg", label: "Workshop" },
  { src: "/courses/still.jpg", label: "Still life" },
  { src: "/courses/edit.jpg", label: "Edit bay" },
  { src: "/courses/hero.jpg", label: "Studio hero" },
] as const;

export const VIDEO_LIBRARY: { id: string; label: string; sources: VideoSource[] }[] = [
  {
    id: "bunny",
    label: "Clip A — character study",
    sources: [
      { src: "/videos/bunny.mp4", type: "video/mp4" },
      { src: "/videos/sintel.webm", type: "video/webm" },
    ],
  },
  {
    id: "sintel",
    label: "Clip B — cinematic trailer",
    sources: [
      { src: "/videos/sintel.mp4", type: "video/mp4" },
      { src: "/videos/sintel.webm", type: "video/webm" },
    ],
  },
  {
    id: "clip",
    label: "Clip C — motion study",
    sources: [
      { src: "/videos/clip.mp4", type: "video/mp4" },
      { src: "/videos/clip.webm", type: "video/webm" },
    ],
  },
  {
    id: "flower",
    label: "Clip D — still life motion",
    sources: [
      { src: "/videos/flower.mp4", type: "video/mp4" },
      { src: "/videos/flower.webm", type: "video/webm" },
    ],
  },
];

export const CATEGORY_OPTIONS: Category[] = [
  "Design",
  "Photography",
  "Craft",
  "Engineering",
  "Writing",
  "Cinema",
];

export const LEVEL_OPTIONS: Level[] = ["Foundations", "Intermediate", "Advanced"];

export function sourcesForVideoId(id: string): VideoSource[] {
  return VIDEO_LIBRARY.find((item) => item.id === id)?.sources ?? VIDEO_LIBRARY[0]!.sources;
}

export function resolveVideoSources(videoId: string, customUrl?: string): VideoSource[] {
  const url = customUrl?.trim() ?? "";
  if (videoId === "custom" && url) {
    const type = url.includes(".webm") ? "video/webm" : "video/mp4";
    return [{ src: url, type }];
  }
  return sourcesForVideoId(videoId);
}

export function videoIdFromSources(sources: VideoSource[]): string {
  const first = sources[0]?.src ?? "";
  const match = VIDEO_LIBRARY.find((item) => item.sources.some((source) => source.src === first));
  return match?.id ?? "custom";
}

export function customUrlFromSources(sources: VideoSource[]): string {
  if (videoIdFromSources(sources) !== "custom") return "";
  return sources[0]?.src ?? "";
}
