import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, SelectField, TextArea } from "@/components/field";
import { PosterPicker } from "@/components/poster-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { createStudioCourse } from "@/lib/cms";
import { CATEGORY_OPTIONS, LEVEL_OPTIONS, POSTERS } from "@/data/media";
import { canTeach } from "@/lib/roles";
import { useProfile } from "@/lib/use-profile";

export const Route = createFileRoute("/teach/new")({
  component: NewCoursePage,
  head: () => ({ meta: [{ title: "New course — National Education Center" }] }),
});

function NewCoursePage() {
  const { user, isPending, profile } = useProfile();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]!);
  const [level, setLevel] = useState(LEVEL_OPTIONS[0]!);
  const [poster, setPoster] = useState<string>(POSTERS[0]!.src);
  const [instructorName, setInstructorName] = useState("");
  const [instructorTitle, setInstructorTitle] = useState("");
  const [instructorBio, setInstructorBio] = useState("");
  const [accessDays, setAccessDays] = useState(0);

  useEffect(() => {
    if (user?.displayName && !instructorName) setInstructorName(user.displayName);
  }, [user, instructorName]);

  const create = useMutation({
    mutationFn: () =>
      createStudioCourse({
        data: {
          title,
          subtitle,
          description,
          category,
          level,
          poster,
          instructorName: instructorName || user?.displayName || "Instructor",
          instructorTitle,
          instructorBio,
          published: false,
          accessDays,
        },
      }),
    onSuccess: (result) => {
      toast("Draft created — add your first lecture");
      void navigate({ to: "/teach/$slug", params: { slug: result.slug } });
    },
    onError: (error) => toast(error.message),
  });

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-sm text-muted">
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

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <Link to="/teach" className="text-sm text-muted hover:text-fg">
          ← Studio
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">New course</h1>
        <p className="mt-2 text-sm text-muted">
          Save a draft first. You will add lectures and publish on the next screen.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Title">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              minLength={3}
              placeholder="Night Drawing"
            />
          </Field>
          <Field label="Subtitle">
            <Input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Line work after dark"
            />
          </Field>
          <Field label="Description">
            <TextArea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What the student will be able to do when they finish."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <SelectField value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </SelectField>
            </Field>
            <Field label="Level">
              <SelectField value={level} onChange={(event) => setLevel(event.target.value as typeof level)}>
                {LEVEL_OPTIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </SelectField>
            </Field>
          </div>
          <Field label="Poster">
            <PosterPicker value={poster} onChange={setPoster} />
          </Field>
          <Field label="Access days (0 = unlimited)">
            <Input
              type="number"
              min={0}
              max={3650}
              value={accessDays}
              onChange={(event) => setAccessDays(Number(event.target.value) || 0)}
            />
          </Field>
          <Field label="Instructor name">
            <Input value={instructorName} onChange={(event) => setInstructorName(event.target.value)} required />
          </Field>
          <Field label="Instructor title">
            <Input
              value={instructorTitle}
              onChange={(event) => setInstructorTitle(event.target.value)}
              placeholder="Photographer, editor, letterer…"
            />
          </Field>
          <Field label="Instructor bio">
            <TextArea value={instructorBio} onChange={(event) => setInstructorBio(event.target.value)} />
          </Field>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create draft"}
          </Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
