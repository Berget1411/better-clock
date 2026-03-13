import { auth } from "@open-learn/auth";
import { env } from "@open-learn/env/server";
import type { Hono } from "hono";

export function mountAuth(app: Hono) {
  app.on(["POST", "GET", "OPTIONS"], "/api/auth/*", async (c) => {
    // Handle OPTIONS preflight here rather than relying on Hono's cors middleware.
    // Better Auth returns immutable CF Workers Response objects — headers on those
    // are sealed after creation and Hono's cors middleware cannot inject into them.
    if (c.req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": env.CORS_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          Vary: "Origin",
        },
      });
    }

    const response = await auth.handler(c.req.raw);

    // Clone into a new Response so we can add CORS headers before the object seals.
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", env.CORS_ORIGIN);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  });
}
