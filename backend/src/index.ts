import { buildServer } from "./server.js";
import { env } from "./env.js";

const app = await buildServer();

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => app.log.info(`Hogarth Unlimited API listening on :${env.PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
