import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // Deliberately unauthenticated — this is what your host's uptime check hits.
  app.get("/api/health", async () => ({ status: "ok", time: new Date().toISOString() }));
}
