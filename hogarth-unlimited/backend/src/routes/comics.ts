import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";
import { getObjectUrl, deleteObject, deletePrefix } from "../storage.js";

const ProgressSchema = z.object({
  currentPage: z.number().int().min(0),
  completed: z.boolean().optional(),
});

export async function comicRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", requireAuth);

  app.get("/api/comics", async (request) => {
    const query = z
      .object({ search: z.string().optional(), tag: z.string().optional() })
      .parse(request.query);

    const comics = await db.comic.findMany({
      where: {
        AND: [
          query.search
            ? {
                OR: [
                  { title: { contains: query.search } },
                  { series: { contains: query.search } },
                ],
              }
            : {},
          query.tag ? { tags: { some: { tagId: query.tag } } } : {},
        ],
      },
      include: {
        tags: { include: { tag: true } },
        progress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return comics;
  });

  app.get("/api/comics/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const comic = await db.comic.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, progress: true, pages: { orderBy: { index: "asc" } } },
    });
    if (!comic) return reply.code(404).send({ error: "Not found" });
    return comic;
  });

  app.get("/api/comics/:id/cover", async (request, reply) => {
    const { id } = request.params as { id: string };
    const comic = await db.comic.findUnique({ where: { id } });
    if (!comic?.coverKey) return reply.code(404).send({ error: "No cover available" });
    const url = await getObjectUrl(comic.coverKey);
    return reply.redirect(url);
  });

  app.get("/api/comics/:id/pages/:index", async (request, reply) => {
    const { id, index } = request.params as { id: string; index: string };
    const page = await db.page.findUnique({
      where: { comicId_index: { comicId: id, index: Number(index) } },
    });
    if (!page) return reply.code(404).send({ error: "Page not found" });
    const url = await getObjectUrl(page.imageKey);
    return reply.redirect(url);
  });

  app.put("/api/comics/:id/progress", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = ProgressSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const progress = await db.readingProgress.upsert({
      where: { comicId: id },
      create: { comicId: id, ...parsed.data },
      update: parsed.data,
    });
    return progress;
  });

  app.delete("/api/comics/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const comic = await db.comic.findUnique({ where: { id } });
    if (!comic) return reply.code(404).send({ error: "Not found" });

    // Storage cleanup best-effort — don't let an R2 hiccup block the DB delete.
    await deletePrefix(`pages/${id}/`).catch(() => undefined);
    if (comic.coverKey) await deleteObject(comic.coverKey).catch(() => undefined);
    await deleteObject(comic.archiveKey).catch(() => undefined);

    await db.comic.delete({ where: { id } });
    return reply.code(204).send();
  });
}
