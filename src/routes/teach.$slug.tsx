import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, SelectField, TextArea } from "@/components/field";
import { PosterPicker } from "@/components/poster-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video-player";
import type { Lesson } from "@/data/catalog";
import {
  CATEGORY_OPTIONS,
  customUrlFromSources,
  LEVEL_OPTIONS,
  POSTERS,
  VIDEO_LIBRARY,
  videoIdFromSources,
} from "@/data/media";
import { RedirectToSignIn } from "@/lib/auth/gates";
import {
  addStudioLesson,
  deleteStudioCourse,
  deleteStudioLesson,
  getStudioCourse,
  listCourseStudents,
  reorderStudioLessons,
  setStudioPublished,
  updateStudioCourse,
  updateStudioLesson,
} from "@/lib/cms";
import { canTeach } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/teach/$slug")({
  component: EditCoursePage,
  head: () => ({ meta: [{ title: "Edit course — Skillpath" }] }),
});

function EditCoursePage() {
  const { slug } = Route.useParams();
  const { user, isPending, profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const courseQuery = useQuery({
    queryKey: ["studio-course", slug],
    queryFn: () => getStudioCourse({ data: { slug } }),
    enabled: Boolean(user && profile && canTeach(profile.role)),
  });
  const studentsQuery = useQuery({
    queryKey: ["studio-students", slug],
    queryFn: () => listCourseStudents({ data: { slug } }),
    enabled: Boolean(user && profile && canTeach(profile.role)),
  });
  const course = courseQuery.data;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]!);
  const [level, setLevel] = useState(LEVEL_OPTIONS[0]!);
  const [poster, setPoster] = useState<string>(POSTERS[0]!.src);
  const [instructorName, setInstructorName] = useState("");
  const [instructorTitle, setInstructorTitle] = useState("");
  const [instructorBio, setInstructorBio] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonSummary, setLessonSummary] = useState("");
  const [lessonTranscript, setLessonTranscript] = useState("");
  const [lessonVideo, setLessonVideo] = useState(VIDEO_LIBRARY[0]!.id);
  const [lessonCustomUrl, setLessonCustomUrl] = useState("");
  const [lessonPreview, setLessonPreview] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!course) return;
    setTitle(course.title);
    setSubtitle(course.subtitle);
    setDescription(course.description);
    setCategory(course.category);
    setLevel(course.level);
    setPoster(course.poster);
    setInstructorName(course.instructor.name);
    setInstructorTitle(course.instructor.title);
    setInstructorBio(course.instructor.bio);
  }, [course]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["studio-course", slug] });
    await queryClient.invalidateQueries({ queryKey: ["studio-courses"] });
    await queryClient.invalidateQueries({ queryKey: ["teacher-stats"] });
    await queryClient.invalidateQueries({ queryKey: ["catalog"] });
  }

  const save = useMutation({
    mutationFn: () =>
      updateStudioCourse({
        data: {
          slug,
          title,
          subtitle,
          description,
          category,
          level,
          poster,
          instructorName,
          instructorTitle,
          instructorBio,
          published: Boolean(course?.published),
        },
      }),
    onSuccess: async () => {
      await refresh();
      toast("Course saved");
    },
    onError: (error) => toast(error.message),
  });

  const addLesson = useMutation({
    mutationFn: () =>
      addStudioLesson({
        data: {
          courseSlug: slug,
          title: lessonTitle,
          summary: lessonSummary,
          transcript: lessonTranscript,
          videoId: lessonVideo,
          customUrl: lessonCustomUrl,
          preview: lessonPreview,
          durationSeconds: 0,
        },
      }),
    onSuccess: async () => {
      setLessonTitle("");
      setLessonSummary("");
      setLessonTranscript("");
      setLessonCustomUrl("");
      setLessonPreview(false);
      await refresh();
      toast("Lecture added");
    },
    onError: (error) => toast(error.message),
  });

  const publish = useMutation({
    mutationFn: (next: boolean) => setStudioPublished({ data: { slug, published: next } }),
    onSuccess: async (result) => {
      await refresh();
      toast(result.published ? "Course is live in the catalog" : "Course unpublished");
    },
    onError: (error) => toast(error.message),
  });

  const removeCourse = useMutation({
    mutationFn: () => deleteStudioCourse({ data: { slug } }),
    onSuccess: () => {
      toast("Course deleted");
      void navigate({ to: "/teach" });
    },
    onError: (error) => toast(error.message),
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 text-sm text-muted">
          Loading…
        </main>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!profile || !canTeach(profile.role)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Teacher studio only</h1>
          <Button asChild className="mt-6">
            <Link to="/teach">Open studio</Link>
          </Button>
        </main>
      </div>
    );
  }
  if (courseQuery.isLoading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 text-sm text-muted">
          Loading course…
        </main>
      </div>
    );
  }
  if (!course) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Course not in your studio</h1>
          <Button asChild className="mt-6">
            <Link to="/teach">Back to studio</Link>
          </Button>
        </main>
      </div>
    );
  }

  const students = studentsQuery.data ?? [];

  async function moveLesson(index: number, direction: -1 | 1) {
    if (!course) return;
    const next = course.lessons.map((lesson) => lesson.slug);
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const current = next[index]!;
    next[index] = next[target]!;
    next[target] = current;
    try {
      await reorderStudioLessons({ data: { courseSlug: slug, lessonSlugs: next } });
      await refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not reorder");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Link to="/teach" className="text-sm text-muted hover:text-fg">
          ← Studio
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {course.lessons.length} lectures · {students.length} students ·{" "}
              {course.published ? "Live" : "Draft"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {course.published ? (
              <Button asChild variant="outline" size="sm">
                <Link to="/course/$slug" params={{ slug: course.slug }}>
                  View listing
                </Link>
              </Button>
            ) : null}
            {course.lessons[0] && course.published ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  to="/watch/$courseSlug/$lessonSlug"
                  params={{ courseSlug: course.slug, lessonSlug: course.lessons[0].slug }}
                >
                  Watch
                </Link>
              </Button>
            ) : null}
            <Button
              size="sm"
              disabled={publish.isPending || (!course.published && course.lessons.length === 0)}
              onClick={() => publish.mutate(!course.published)}
            >
              {course.published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="lectures" className="mt-8">
          <TabsList>
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="lectures">
            <ul className="divide-y divide-line rounded-md border border-line bg-surface">
              {course.lessons.length === 0 ? (
                <li className="p-4 text-sm text-muted">No lectures yet. Add one below.</li>
              ) : (
                course.lessons.map((lesson, index) => (
                  <li key={lesson.slug} className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="w-8 text-sm text-muted tabular-nums">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted">
                          {lesson.preview ? "Free preview · " : ""}
                          {lesson.summary || "No summary"}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => void moveLesson(index, -1)}>
                        Up
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void moveLesson(index, 1)}>
                        Down
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditingSlug((current) => (current === lesson.slug ? null : lesson.slug))
                        }
                      >
                        {editingSlug === lesson.slug ? "Close" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void deleteStudioLesson({
                            data: { courseSlug: slug, lessonSlug: lesson.slug },
                          }).then(async () => {
                            await refresh();
                            toast("Lecture removed");
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    {editingSlug === lesson.slug ? (
                      <LessonEditor
                        lesson={lesson}
                        courseSlug={slug}
                        poster={course.poster}
                        onSaved={async () => {
                          setEditingSlug(null);
                          await refresh();
                          toast("Lecture saved");
                        }}
                      />
                    ) : null}
                  </li>
                ))
              )}
            </ul>

            <form
              className="mt-6 space-y-3 rounded-md border border-line bg-surface p-4"
              onSubmit={(event) => {
                event.preventDefault();
                addLesson.mutate();
              }}
            >
              <h3 className="font-bold">Add a lecture</h3>
              <Field label="Title">
                <Input
                  value={lessonTitle}
                  onChange={(event) => setLessonTitle(event.target.value)}
                  required
                  placeholder="The first line"
                />
              </Field>
              <Field label="Summary">
                <Input
                  value={lessonSummary}
                  onChange={(event) => setLessonSummary(event.target.value)}
                  placeholder="What this lecture covers"
                />
              </Field>
              <Field label="Transcript">
                <TextArea
                  value={lessonTranscript}
                  onChange={(event) => setLessonTranscript(event.target.value)}
                />
              </Field>
              <Field label="Video">
                <SelectField value={lessonVideo} onChange={(event) => setLessonVideo(event.target.value)}>
                  {VIDEO_LIBRARY.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                  <option value="custom">Custom video URL</option>
                </SelectField>
              </Field>
              {lessonVideo === "custom" ? (
                <Field label="Video URL">
                  <Input
                    value={lessonCustomUrl}
                    onChange={(event) => setLessonCustomUrl(event.target.value)}
                    placeholder="https://…/lecture.mp4"
                    required
                  />
                </Field>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lessonPreview}
                  onChange={(event) => setLessonPreview(event.target.checked)}
                />
                Free preview lecture
              </label>
              <Button type="submit" disabled={addLesson.isPending}>
                {addLesson.isPending ? "Adding…" : "Add lecture"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="details">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate();
              }}
            >
              <Field label="Title">
                <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
              </Field>
              <Field label="Subtitle">
                <Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
              </Field>
              <Field label="Description">
                <TextArea value={description} onChange={(event) => setDescription(event.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <SelectField
                    value={category}
                    onChange={(event) => setCategory(event.target.value as typeof category)}
                  >
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </SelectField>
                </Field>
                <Field label="Level">
                  <SelectField
                    value={level}
                    onChange={(event) => setLevel(event.target.value as typeof level)}
                  >
                    {LEVEL_OPTIONS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </SelectField>
                </Field>
              </div>
              <Field label="Poster">
                <PosterPicker value={poster} onChange={setPoster} />
              </Field>
              <Field label="Instructor name">
                <Input
                  value={instructorName}
                  onChange={(event) => setInstructorName(event.target.value)}
                  required
                />
              </Field>
              <Field label="Instructor title">
                <Input
                  value={instructorTitle}
                  onChange={(event) => setInstructorTitle(event.target.value)}
                />
              </Field>
              <Field label="Instructor bio">
                <TextArea
                  value={instructorBio}
                  onChange={(event) => setInstructorBio(event.target.value)}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save details"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    if (window.confirm("Delete this course and its lectures?")) removeCourse.mutate();
                  }}
                >
                  Delete course
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="students">
            <div className="overflow-x-auto rounded-md border border-line bg-surface">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Last lecture</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsQuery.isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-muted">
                        Loading students…
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-muted">
                        No one has enrolled yet. Publish the course so students can join.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.userId} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted">{student.email}</p>
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {student.completedLessons}/{student.totalLessons || course.lessons.length}{" "}
                          complete
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {student.lastLessonSlug ?? "Not started"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

function LessonEditor({
  lesson,
  courseSlug,
  poster,
  onSaved,
}: {
  lesson: Lesson;
  courseSlug: string;
  poster: string;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(lesson.summary);
  const [transcript, setTranscript] = useState(lesson.transcript);
  const [videoId, setVideoId] = useState(videoIdFromSources(lesson.sources));
  const [customUrl, setCustomUrl] = useState(customUrlFromSources(lesson.sources));
  const [preview, setPreview] = useState(lesson.preview);
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      {lesson.sources[0] ? (
        <VideoPlayer sources={lesson.sources} poster={poster} title={lesson.title} />
      ) : null}
      <Field label="Title">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="Summary">
        <Input value={summary} onChange={(event) => setSummary(event.target.value)} />
      </Field>
      <Field label="Transcript">
        <TextArea value={transcript} onChange={(event) => setTranscript(event.target.value)} />
      </Field>
      <Field label="Video">
        <SelectField value={videoId} onChange={(event) => setVideoId(event.target.value)}>
          {VIDEO_LIBRARY.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
          <option value="custom">Custom video URL</option>
        </SelectField>
      </Field>
      {videoId === "custom" ? (
        <Field label="Video URL">
          <Input value={customUrl} onChange={(event) => setCustomUrl(event.target.value)} />
        </Field>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={preview}
          onChange={(event) => setPreview(event.target.checked)}
        />
        Free preview lecture
      </label>
      <Button
        type="button"
        disabled={pending}
        onClick={() => {
          setPending(true);
          void updateStudioLesson({
            data: {
              courseSlug,
              lessonSlug: lesson.slug,
              title,
              summary,
              transcript,
              videoId,
              customUrl,
              preview,
              durationSeconds: lesson.durationSeconds,
            },
          })
            .then(onSaved)
            .catch((error) => toast(error instanceof Error ? error.message : "Could not save"))
            .finally(() => setPending(false));
        }}
      >
        {pending ? "Saving…" : "Save lecture"}
      </Button>
    </div>
  );
}
