import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/media/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        if (!id) return new Response("Not found", { status: 404 });
        const sql = await getSql();
        const rows = await sql<{ mime: string; bytes: Uint8Array | string }>`
          select mime, bytes from media_assets where id = ${id}
        `;
        const row = rows[0];
        if (!row) return new Response("Not found", { status: 404 });
        const body = toBytes(row.bytes);
        const copy = new ArrayBuffer(body.byteLength);
        new Uint8Array(copy).set(body);
        return new Response(copy, {
          headers: {
            "content-type": row.mime || "video/mp4",
            "cache-control": "public, max-age=31536000, immutable",
            "content-length": String(body.byteLength),
          },
        });
      },
    },
  },
});

function toBytes(value: Uint8Array | string): Uint8Array {
  if (typeof value === "string") {
    const binary = atob(value);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}
