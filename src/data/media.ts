import type { Category, Level, VideoSource } from "@/data/catalog";

export const POSTERS = [
  { src: "/courses/build.jpg", label: "Tax office" },
  { src: "/courses/written.jpg", label: "Dichiarazione" },
  { src: "/courses/interface.jpg", label: "CAF desk" },
  { src: "/courses/still.jpg", label: "Patronato" },
  { src: "/courses/light.jpg", label: "Driving school" },
  { src: "/courses/type.jpg", label: "A1 classroom" },
  { src: "/courses/color.jpg", label: "A2 classroom" },
  { src: "/courses/hero.jpg", label: "Conversation" },
  { src: "/courses/edit.jpg", label: "Questura" },
] as const;

export const VIDEO_LIBRARY: { id: string; label: string; sources: VideoSource[] }[] = [
  {
    id: "bunny",
    label: "Lesson film A",
    sources: [
      { src: "/videos/bunny.mp4", type: "video/mp4" },
      { src: "/videos/sintel.webm", type: "video/webm" },
    ],
  },
  {
    id: "sintel",
    label: "Lesson film B",
    sources: [
      { src: "/videos/sintel.mp4", type: "video/mp4" },
      { src: "/videos/sintel.webm", type: "video/webm" },
    ],
  },
  {
    id: "clip",
    label: "Lesson film C",
    sources: [
      { src: "/videos/clip.mp4", type: "video/mp4" },
      { src: "/videos/clip.webm", type: "video/webm" },
    ],
  },
  {
    id: "flower",
    label: "Lesson film D",
    sources: [
      { src: "/videos/flower.mp4", type: "video/mp4" },
      { src: "/videos/flower.webm", type: "video/webm" },
    ],
  },
];

export const CATEGORY_OPTIONS: Category[] = [
  "Fisco e tasse",
  "CAF e Patronato",
  "Lingua italiana",
  "Patente B",
  "Immigrazione",
  "Lavoro e impresa",
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
