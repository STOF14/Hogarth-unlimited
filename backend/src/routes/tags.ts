import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

const CreateTagSchema = z.object({
  label: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex value like #ED1D24"),
});

export async function tagRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", requireAuth);

  app.get("/api/tags", async () => {
    return db.tag.findMany({ orderBy: { label: "asc" } });
  });

  app.post("/api/tags", async (request, reply) => {
    const parsed = CreateTagSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const tag = await db.tag.create({ data: parsed.data }).catch(() => null);
    if (!tag) return reply.code(409).send({ error: "Tag already exists" });
    return reply.code(201).send(tag);
  });

  app.delete("/api/tags/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.tag.delete({ where: { id } }).catch(() => undefined);
    return reply.code(204).send();
  });

  app.put("/api/comics/:id/tags", async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = z.object({ tagIds: z.array(z.string()) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    const uniqueTagIds = [...new Set(parsed.data.tagIds)];

    await db.comicTag.deleteMany({ where: { comicId: id } });
    await db.comicTag.createMany({
      data: uniqueTagIds.map((tagId) => ({ comicId: id, tagId })),
    });

    const comic = await db.comic.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } });
    return comic;
  });
}
