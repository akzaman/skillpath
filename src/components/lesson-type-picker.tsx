import {
  ClipboardList,
  Code2,
  Download,
  FileCode2,
  FileQuestion,
  FileText,
  Headphones,
  Layers,
  Presentation,
  Radio,
  Type,
  Video,
} from "lucide-react";
import { LESSON_KIND_META, LESSON_KINDS, type LessonKind } from "@/data/lesson-kinds";
import { cn } from "@/lib/utils";

const ICONS: Record<LessonKind, typeof Video> = {
  video: Video,
  text: Type,
  ppt: Presentation,
  pdf: FileText,
  audio: Headphones,
  quiz: FileQuestion,
  survey: ClipboardList,
  assignment: FileText,
  download: Download,
  live: Radio,
  embedded: Code2,
  scorm: FileCode2,
  multiple: Layers,
};

export function LessonTypePicker({
  value,
  onChange,
}: {
  value: LessonKind;
  onChange: (kind: LessonKind) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-center text-sm font-medium">Please select new lesson type</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {LESSON_KINDS.map((kind) => {
          const Icon = ICONS[kind];
          const meta = LESSON_KIND_META[kind];
          const active = value === kind;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => onChange(kind)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-md border bg-surface px-2 py-4 text-center transition-colors",
                active ? "border-primary text-primary" : "border-line text-muted hover:border-fg hover:text-fg",
              )}
            >
              <span className="grid size-10 place-items-center rounded-full bg-canvas">
                <Icon className="size-5" />
              </span>
              <span className="text-[11px] font-bold tracking-wide uppercase">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LessonKindIcon({ kind, className }: { kind: LessonKind; className?: string }) {
  const Icon = ICONS[kind] ?? Video;
  return <Icon className={className} />;
}
