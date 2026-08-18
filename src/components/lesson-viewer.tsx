import { useState } from "react";
import { Download, ExternalLink, Radio } from "lucide-react";
import type { Lesson } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/field";
import { VideoPlayer } from "@/components/video-player";
import { embedSrc, parseVideoUrl } from "@/lib/video-url";

function viewerUrl(url: string): string {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
}

export function LessonViewer({
  lesson,
  poster,
  initialTime,
  onProgress,
  onEnded,
  onComplete,
}: {
  lesson: Lesson;
  poster?: string;
  initialTime?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
  onComplete?: () => void;
}) {
  const kind = lesson.kind ?? "video";
  const content = lesson.content ?? {};
  const file = content.fileUrl || lesson.sources[0]?.src || "";

  if (kind === "video") {
    return (
      <VideoPlayer
        key={lesson.slug}
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
          src={file}
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

  if (kind === "pdf" || kind === "ppt" || kind === "scorm") {
    if (!file) {
      return <Empty label="No file attached to this lesson." />;
    }
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-elevated">
        <iframe title={lesson.title} src={kind === "scorm" ? file : viewerUrl(file)} className="h-[70vh] w-full" />
        <div className="flex justify-end p-3">
          <Button asChild variant="outline" size="sm">
            <a href={file} target="_blank" rel="noreferrer">
              Open file
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (kind === "download") {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <Download className="size-8 text-muted" />
        <p className="mt-3 text-sm text-muted">Download the material for this lesson.</p>
        {file ? (
          <Button asChild className="mt-4" onClick={() => onComplete?.()}>
            <a href={file} target="_blank" rel="noreferrer">
              Download file
            </a>
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
    const items = content.items ?? [];
    return (
      <div className="rounded-xl border border-line bg-surface p-5">
        <ul className="space-y-3">
          {items.length === 0 ? <li className="text-sm text-muted">No materials yet.</li> : null}
          {items.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
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
      <TextArea
        className="mt-4"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button
        className="mt-3"
        disabled={text.trim().length < 8}
        onClick={() => onComplete?.()}
      >
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
