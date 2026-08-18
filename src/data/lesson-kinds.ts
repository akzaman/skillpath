export const LESSON_KINDS = [
  "video",
  "text",
  "ppt",
  "pdf",
  "audio",
  "quiz",
  "survey",
  "assignment",
  "download",
  "live",
  "embedded",
  "scorm",
  "multiple",
] as const;

export type LessonKind = (typeof LESSON_KINDS)[number];

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
};

export type LessonItem = {
  label: string;
  url: string;
};

export type LessonTopic = {
  id: string;
  title: string;
  kind: LessonKind;
  sources?: { src: string; type: string }[];
  videoId?: string;
  customUrl?: string;
  content: LessonContent;
};

export type LessonContent = {
  body?: string;
  fileUrl?: string;
  embedUrl?: string;
  liveUrl?: string;
  liveAt?: string;
  assignmentPrompt?: string;
  questions?: QuizQuestion[];
  items?: LessonItem[];
  topics?: LessonTopic[];
};

export const LESSON_KIND_META: Record<
  LessonKind,
  { label: string; hint: string }
> = {
  video: { label: "Video", hint: "MP4, YouTube, Vimeo, Drive" },
  text: { label: "Text", hint: "Reading page" },
  ppt: { label: "PPT", hint: "PowerPoint or Slides" },
  pdf: { label: "PDF", hint: "Document viewer" },
  audio: { label: "Audio", hint: "MP3 or podcast" },
  quiz: { label: "Quiz", hint: "Scored questions" },
  survey: { label: "Survey", hint: "Opinion questions" },
  assignment: { label: "Assignment", hint: "Written task" },
  download: { label: "Download", hint: "File for students" },
  live: { label: "Live", hint: "Zoom or Meet" },
  embedded: { label: "Embedded", hint: "Any iframe URL" },
  scorm: { label: "SCORM/HTML", hint: "Packaged module" },
  multiple: { label: "Multiple", hint: "Several topics in one lesson" },
};

export function isLessonKind(value: string): value is LessonKind {
  return (LESSON_KINDS as readonly string[]).includes(value);
}

export function newTopicId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyTopic(kind: LessonKind = "video", title = "Topic 1"): LessonTopic {
  return {
    id: newTopicId(),
    title,
    kind,
    videoId: "custom",
    customUrl: "",
    content: {},
  };
}

export function topicsFromLesson(input: {
  title?: string;
  kind?: LessonKind;
  sources?: { src: string; type: string }[];
  content?: LessonContent;
}): LessonTopic[] {
  const stored = input.content?.topics;
  if (stored && stored.length > 0) {
    return stored.map((topic, index) => ({
      id: topic.id || newTopicId(),
      title: topic.title || `Topic ${index + 1}`,
      kind: isLessonKind(topic.kind) ? topic.kind : "video",
      sources: topic.sources ?? [],
      videoId: topic.videoId || "custom",
      customUrl: topic.customUrl || "",
      content: topic.content && typeof topic.content === "object" ? { ...topic.content, topics: undefined } : {},
    }));
  }
  const leftover = { ...(input.content ?? {}) };
  delete leftover.topics;
  return [
    {
      id: "main",
      title: input.title || "Topic 1",
      kind: input.kind ?? "video",
      sources: input.sources ?? [],
      videoId: "custom",
      customUrl: leftover.fileUrl || leftover.embedUrl || leftover.liveUrl || "",
      content: leftover,
    },
  ];
}
