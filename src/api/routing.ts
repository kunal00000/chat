import { Env, Hono } from "hono";

import { logger } from "hono/logger";

const app = new Hono<Env>().basePath("/api");

app.use(logger());

export const publicRoutes = app.get("/healthcheck", (c) => {
  return c.json("Hello World!");
});

export default app;
