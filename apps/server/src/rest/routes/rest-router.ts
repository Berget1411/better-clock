import { Hono } from "hono";

import { aiRouter } from "../../modules/ai";
import { env } from "@open-learn/env/server";

export const restRouter = new Hono();

if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
  restRouter.route("/ai", aiRouter);
} else {
  restRouter.all("/ai/*", (c) => c.notFound());
  restRouter.all("/ai", (c) => c.notFound());
}
