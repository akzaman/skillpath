import { useState } from "react";
import { Download, ExternalLink, Radio } from "lucide-react";
import type { Lesson } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/field";
import { LessonKindIcon } from "@/components/lesson-type-picker";
import { PdfViewer } from "@/components/pdf-viewer";
import { VideoPlayer } from "@/components/video-player";
import { topicsFromLesson, type LessonTopic } from "@/data/lesson-kinds";
import { embedSrc, parseVideoUrl } from "@/lib/video-url";
import { cn } from "@/lib/utils";

export function LessonViewer({
  lesson,
  courseSlug,
  poster,
  initialTime,
  onProgress,
  onEnded,
  onComplete,
}: {
  lesson: Lesson;
  courseSlug?: string;
  poster?: string;
  initialTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
  onComplete?: () => void;
}) {
  const topics =
    lesson.topics && lesson.topics.length > 0
      ? lesson.topics
      : topicsFromLesson({
          title: lesson.title,
          kind: lesson.kind,
          sources: lesson.sources,
          content: lesson.content,
        });
  const [activeId, setActiveId] = useState(topics[0]?.id ?? "main");
  const topic = topics.find((item) => item.id === activeId) ?? topics[0];
  const item = topicToLesson(lesson, topic);

  const body = (
    <LessonItem
      lesson={item}
      courseSlug={courseSlug}
      topicId={topics.length > 1 ? topic?.id : undefined}
      poster={poster}
      initialTime={initialTime}
      onProgress={onProgress}
      onEnded={onEnded}
      onComplete={onComplete}
    />
  );

  if (topics.length <= 1) return body;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {topics.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setActiveId(entry.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
              entry.id === topic?.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-line bg-surface text-muted hover:text-fg",
            )}
          >
            <LessonKindIcon kind={entry.kind} className="size-3.5" />
            {index + 1}. {entry.title}
          </button>
        ))}
      </div>
      {body}
    </div>
  );
}

function topicToLesson(lesson: Lesson, topic?: LessonTopic): Lesson {
  if (!topic) return lesson;
  return {
    ...lesson,
    title: topic.title || lesson.title,
    kind: topic.kind,
    sources: topic.sources?.length ? topic.sources : lesson.sources,
    content: topic.content ?? {},
    topics: [],
  };
}

function LessonItem({
  lesson,
  courseSlug,
  topicId,
  poster,
  initialTime,
  onProgress,
  onEnded,
  onComplete,
}: {
  lesson: Lesson;
  courseSlug?: string;
  topicId?: string;
  poster?: string;
  initialTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
  onComplete?: () => void;
}) {
  const kind = lesson.kind ?? "video";
  const content = lesson.content ?? {};
  const file = content.fileUrl || lesson.sources[0]?.src || "";
  const query = topicId ? `?topic=${encodeURIComponent(topicId)}` : "";
  const protectedSrc = courseSlug ? `/api/lessons/${courseSlug}/${lesson.slug}/file${query}` : file;

  if (kind === "video") {
    return (
      <VideoPlayer
        key={`${lesson.slug}-${topicId ?? "main"}`}
        sources={lesson.sources}
        poster={poster}
        title={lesson.title}
        initialTime={initialTime}
        onProgress={onProgress}
        onEnded={onEnded}
      />
    );
  }

  if (kind === "audio") {
    return (
      <div className="rounded-xl border border-line bg-elevated p-6">
        <audio
          className="w-full"
          controls
          src={file || protectedSrc}
          onEnded={onEnded}
          onTimeUpdate={(event) => {
            const el = event.currentTarget;
            onProgress?.(el.currentTime, el.duration || 0);
          }}
        />
      </div>
    );
  }

  if (kind === "text") {
    return (
      <article className="rounded-xl border border-line bg-surface p-6 text-sm leading-relaxed whitespace-pre-wrap">
        {content.body || lesson.transcript || "This reading has no text yet."}
      </article>
    );
  }

  if (kind === "pdf") {
    if (!protectedSrc) return <Empty label="No file attached to this lesson." />;
    return <PdfViewer src={protectedSrc} title={lesson.title} />;
  }

  if (kind === "ppt" || kind === "scorm") {
    if (!protectedSrc) return <Empty label="No file attached to this lesson." />;
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-elevated">
        <iframe title={lesson.title} src={protectedSrc} className="h-[70vh] w-full bg-canvas" />
        <p className="px-3 py-2 text-xs text-muted">View only — download is disabled.</p>
      </div>
    );
  }

  if (kind === "download") {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <Download className="size-8 text-muted" />
        <p className="mt-3 text-sm text-muted">This topic is a downloadable file.</p>
        {protectedSrc ? (
          <Button asChild className="mt-4" onClick={() => onComplete?.()}>
            <a href={protectedSrc}>Download file</a>
          </Button>
        ) : (
          <p className="mt-2 text-sm text-danger">No file attached.</p>
        )}
      </div>
    );
  }

  if (kind === "embedded") {
    const url = content.embedUrl || file;
    if (!url) return <Empty label="No embed URL." />;
    const media = parseVideoUrl(url);
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-header">
        <iframe
          title={lesson.title}
          src={media ? embedSrc(media) || url : url}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (kind === "live") {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <Radio className="size-8 text-muted" />
        <p className="mt-3 text-sm text-muted">
          {content.liveAt
            ? `Live session: ${new Date(content.liveAt).toLocaleString()}`
            : "Live classroom"}
        </p>
        {content.liveUrl ? (
          <Button asChild className="mt-4">
            <a href={content.liveUrl} target="_blank" rel="noreferrer">
              Join live <ExternalLink className="size-4" />
            </a>
          </Button>
        ) : (
          <p className="mt-2 text-sm">The meeting link will appear here.</p>
        )}
      </div>
    );
  }

  if (kind === "assignment") {
    return <AssignmentBox prompt={content.assignmentPrompt ?? ""} onComplete={onComplete} />;
  }

  if (kind === "quiz" || kind === "survey") {
    return (
      <QuizBox
        questions={content.questions ?? []}
        survey={kind === "survey"}
        onComplete={onComplete}
      />
    );
  }

  if (kind === "multiple") {
    return <Empty label="Open a topic above." />;
  }

  return <Empty label="This lesson type cannot be shown." />;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="grid aspect-video place-items-center rounded-xl border border-line bg-elevated text-sm text-muted">
      {label}
    </div>
  );
}

function AssignmentBox({
  prompt,
  onComplete,
}: {
  prompt: string;
  onComplete?: () => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{prompt || "Complete the assignment below."}</p>
      <TextArea className="mt-4" value={text} onChange={(event) => setText(event.target.value)} />
      <Button className="mt-3" disabled={text.trim().length < 8} onClick={() => onComplete?.()}>
        Submit assignment
      </Button>
    </div>
  );
}

function QuizBox({
  questions,
  survey,
  onComplete,
}: {
  questions: { id: string; prompt: string; choices: string[]; answer: number }[];
  survey: boolean;
  onComplete?: () => void;
}) {
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const score = questions.filter((q) => q.answer >= 0 && picks[q.id] === q.answer).length;
  const total = questions.filter((q) => q.answer >= 0).length;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-5">
      {questions.length === 0 ? <p className="text-sm text-muted">No questions yet.</p> : null}
      {questions.map((question, index) => (
        <fieldset key={question.id} className="space-y-2">
          <legend className="text-sm font-medium">
            {index + 1}. {question.prompt}
          </legend>
          {question.choices.map((choice, choiceIndex) => (
            <label key={choiceIndex} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={question.id}
                checked={picks[question.id] === choiceIndex}
                disabled={done}
                onChange={() => setPicks((prev) => ({ ...prev, [question.id]: choiceIndex }))}
              />
              {choice}
            </label>
          ))}
        </fieldset>
      ))}
      {done ? (
        <p className="text-sm font-medium">
          {survey ? "Thanks, your answers were saved." : `Score: ${score} / ${total || questions.length}`}
        </p>
      ) : (
        <Button
          disabled={questions.some((q) => picks[q.id] === undefined)}
          onClick={() => {
            setDone(true);
            onComplete?.();
          }}
        >
          Submit
        </Button>
      )}
    </div>
  );
}