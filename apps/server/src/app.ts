import { env } from "@open-learn/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { mountAuth } from "./auth/mount";
import { mountRest } from "./rest/mount";
import { mountTrpc } from "./trpc/mount";

const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

const app = new Hono();

app.use(logger());
app.use("/*", (c, next) => {
  // Auth routes handle their own CORS — Better Auth returns immutable CF Workers
  // Response objects, so Hono's cors middleware can't inject headers into them.
  if (c.req.path.startsWith("/api/auth")) {
    return next();
  }
  return corsMiddleware(c, next);
});

mountAuth(app);
mountTrpc(app);
mountRest(app);

export { app };
