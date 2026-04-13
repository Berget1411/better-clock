/// <reference path="../env.d.ts" />
// For Cloudflare Workers, env is accessed via cloudflare:workers module
// Types are defined in env.d.ts based on your alchemy.run.ts bindings

import { env as cfEnv } from "cloudflare:workers";

// In Node (CLI tools, drizzle-kit, better-auth CLI), cloudflare:workers is stubbed
// by jiti — env values come back as Proxy objects that stringify to "env.FIELD_NAME".
// Detect the stub by checking if DATABASE_URL coerces to a non-URL string, and fall
// back to process.env so CLI tools work correctly.
const isNodeRuntime =
  typeof process !== "undefined" &&
  typeof process.env === "object" &&
  Boolean(process.env["DATABASE_URL"]);

export const env: typeof cfEnv = isNodeRuntime ? (process.env as unknown as typeof cfEnv) : cfEnv;
