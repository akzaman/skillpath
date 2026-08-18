import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cron/access-expiry")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET?.trim();
        const auth = request.headers.get("authorization");
        const vercelCron = request.headers.get("x-vercel-cron");
        const allowed =
          (secret && auth === `Bearer ${secret}`) || (!secret && vercelCron === "1");
        if (!allowed) {
          return Response.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { processAccessExpiryEmails } = await import("@/lib/access-mail");
        const result = await processAccessExpiryEmails();
        return Response.json(result);
      },
    },
  },
});
