import { useState } from "react";
import { Field } from "@/components/field";
import { FileUrlField } from "@/components/file-url-field";
import { LessonTypePicker } from "@/components/lesson-type-picker";
import { VideoField } from "@/components/video-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/field";
import type { LessonContent, LessonKind, QuizQuestion } from "@/data/lesson-kinds";

export type LessonDraft = {
  kind: LessonKind;
  videoId: string;
  customUrl: string;
  content: LessonContent;
};

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

export function LessonFields({
  value,
  onChange,
}: {
  value: LessonDraft;
  onChange: (next: LessonDraft) => void;
}) {
  const content = value.content;
  const setContent = (patch: Partial<LessonContent>) =>
    onChange({ ...value, content: { ...content, ...patch } });

  return (
    <div className="space-y-4">
      <LessonTypePicker
        value={value.kind}
        onChange={(kind) => onChange({ ...value, kind })}
      />
      {value.kind === "video" ? (
        <VideoField
          videoId={value.videoId}
          customUrl={value.customUrl}
          onVideoId={(videoId) => onChange({ ...value, videoId })}
          onCustomUrl={(customUrl) => onChange({ ...value, customUrl })}
        />
      ) : null}
      {value.kind === "text" ? (
        <Field label="Lesson text">
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
          onChange={(fileUrl) => {
            setContent({ fileUrl });
            onChange({ ...value, customUrl: fileUrl, content: { ...content, fileUrl } });
          }}
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
      {value.kind === "multiple" ? (
        <MultipleEditor
          items={content.items ?? []}
          onChange={(items) => setContent({ items })}
        />
      ) : null}
    </div>
  );
}

function MultipleEditor({
  items,
  onChange,
}: {
  items: { label: string; url: string }[];
  onChange: (items: { label: string; url: string }[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-3">
      <ul className="space-y-2 text-sm">
        {items.map((item, index) => (
          <li key={`${item.url}-${index}`} className="flex items-center justify-between gap-2">
            <span>
              {item.label} — <span className="text-muted">{item.url}</span>
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label" />
        <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!label.trim() || !url.trim()) return;
            onChange([...items, { label: label.trim(), url: url.trim() }]);
            setLabel("");
            setUrl("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
