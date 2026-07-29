import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import { putObject } from "../storage.js";
import { importComic } from "../lib/importComic.js";

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500MB — generous for a scanned trade paperback.

function formatFromFileName(fileName: string): "cbz" | "cbr" | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".cbz") || lower.endsWith(".zip")) return "cbz";
  if (lower.endsWith(".cbr") || lower.endsWith(".rar")) return "cbr";
  return null;
}

export async function uploadRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", requireAuth);

  app.post("/api/comics", async (request, reply) => {
    const file = await request.file({ limits: { fileSize: MAX_UPLOAD_BYTES } });
    if (!file) return reply.code(400).send({ error: "No file uploaded" });

    const format = formatFromFileName(file.filename);
    if (!format) {
      return reply.code(400).send({ error: "Only .cbz/.zip and .cbr/.rar files are supported" });
    }

    const buffer = await file.toBuffer();

    const comic = await db.comic.create({
      data: {
        title: file.filename.replace(/\.[^./]+$/, ""),
        fileName: file.filename,
        format,
        status: "processing",
        archiveKey: "", // filled in immediately below
      },
    });

    const archiveKey = `archives/${comic.id}.${format}`;
    await putObject(archiveKey, buffer, format === "cbz" ? "application/zip" : "application/x-rar-compressed");
    await db.comic.update({ where: { id: comic.id }, data: { archiveKey } });

    // Fire-and-forget: the client polls GET /api/comics/:id and watches
    // `status` flip from "processing" to "ready" (or "error").
    void importComic(comic.id, buffer, format, file.filename);

    return reply.code(202).send(comic);
  });
}
