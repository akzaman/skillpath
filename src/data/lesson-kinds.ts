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

export type LessonContent = {
  body?: string;
  fileUrl?: string;
  embedUrl?: string;
  liveUrl?: string;
  liveAt?: string;
  assignmentPrompt?: string;
  questions?: QuizQuestion[];
  items?: LessonItem[];
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
  multiple: { label: "Multiple", hint: "Several files" },
};

export function isLessonKind(value: string): value is LessonKind {
  return (LESSON_KINDS as readonly string[]).includes(value);
}
