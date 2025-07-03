import { Env, Hono } from "hono";

import { logger } from "hono/logger";
import { chatController } from "./endpoints/chat.controller";

const app = new Hono<Env>().basePath("/api");

app.use(logger());

export const publicRoutes = app
  .get("/healthcheck", (c) => {
    return c.json("Hello World!");
  })
  .route("/chat", chatController);

export default app;
