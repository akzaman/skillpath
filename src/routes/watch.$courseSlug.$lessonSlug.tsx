import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChevronLeft, List, Lock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video-player";
import { getCourseRecord } from "@/lib/catalog-service";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  getCourseLearning,
  markLessonComplete,
  saveNote,
  saveProgress,
} from "@/lib/learning";
import { cn, formatMinutes } from "@/lib/utils";

export const Route = createFileRoute("/watch/$courseSlug/$lessonSlug")({
  loader: async ({ params }) => {
    const course = await getCourseRecord({ data: { slug: params.courseSlug } });
    if (!course) throw notFound();
    const index = course.lessons.findIndex((item) => item.slug === params.lessonSlug);
    if (index < 0) throw notFound();
    return { course, lesson: course.lessons[index]!, index };
  },
  component: WatchPage,
  notFoundComponent: WatchMissing,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.lesson.title} — ${loaderData.course.title}`
          : "Lesson — National Education Center",
      },
    ],
  }),
});

function WatchMissing() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader solid />
      <main className="grid flex-1 place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Lesson not found</h1>
          <Button asChild className="mt-6">
            <Link to="/catalog">Back to catalog</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function WatchPage() {
  const { course, lesson, index } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const locked = !lesson.preview && !isPending && !user;
  const queryClient = useQueryClient();
  const [listOpen, setListOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [localComplete, setLocalComplete] = useState(false);
  const lastSaved = useRef(0);
  const lastTick = useRef({ seconds: 0, duration: 0 });

  const learningQuery = useQuery({
    queryKey: ["course-learning", course.slug, user?.id],
    queryFn: () => getCourseLearning({ data: { courseSlug: course.slug } }),
    enabled: Boolean(user),
  });

  const lessonProgress = learningQuery.data?.progress.find(
    (row) => row.lessonSlug === lesson.slug,
  );
  const completedSet = useMemo(() => {
    const set = new Set(
      learningQuery.data?.progress.filter((row) => row.completed).map((row) => row.lessonSlug) ??
        [],
    );
    if (localComplete) set.add(lesson.slug);
    return set;
  }, [learningQuery.data, localComplete, lesson.slug]);

  useEffect(() => {
    setLocalComplete(false);
    lastSaved.current = 0;
    lastTick.current = { seconds: 0, duration: 0 };
  }, [lesson.slug]);

  useEffect(() => {
    const stored = learningQuery.data?.notes[lesson.slug] ?? "";
    if (!noteDirty) setNote(stored);
  }, [learningQuery.data, lesson.slug, noteDirty]);

  useEffect(() => {
    setNoteDirty(false);
  }, [lesson.slug]);

  async function invalidateProgress() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["course-learning", course.slug] }),
      queryClient.invalidateQueries({ queryKey: ["library"] }),
      queryClient.invalidateQueries({ queryKey: ["continue-watching"] }),
      queryClient.invalidateQueries({ queryKey: ["progress-overview"] }),
    ]);
  }

  const persistProgress = useMutation({
    mutationFn: (input: {
      positionSeconds: number;
      durationSeconds: number;
      completed: boolean;
    }) =>
      saveProgress({
        data: {
          courseSlug: course.slug,
          lessonSlug: lesson.slug,
          ...input,
        },
      }),
    onSuccess: async (_, input) => {
      if (input.completed) {
        setLocalComplete(true);
        await invalidateProgress();
      }
    },
  });

  const completeLesson = useMutation({
    mutationFn: () =>
      markLessonComplete({ data: { courseSlug: course.slug, lessonSlug: lesson.slug } }),
    onSuccess: async () => {
      setLocalComplete(true);
      await invalidateProgress();
      toast("Lecture marked complete");
    },
    onError: (error) => toast(error.message || "Could not save progress"),
  });

  const persistNote = useMutation({
    mutationFn: (body: string) =>
      saveNote({
        data: { courseSlug: course.slug, lessonSlug: lesson.slug, body },
      }),
    onSuccess: async () => {
      setNoteDirty(false);
      await queryClient.invalidateQueries({ queryKey: ["course-learning", course.slug] });
      toast("Note saved");
    },
  });

  const writeProgress = (seconds: number, duration: number, force = false) => {
    if (!user) return;
    lastTick.current = { seconds, duration };
    const now = Date.now();
    if (!force && now - lastSaved.current < 4000) return;
    lastSaved.current = now;
    const completed = duration > 0 && seconds / duration >= 0.9;
    if (completed) setLocalComplete(true);
    persistProgress.mutate({
      positionSeconds: Math.floor(seconds),
      durationSeconds: Math.floor(duration || 0),
      completed,
    });
  };

  useEffect(() => {
    return () => {
      const tick = lastTick.current;
      if (!user || tick.seconds < 2) return;
      void saveProgress({
        data: {
          courseSlug: course.slug,
          lessonSlug: lesson.slug,
          positionSeconds: Math.floor(tick.seconds),
          durationSeconds: Math.floor(tick.duration || 0),
          completed: tick.duration > 0 && tick.seconds / tick.duration >= 0.9,
        },
      });
    };
  }, [course.slug, lesson.slug, user]);

  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const doneCount = completedSet.size;
  const coursePct = Math.round((doneCount / Math.max(course.lessons.length, 1)) * 100);
  const thisDone = completedSet.has(lesson.slug);

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <SiteHeader solid />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <div className="aspect-video animate-pulse rounded-xl bg-elevated" />
        </div>
      </div>
    );
  }

  if (locked) {
    const nextPath = `/watch/${course.slug}/${lesson.slug}`;
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <SiteHeader solid />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-elevated">
            <Lock className="size-5 text-muted" />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Log in to keep watching</h1>
          <p className="mt-2 text-sm text-muted">
            The first lecture of every course is free. Log in to continue{" "}
            <span className="font-medium text-fg">{lesson.title}</span> and save your progress.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/login" search={{ next: nextPath }}>
                Sign in to watch
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/course/$slug" params={{ slug: course.slug }}>
                Back to course
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader solid />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              to="/course/$slug"
              params={{ slug: course.slug }}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
            >
              <ChevronLeft className="size-4" />
              {course.title}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setListOpen(true)}
            >
              <List className="size-4" />
              Lessons
            </Button>
          </div>

          {user ? (
            <div className="mb-4 rounded-md border border-line bg-surface px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">
                  {doneCount} of {course.lessons.length} lectures complete
                </span>
                <span className="tabular-nums text-muted">{coursePct}%</span>
              </div>
              <Progress value={coursePct} className="mt-2 h-1.5 bg-elevated" />
            </div>
          ) : null}

          {lesson.preview || user ? (
            <VideoPlayer
              key={lesson.slug}
              sources={lesson.sources}
              poster={course.poster}
              title={lesson.title}
              initialTime={
                thisDone ? 0 : Math.max(0, (lessonProgress?.positionSeconds ?? 0) - 2)
              }
              onProgress={(seconds, duration) => writeProgress(seconds, duration)}
              onEnded={() => {
                if (user) {
                  const duration = lastTick.current.duration || lesson.durationSeconds;
                  writeProgress(duration, duration, true);
                }
              }}
            />
          ) : (
            <div className="grid aspect-video place-items-center rounded-xl bg-elevated ring-1 ring-line">
              <Lock className="size-6 text-muted" />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs tabular-nums text-subtle">
                Lesson {String(index + 1).padStart(2, "0")} of {course.lessons.length}
                {thisDone ? " · Completed" : ""}
              </p>
              <h1 className="mt-1 font-display text-3xl tracking-tight">{lesson.title}</h1>
              <p className="mt-2 text-sm text-muted">{lesson.summary}</p>
            </div>
            {user ? (
              <Button
                variant={thisDone ? "outline" : "default"}
                size="sm"
                disabled={thisDone || completeLesson.isPending}
                onClick={() => completeLesson.mutate()}
              >
                <Check className="size-4" />
                {thisDone ? "Completed" : "Mark complete"}
              </Button>
            ) : null}
          </div>

          <Tabs defaultValue="transcript" className="mt-8">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript">
              <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted whitespace-pre-line">
                {lesson.transcript}
              </div>
            </TabsContent>
            <TabsContent value="notes">
              {user ? (
                <form
                  className="max-w-2xl"
                  onSubmit={(event) => {
                    event.preventDefault();
                    persistNote.mutate(note);
                  }}
                >
                  <textarea
                    value={note}
                    onChange={(event) => {
                      setNote(event.target.value);
                      setNoteDirty(true);
                    }}
                    rows={8}
                    placeholder="Write for yourself. These notes stay on your account."
                    className="w-full resize-y rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-fg placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button type="submit" size="sm" disabled={persistNote.isPending}>
                      Save note
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-muted">
                  <Link
                    to="/login"
                    search={{ next: `/watch/${course.slug}/${lesson.slug}` }}
                    className="underline"
                  >
                    Sign in
                  </Link>{" "}
                  to keep notes on this lesson.
                </p>
              )}
            </TabsContent>
            <TabsContent value="about">
              <div className="max-w-xl">
                <p className="font-medium">{course.instructor.name}</p>
                <p className="text-sm text-muted">{course.instructor.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{course.instructor.bio}</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-10 mb-8 flex flex-wrap gap-3">
            {prev ? (
              <Button asChild variant="outline">
                <Link
                  to="/watch/$courseSlug/$lessonSlug"
                  params={{ courseSlug: course.slug, lessonSlug: prev.slug }}
                >
                  Previous
                </Link>
              </Button>
            ) : null}
            {next ? (
              <Button asChild>
                <Link
                  to="/watch/$courseSlug/$lessonSlug"
                  params={{ courseSlug: course.slug, lessonSlug: next.slug }}
                >
                  Next lesson
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/course/$slug" params={{ slug: course.slug }}>
                  Back to course
                </Link>
              </Button>
            )}
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 lg:block">
          <LessonList
            courseSlug={course.slug}
            lessons={course.lessons}
            active={lesson.slug}
            completed={completedSet}
            progress={learningQuery.data?.progress ?? []}
            signedIn={Boolean(user)}
          />
        </aside>
      </div>

      <Sheet open={listOpen} onOpenChange={setListOpen}>
        <SheetContent side="bottom" className="lg:hidden">
          <SheetHeader>
            <SheetTitle>Lessons</SheetTitle>
          </SheetHeader>
          <LessonList
            courseSlug={course.slug}
            lessons={course.lessons}
            active={lesson.slug}
            completed={completedSet}
            progress={learningQuery.data?.progress ?? []}
            signedIn={Boolean(user)}
            onPick={() => setListOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LessonList({
  courseSlug,
  lessons,
  active,
  completed,
  progress,
  signedIn,
  onPick,
}: {
  courseSlug: string;
  lessons: { slug: string; title: string; durationSeconds: number; preview: boolean }[];
  active: string;
  completed: Set<string>;
  progress: { lessonSlug: string; positionSeconds: number; durationSeconds: number }[];
  signedIn: boolean;
  onPick?: () => void;
}) {
  const bySlug = new Map(progress.map((row) => [row.lessonSlug, row]));
  return (
    <ol className="overflow-hidden rounded-xl ring-1 ring-line">
      {lessons.map((item, index) => {
        const isActive = item.slug === active;
        const locked = !item.preview && !signedIn;
        const row = bySlug.get(item.slug);
        const started =
          !completed.has(item.slug) &&
          (row?.positionSeconds ?? 0) > 3 &&
          (row?.durationSeconds ?? 0) > 0;
        const pct = started
          ? Math.min(99, Math.round((row!.positionSeconds / row!.durationSeconds) * 100))
          : 0;
        return (
          <li key={item.slug} className="border-b border-line last:border-0">
            <Link
              to="/watch/$courseSlug/$lessonSlug"
              params={{ courseSlug, lessonSlug: item.slug }}
              onClick={onPick}
              className={cn(
                "flex items-start gap-3 px-3 py-3 text-sm transition-colors duration-150",
                isActive ? "bg-elevated" : "hover:bg-elevated/50",
              )}
            >
              <span className="mt-0.5 grid size-6 place-items-center rounded-full bg-bg font-mono text-[10px] text-muted">
                {completed.has(item.slug) ? (
                  <Check className="size-3 text-primary" />
                ) : locked ? (
                  <Lock className="size-3" />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-fg">{item.title}</span>
                <span className="mt-0.5 block font-mono text-[11px] text-subtle tabular-nums">
                  {formatMinutes(item.durationSeconds)}
                  {item.preview ? " · Preview" : ""}
                  {completed.has(item.slug) ? " · Done" : started ? ` · ${pct}%` : ""}
                </span>
                {started ? <Progress value={pct} className="mt-1.5 h-1 bg-elevated" /> : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
