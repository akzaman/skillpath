import { createFileRoute } from "@tanstack/react-router";
import { loadProtectedLessonFile } from "@/lib/lesson-file.server";

export const Route = createFileRoute("/api/lessons/$courseSlug/$lessonSlug/file")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const topicId = new URL(request.url).searchParams.get("topic");
        const result = await loadProtectedLessonFile({
          courseSlug: params.courseSlug,
          lessonSlug: params.lessonSlug,
          topicId,
        });
        if ("error" in result) {
          return new Response(result.error, { status: result.status });
        }
        const copy = new ArrayBuffer(result.bytes.byteLength);
        new Uint8Array(copy).set(result.bytes);
        return new Response(copy, {
          headers: {
            "content-type": result.mime || "application/pdf",
            "content-disposition": "inline; filename=\"lesson.pdf\"",
            "cache-control": "private, no-store",
            "x-content-type-options": "nosniff",
            "content-length": String(result.bytes.byteLength),
          },
        });
      },
    },
  },
});
