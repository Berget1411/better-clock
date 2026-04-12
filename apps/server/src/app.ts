import { env } from "@open-learn/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { mountAuth } from "./auth/mount";
import { mountRest } from "./rest/mount";
import { mountTrpc } from "./trpc/mount";

const app = new Hono();

app.use(logger());
// Accept requests from the primary configured origin plus all localhost ports
// used during local development. This ensures CORS headers are present on all
// responses — including 4xx errors returned by Better Auth on preflight.
const corsOrigins = [
  env.CORS_ORIGIN,
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

app.use(
  "/*",
  cors({
    origin: corsOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "User-Agent"],
    credentials: true,
  }),
);

mountAuth(app);
mountTrpc(app);
mountRest(app);

export { app };
