import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export type Role = "student" | "teacher" | "admin";
export type ApplicationStatus = "none" | "pending" | "approved" | "rejected";

export type Profile = {
  userId: string;
  role: Role;
  headline: string;
  bio: string;
  application: ApplicationStatus;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  application: ApplicationStatus;
  createdAt: string;
};

export function canTeach(role: Role): boolean {
  return role === "teacher" || role === "admin";
}

export function canAdmin(role: Role): boolean {
  return role === "admin";
}

export const optionalAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser(context.bearerToken);
    return next({ context: { userId: user?.id ?? null, email: user?.email ?? null } });
  });

export async function ensureProfile(userId: string, email?: string | null): Promise<Profile> {
  const sql = await getSql();
  const existing = await sql<{
    role: Role;
    headline: string;
    bio: string;
  }>`select role, headline, bio from profiles where user_id = ${userId}`;

  if (!existing[0]) {
    await sql`
      insert into profiles (user_id, role)
      values (${userId}, 'student')
      on conflict (user_id) do nothing
    `;
  }

  const admins = await sql<{ n: number | string }>`
    select count(*)::int as n from profiles where role = 'admin'
  `;
  const adminCount = Number(admins[0]?.n ?? 0);
  if (adminCount === 0) {
    await sql`
      update profiles set role = 'admin' where user_id = ${userId}
    `;
  }

  const row = (
    await sql<{ role: Role; headline: string; bio: string }>`
      select role, headline, bio from profiles where user_id = ${userId}
    `
  )[0];

  if (!row) {
    throw new Error("Could not create a profile");
  }

  const app = await sql<{ status: "pending" | "approved" | "rejected" }>`
    select status from teacher_applications where user_id = ${userId}
  `;

  void email;
  return {
    userId,
    role: row.role,
    headline: row.headline,
    bio: row.bio,
    application: app[0]?.status ?? "none",
  };
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ensureProfile(context.userId));

export const setMyRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ role: z.enum(["student", "teacher", "admin"]) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    await sql`
      update profiles set role = ${data.role} where user_id = ${context.userId}
    `;
    return ensureProfile(context.userId);
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        headline: z.string().max(120),
        bio: z.string().max(800),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    await sql`
      update profiles
      set headline = ${data.headline.trim()}, bio = ${data.bio.trim()}
      where user_id = ${context.userId}
    `;
    return ensureProfile(context.userId);
  });

export const applyToTeach = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => z.object({ pitch: z.string().min(12).max(800) }).parse(input))
  .handler(async ({ context, data }) => {
    const profile = await ensureProfile(context.userId);
    if (canTeach(profile.role)) return profile;
    const sql = await getSql();
    await sql`
      insert into teacher_applications (user_id, pitch, status)
      values (${context.userId}, ${data.pitch.trim()}, 'pending')
      on conflict (user_id) do update set
        pitch = excluded.pitch,
        status = 'pending',
        created_at = now(),
        reviewed_at = null,
        reviewed_by = null
    `;
    return ensureProfile(context.userId);
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const me = await ensureProfile(context.userId);
    if (!canAdmin(me.role)) throw new Error("Forbidden");
    const sql = await getSql();

    let authUsers: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      createdAt: string;
    }[] = [];
    try {
      authUsers = await sql<{
        id: string;
        name: string;
        email: string;
        image: string | null;
        createdAt: string;
      }>`
        select
          "id" as id,
          "name" as name,
          "email" as email,
          "image" as image,
          coalesce("createdAt"::text, '') as "createdAt"
        from "user"
      `;
    } catch {
      authUsers = [];
    }

    const profiles = await sql<{ user_id: string; role: Role }>`
      select user_id, role from profiles
    `;
    const apps = await sql<{ user_id: string; status: "pending" | "approved" | "rejected" }>`
      select user_id, status from teacher_applications
    `;

    const roleById = new Map(profiles.map((row) => [row.user_id, row.role]));
    const appById = new Map(apps.map((row) => [row.user_id, row.status]));
    const byId = new Map<string, AdminUser>();

    for (const row of authUsers) {
      byId.set(row.id, {
        id: row.id,
        name: row.name || row.email || "Member",
        email: row.email,
        image: row.image,
        role: roleById.get(row.id) ?? "student",
        application: appById.get(row.id) ?? "none",
        createdAt: row.createdAt,
      });
    }

    for (const row of profiles) {
      if (byId.has(row.user_id)) continue;
      byId.set(row.user_id, {
        id: row.user_id,
        name: row.user_id === context.userId ? "You" : "Member",
        email: "",
        image: null,
        role: row.role,
        application: appById.get(row.user_id) ?? "none",
        createdAt: "",
      });
    }

    if (!byId.has(context.userId)) {
      byId.set(context.userId, {
        id: context.userId,
        name: "You",
        email: "",
        image: null,
        role: me.role,
        application: me.application,
        createdAt: "",
      });
    } else {
      const self = byId.get(context.userId)!;
      self.role = me.role;
      if (self.name === "Member" || !self.name) self.name = "You";
    }

    return [...byId.values()];
  });

export const createManualUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(80),
        email: z.string().email(),
        password: z.string().min(8).max(72),
        role: z.enum(["student", "teacher", "admin"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const me = await ensureProfile(context.userId);
    if (!canAdmin(me.role)) throw new Error("Forbidden");
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const sql = await getSql();
    const taken = await sql<{ id: string }>`
      select "id" as id from "user" where lower("email") = ${email} limit 1
    `;
    if (taken[0]) throw new Error("That email is already in use");

    const { hashPassword } = await import("@better-auth/utils/password");
    const hashed = await hashPassword(data.password);
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();

    await sql`
      insert into "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
      values (${userId}, ${name}, ${email}, true, null, now(), now())
    `;
    await sql`
      insert into "account" (
        "id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt"
      ) values (
        ${accountId}, ${userId}, 'credential', ${userId}, ${hashed}, now(), now()
      )
    `;
    await sql`
      insert into profiles (user_id, role)
      values (${userId}, ${data.role})
      on conflict (user_id) do update set role = excluded.role
    `;
    if (data.role === "teacher" || data.role === "admin") {
      await sql`
        insert into teacher_applications (user_id, pitch, status, reviewed_at, reviewed_by)
        values (${userId}, 'Added by admin', 'approved', now(), ${context.userId})
        on conflict (user_id) do update set
          status = 'approved',
          reviewed_at = now(),
          reviewed_by = ${context.userId}
      `;
    }

    return { id: userId, name, email, role: data.role };
  });


export const setUserRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        userId: z.string().min(1),
        role: z.enum(["student", "teacher", "admin"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const me = await ensureProfile(context.userId);
    if (!canAdmin(me.role)) throw new Error("Forbidden");
    const sql = await getSql();
    if (data.userId === context.userId && data.role !== "admin") {
      const admins = await sql<{ n: number | string }>`
        select count(*)::int as n from profiles where role = 'admin'
      `;
      if (Number(admins[0]?.n ?? 0) <= 1) throw new Error("You are the only admin");
    }
    await sql`
      insert into profiles (user_id, role)
      values (${data.userId}, ${data.role})
      on conflict (user_id) do update set role = excluded.role
    `;
    if (data.role === "teacher" || data.role === "admin") {
      await sql`
        update teacher_applications
        set status = 'approved', reviewed_at = now(), reviewed_by = ${context.userId}
        where user_id = ${data.userId}
      `;
    }
    return { ok: true as const };
  });

export const reviewTeacherApplication = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        userId: z.string().min(1),
        status: z.enum(["approved", "rejected"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const me = await ensureProfile(context.userId);
    if (!canAdmin(me.role)) throw new Error("Forbidden");
    const sql = await getSql();
    await sql`
      update teacher_applications
      set status = ${data.status}, reviewed_at = now(), reviewed_by = ${context.userId}
      where user_id = ${data.userId}
    `;
    if (data.status === "approved") {
      await sql`
        insert into profiles (user_id, role)
        values (${data.userId}, 'teacher')
        on conflict (user_id) do update set role = 'teacher'
      `;
    }
    return { ok: true as const };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const me = await ensureProfile(context.userId);
    if (!canAdmin(me.role)) throw new Error("Forbidden");
    const sql = await getSql();
    async function count(run: Promise<{ n: number | string }[]>): Promise<number> {
      try {
        const rows = await run;
        return Number(rows[0]?.n ?? 0);
      } catch {
        return 0;
      }
    }
    return {
      users: await count(sql`select count(*)::int as n from "user"`),
      teachers: await count(
        sql`select count(*)::int as n from profiles where role in ('teacher', 'admin')`,
      ),
      pending: await count(
        sql`select count(*)::int as n from teacher_applications where status = 'pending'`,
      ),
      enrollments: await count(sql`select count(*)::int as n from enrollments`),
      studioCourses: await count(sql`select count(*)::int as n from studio_courses`),
    };
  });
