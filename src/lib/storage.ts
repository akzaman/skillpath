import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

export const getStorageStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { storageLimits } = await import("./storage.server");
  return storageLimits();
});

export const createLectureUpload = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        filename: z.string().min(1).max(180),
        contentType: z.string().min(1).max(80),
        size: z.number().int().positive(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { createLectureUpload: sign, storageLimits } = await import("./storage.server");
    const limits = storageLimits();
    if (!limits.enabled) {
      throw new Error("Cloud storage is not configured on this site");
    }
    if (data.size > limits.maxBytes) {
      throw new Error("That file is larger than 2 GB");
    }
    return sign({
      userId: context.userId,
      filename: data.filename,
      contentType: data.contentType,
    });
  });

export const applyBucketCors = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { applyBucketCors: apply } = await import("./storage.server");
    return apply();
  });
