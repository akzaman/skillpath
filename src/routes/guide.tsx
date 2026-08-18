import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { GUIDE, type GuideTrack } from "@/data/guide";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guide")({
  component: GuidePage,
  head: () => ({
    meta: [{ title: "User guide — National Education Center" }],
  }),
});

function GuidePage() {
  const { locale, t } = useI18n();
  const copy = GUIDE[locale];
  const [tab, setTab] = useState<"student" | "teacher">("student");
  const track = tab === "student" ? copy.student : copy.teacher;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-sm font-bold tracking-wide text-primary uppercase">{t("app.name")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-muted">{copy.lede}</p>

        <div className="mt-6 flex gap-2">
          <TabButton active={tab === "student"} onClick={() => setTab("student")}>
            {copy.student.title}
          </TabButton>
          <TabButton active={tab === "teacher"} onClick={() => setTab("teacher")}>
            {copy.teacher.title}
          </TabButton>
        </div>

        <GuideTrackView track={track} />

        <p className="mt-10 text-sm text-muted">
          <Link to="/login" className="font-bold text-primary hover:underline">
            {t("nav.signup")}
          </Link>
          {" · "}
          <Link to="/catalog" className="font-bold text-primary hover:underline">
            {t("nav.courses")}
          </Link>
          {" · "}
          <Link to="/teach" className="font-bold text-primary hover:underline">
            {t("nav.studio")}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-sm font-medium",
        active ? "border-fg bg-fg text-bg" : "border-line bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function GuideTrackView({ track }: { track: GuideTrack }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">{track.title}</h2>
      <p className="mt-2 text-sm text-muted">{track.intro}</p>
      <ol className="mt-6 space-y-4">
        {track.steps.map((step, index) => (
          <li key={step.title} className="rounded-md border border-line bg-surface p-5">
            <p className="text-xs font-bold tracking-wide text-primary uppercase">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
