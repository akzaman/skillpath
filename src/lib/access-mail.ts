import { daysLeft } from "@/lib/access";
import { loadAllCourses } from "@/lib/catalog-service";
import { getSql } from "@/lib/db";
import { mailConfigured, sendMail, siteUrl } from "@/lib/mail";

export type AccessMailKind = "enrolled" | "extended" | "reminder_3d" | "reminder_1d" | "expired";

function windowKey(expiresAt: string | Date | null | undefined): string {
  if (!expiresAt) return "unlimited";
  return new Date(expiresAt).toISOString();
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "no end date";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function wrap(body: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#f4f1ea;font-family:Georgia,serif;color:#1c1915;">
  <div style="max-width:560px;margin:24px auto;background:#fffaf3;border:1px solid #e6dfd2;padding:28px 24px;">
    <p style="margin:0 0 4px;letter-spacing:.08em;text-transform:uppercase;font-size:11px;color:#9a3412;">National Education Center</p>
    ${body}
    <p style="margin:28px 0 0;font-size:12px;color:#6b6358;">This is an automatic message about your course access.</p>
  </div>
</body></html>`;
}

function copyFor(
  kind: AccessMailKind,
  input: { name: string; course: string; expiresAt: string | null; url: string },
): { subject: string; text: string; html: string } {
  const first = input.name.split(" ")[0] || "there";
  const when = formatDate(input.expiresAt);
  const left = daysLeft(input.expiresAt);
  if (kind === "enrolled" || kind === "extended") {
    const subject =
      kind === "extended"
        ? `Access updated — ${input.course}`
        : `You are enrolled — ${input.course}`;
    const line = input.expiresAt
      ? `You can watch until ${when}.`
      : "Your access has no end date.";
    return {
      subject,
      text: `Hello ${first},\n\n${line}\n\nOpen the course: ${input.url}\n`,
      html: wrap(
        `<h1 style="font-size:22px;margin:12px 0 8px;">${subject}</h1>
         <p>Hello ${first},</p>
         <p>${line}</p>
         <p><a href="${input.url}" style="color:#9a3412;">Open the course</a></p>`,
      ),
    };
  }
  if (kind === "expired") {
    return {
      subject: `Access ended — ${input.course}`,
      text: `Hello ${first},\n\nYour access to ${input.course} ended on ${when}. Ask a teacher to extend it, or renew on the course page.\n\n${input.url}\n`,
      html: wrap(
        `<h1 style="font-size:22px;margin:12px 0 8px;">Access ended</h1>
         <p>Hello ${first},</p>
         <p>Your access to <strong>${input.course}</strong> ended on ${when}.</p>
         <p>Ask a teacher to extend it, or renew on the course page.</p>
         <p><a href="${input.url}" style="color:#9a3412;">Open the course</a></p>`,
      ),
    };
  }
  const n = kind === "reminder_1d" ? 1 : Math.max(left ?? 3, 1);
  return {
    subject: `Access ends in ${n} day${n === 1 ? "" : "s"} — ${input.course}`,
    text: `Hello ${first},\n\nYour access to ${input.course} ends on ${when} (${n} day${n === 1 ? "" : "s"} left).\n\n${input.url}\n`,
    html: wrap(
      `<h1 style="font-size:22px;margin:12px 0 8px;">Access ends soon</h1>
       <p>Hello ${first},</p>
       <p>Your access to <strong>${input.course}</strong> ends on ${when} (${n} day${n === 1 ? "" : "s"} left).</p>
       <p><a href="${input.url}" style="color:#9a3412;">Continue learning</a></p>`,
    ),
  };
}

async function alreadySent(
  userId: string,
  courseSlug: string,
  kind: AccessMailKind,
  key: string,
): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`
    select user_id from access_emails
    where user_id = ${userId} and course_slug = ${courseSlug}
      and kind = ${kind} and window_key = ${key}
  `;
  return Boolean(rows[0]);
}

async function markSent(
  userId: string,
  courseSlug: string,
  kind: AccessMailKind,
  key: string,
): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into access_emails (user_id, course_slug, kind, window_key)
    values (${userId}, ${courseSlug}, ${kind}, ${key})
    on conflict do nothing
  `;
}

export async function notifyAccess(input: {
  userId: string;
  email?: string;
  name?: string;
  courseSlug: string;
  courseTitle?: string;
  expiresAt: string | Date | null;
  kind: AccessMailKind;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!mailConfigured()) return { sent: false, reason: "Email is not configured" };
  const key = windowKey(input.expiresAt);
  if (await alreadySent(input.userId, input.courseSlug, input.kind, key)) {
    return { sent: false, reason: "Already sent" };
  }
  const sql = await getSql();
  let email = input.email;
  let name = input.name || "Student";
  if (!email) {
    const people = await sql<{ email: string; name: string }>`
      select "email" as email, "name" as name from "user" where "id" = ${input.userId}
    `;
    email = people[0]?.email;
    name = people[0]?.name || name;
  }
  if (!email) return { sent: false, reason: "No email on the account" };
  let title = input.courseTitle;
  if (!title) {
    const courses = await loadAllCourses();
    title = courses.find((course) => course.slug === input.courseSlug)?.title ?? input.courseSlug;
  }
  const expiresAt = input.expiresAt ? new Date(input.expiresAt).toISOString() : null;
  const message = copyFor(input.kind, {
    name,
    course: title,
    expiresAt,
    url: `${siteUrl()}/course/${input.courseSlug}`,
  });
  const result = await sendMail({ to: email, ...message });
  if (!result.ok) return { sent: false, reason: result.error };
  await markSent(input.userId, input.courseSlug, input.kind, key);
  return { sent: true };
}

export async function processAccessExpiryEmails(): Promise<{
  scanned: number;
  sent: number;
  skipped: number;
}> {
  const sql = await getSql();
  const rows = await sql<{
    user_id: string;
    course_slug: string;
    expires_at: string;
    email: string;
    name: string;
  }>`
    select e.user_id, e.course_slug, e.expires_at::text, u."email" as email, u."name" as name
    from enrollments e
    join "user" u on u."id" = e.user_id
    where e.expires_at is not null
  `;
  const courses = await loadAllCourses();
  const titles = new Map(courses.map((course) => [course.slug, course.title]));
  let sent = 0;
  let skipped = 0;
  for (const row of rows) {
    const left = daysLeft(row.expires_at);
    let kind: AccessMailKind | null = null;
    if (left !== null && left <= 0 && left >= -2) kind = "expired";
    else if (left === 1) kind = "reminder_1d";
    else if (left !== null && left >= 2 && left <= 3) kind = "reminder_3d";
    if (!kind) {
      skipped += 1;
      continue;
    }
    const result = await notifyAccess({
      userId: row.user_id,
      email: row.email,
      name: row.name,
      courseSlug: row.course_slug,
      courseTitle: titles.get(row.course_slug),
      expiresAt: row.expires_at,
      kind,
    });
    if (result.sent) sent += 1;
    else skipped += 1;
  }
  await sql`
    insert into access_email_runs (id, ran_at) values ('expiry', now())
    on conflict (id) do update set ran_at = now()
  `;
  return { scanned: rows.length, sent, skipped };
}

export async function maybeSweepAccessEmails(): Promise<void> {
  try {
    if (!mailConfigured()) return;
    const sql = await getSql();
    const rows = await sql<{ ran_at: string }>`
      select ran_at::text from access_email_runs where id = 'expiry'
    `;
    const last = rows[0]?.ran_at ? new Date(rows[0].ran_at).getTime() : 0;
    if (Date.now() - last < 6 * 60 * 60 * 1000) return;
    await processAccessExpiryEmails();
  } catch {
    // never block a student page on mail
  }
}
