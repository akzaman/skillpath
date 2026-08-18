import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);

export const Route = createFileRoute("/api/media/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getSessionUser();
        if (!user) {
          return Response.json({ message: "Sign in to upload" }, { status: 401 });
        }
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) {
          return Response.json({ message: "Choose a video file" }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return Response.json(
            { message: "Clips up to 4 MB. Use a hosted MP4 or YouTube URL for longer films." },
            { status: 413 },
          );
        }
        const mime = file.type || "video/mp4";
        if (!ALLOWED.has(mime) && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
          return Response.json({ message: "Upload an MP4 or WebM file" }, { status: 400 });
        }
        const bytes = new Uint8Array(await file.arrayBuffer());
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        const sql = await getSql();
        await sql`
          insert into media_assets (id, owner_id, mime, bytes)
          values (${id}, ${user.id}, ${mime}, ${bytes})
        `;
        return Response.json({ url: `/api/media/${id}` });
      },
    },
  },
});
