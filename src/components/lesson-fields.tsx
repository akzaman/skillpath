import { Field, TextArea } from "@/components/field";
import { FileUrlField } from "@/components/file-url-field";
import { LessonKindIcon, LessonTypePicker } from "@/components/lesson-type-picker";
import { VideoField } from "@/components/video-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VIDEO_LIBRARY } from "@/data/media";
import {
  emptyTopic,
  LESSON_KIND_META,
  newTopicId,
  topicsFromLesson,
  type LessonContent,
  type LessonKind,
  type LessonTopic,
  type QuizQuestion,
} from "@/data/lesson-kinds";

export type TopicDraft = {
  id: string;
  title: string;
  kind: LessonKind;
  videoId: string;
  customUrl: string;
  content: LessonContent;
};

export type LessonDraft = {
  kind: LessonKind;
  videoId: string;
  customUrl: string;
  content: LessonContent;
  topics: TopicDraft[];
};

export function draftFromTopics(topics: TopicDraft[], fallback?: Partial<LessonDraft>): LessonDraft {
  const first = topics[0];
  return {
    kind: topics.length > 1 ? "multiple" : first?.kind ?? fallback?.kind ?? "video",
    videoId: first?.videoId ?? fallback?.videoId ?? VIDEO_LIBRARY[0]!.id,
    customUrl: first?.customUrl ?? fallback?.customUrl ?? "",
    content: { ...(first?.content ?? {}), topics },
    topics,
  };
}

export function lessonToDraft(lesson: {
  title?: string;
  kind?: LessonKind;
  sources?: { src: string; type: string }[];
  content?: LessonContent;
}): LessonDraft {
  const topics = topicsFromLesson(lesson).map((topic) => topicToDraft(topic));
  return draftFromTopics(topics.length ? topics : [emptyDraftTopic()]);
}

export function emptyDraftTopic(kind: LessonKind = "video", title = "Topic 1"): TopicDraft {
  const topic = emptyTopic(kind, title);
  return topicToDraft(topic);
}

function topicToDraft(topic: LessonTopic): TopicDraft {
  return {
    id: topic.id || newTopicId(),
    title: topic.title,
    kind: topic.kind,
    videoId: topic.videoId || VIDEO_LIBRARY[0]!.id,
    customUrl: topic.customUrl || topic.content.fileUrl || "",
    content: { ...topic.content, topics: undefined },
  };
}

function newQuestion(survey: boolean): QuizQuestion {
  return {
    id: Math.random().toString(36).slice(2, 8),
    prompt: "",
    choices: ["", ""],
    answer: survey ? -1 : 0,
  };
}

function QuestionEditor({
  questions,
  survey,
  onChange,
}: {
  questions: QuizQuestion[];
  survey: boolean;
  onChange: (next: QuizQuestion[]) => void;
}) {
  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div key={question.id} className="space-y-2 rounded-md border border-line p-3">
          <Field label={`Question ${index + 1}`}>
            <Input
              value={question.prompt}
              onChange={(event) =>
                onChange(
                  questions.map((item) =>
                    item.id === question.id ? { ...item, prompt: event.target.value } : item,
                  ),
                )
              }
            />
          </Field>
          {question.choices.map((choice, choiceIndex) => (
            <div key={choiceIndex} className="flex items-center gap-2">
              {!survey ? (
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  checked={question.answer === choiceIndex}
                  onChange={() =>
                    onChange(
                      questions.map((item) =>
                        item.id === question.id ? { ...item, answer: choiceIndex } : item,
                      ),
                    )
                  }
                />
              ) : null}
              <Input
                value={choice}
                onChange={(event) =>
                  onChange(
                    questions.map((item) =>
                      item.id === question.id
                        ? {
                            ...item,
                            choices: item.choices.map((entry, i) =>
                              i === choiceIndex ? event.target.value : entry,
                            ),
                          }
                        : item,
                    ),
                  )
                }
                placeholder={`Choice ${choiceIndex + 1}`}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onChange(
                  questions.map((item) =>
                    item.id === question.id ? { ...item, choices: [...item.choices, ""] } : item,
                  ),
                )
              }
            >
              Add choice
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange(questions.filter((item) => item.id !== question.id))}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...questions, newQuestion(survey)])}>
        Add question
      </Button>
    </div>
  );
}

function TopicFields({
  value,
  onChange,
}: {
  value: TopicDraft;
  onChange: (next: TopicDraft) => void;
}) {
  const content = value.content;
  const setContent = (patch: Partial<LessonContent>) =>
    onChange({ ...value, content: { ...content, ...patch } });

  return (
    <div className="space-y-4">
      <LessonTypePicker value={value.kind} onChange={(kind) => onChange({ ...value, kind })} />
      {value.kind === "video" ? (
        <VideoField
          videoId={value.videoId}
          customUrl={value.customUrl}
          onVideoId={(videoId) => onChange({ ...value, videoId })}
          onCustomUrl={(customUrl) => onChange({ ...value, customUrl })}
        />
      ) : null}
      {value.kind === "text" ? (
        <Field label="Topic text">
          <TextArea
            value={content.body ?? ""}
            onChange={(event) => setContent({ body: event.target.value })}
          />
        </Field>
      ) : null}
      {value.kind === "audio" ? (
        <FileUrlField
          label="Audio file or URL"
          value={content.fileUrl ?? value.customUrl}
          onChange={(fileUrl) => onChange({ ...value, customUrl: fileUrl, content: { ...content, fileUrl } })}
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,.mp3,.wav,.ogg,.m4a"
        />
      ) : null}
      {value.kind === "pdf" || value.kind === "ppt" || value.kind === "download" || value.kind === "scorm" ? (
        <FileUrlField
          label={value.kind === "scorm" ? "SCORM / HTML URL" : "File URL"}
          value={content.fileUrl ?? ""}
          onChange={(fileUrl) => setContent({ fileUrl })}
          accept={
            value.kind === "pdf"
              ? "application/pdf,.pdf"
              : value.kind === "ppt"
                ? ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                : value.kind === "scorm"
                  ? ".zip,.html,text/html,application/zip"
                  : "*/*"
          }
          hint={
            value.kind === "pdf"
              ? "Students can only view this PDF in the lesson player. They do not get a download link."
              : undefined
          }
        />
      ) : null}
      {value.kind === "embedded" ? (
        <Field label="Embed URL">
          <Input
            value={content.embedUrl ?? ""}
            onChange={(event) => setContent({ embedUrl: event.target.value })}
            placeholder="https://…"
          />
        </Field>
      ) : null}
      {value.kind === "live" ? (
        <>
          <Field label="Meeting URL">
            <Input
              value={content.liveUrl ?? ""}
              onChange={(event) => setContent({ liveUrl: event.target.value })}
              placeholder="https://zoom.us/j/…"
            />
          </Field>
          <Field label="Starts at">
            <Input
              type="datetime-local"
              value={content.liveAt ?? ""}
              onChange={(event) => setContent({ liveAt: event.target.value })}
            />
          </Field>
        </>
      ) : null}
      {value.kind === "assignment" ? (
        <Field label="Assignment brief">
          <TextArea
            value={content.assignmentPrompt ?? ""}
            onChange={(event) => setContent({ assignmentPrompt: event.target.value })}
          />
        </Field>
      ) : null}
      {value.kind === "quiz" || value.kind === "survey" ? (
        <QuestionEditor
          questions={content.questions ?? []}
          survey={value.kind === "survey"}
          onChange={(questions) => setContent({ questions })}
        />
      ) : null}
    </div>
  );
}

export function LessonFields({
  value,
  onChange,
}: {
  value: LessonDraft;
  onChange: (next: LessonDraft) => void;
}) {
  const topics = value.topics.length ? value.topics : [emptyDraftTopic()];

  function setTopics(next: TopicDraft[]) {
    onChange(draftFromTopics(next, value));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold">Topics in this lesson</p>
        <p className="text-xs text-muted">
          One lesson can hold several items — video, PDF, quiz, text — in order.
        </p>
      </div>
      {topics.map((topic, index) => (
        <div key={topic.id} className="space-y-3 rounded-md border border-line p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-canvas text-muted">
              <LessonKindIcon kind={topic.kind} className="size-4" />
            </span>
            <Input
              value={topic.title}
              onChange={(event) =>
                setTopics(
                  topics.map((item) =>
                    item.id === topic.id ? { ...item, title: event.target.value } : item,
                  ),
                )
              }
              placeholder={`Topic ${index + 1}`}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={index === 0}
              onClick={() => {
                const next = [...topics];
                [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
                setTopics(next);
              }}
            >
              Up
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={index === topics.length - 1}
              onClick={() => {
                const next = [...topics];
                [next[index + 1], next[index]] = [next[index]!, next[index + 1]!];
                setTopics(next);
              }}
            >
              Down
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={topics.length <= 1}
              onClick={() => setTopics(topics.filter((item) => item.id !== topic.id))}
            >
              Remove
            </Button>
          </div>
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
            {LESSON_KIND_META[topic.kind].label}
          </p>
          <TopicFields
            value={topic}
            onChange={(next) => setTopics(topics.map((item) => (item.id === topic.id ? next : item)))}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => setTopics([...topics, emptyDraftTopic("video", `Topic ${topics.length + 1}`)])}
      >
        Add another topic
      </Button>
    </div>
  );
}
