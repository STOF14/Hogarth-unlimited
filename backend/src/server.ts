import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { env } from "./env.js";
import { healthRoutes } from "./routes/health.js";
import { comicRoutes } from "./routes/comics.js";
import { uploadRoutes } from "./routes/upload.js";
import { tagRoutes } from "./routes/tags.js";

export async function buildServer() {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === "production"
        ? true
        : { transport: { target: "pino-pretty" } },
  });

  await app.register(cors, { origin: env.WEB_ORIGIN });
  await app.register(multipart);

  await app.register(healthRoutes);
  await app.register(comicRoutes);
  await app.register(uploadRoutes);
  await app.register(tagRoutes);

  return app;
}
