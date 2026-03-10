import { redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

const SESSION_CACHE_TTL_MS = 15_000;

type SessionResult = Awaited<ReturnType<typeof authClient.getSession>>;

let cachedSession: SessionResult | null = null;
let cachedSessionExpiresAt = 0;
let inflightSession: Promise<SessionResult> | null = null;
let cacheGeneration = 0;

async function getCachedSession() {
  const now = Date.now();

  if (cachedSession && cachedSessionExpiresAt > now) {
    return cachedSession;
  }

  if (inflightSession) {
    return inflightSession;
  }

  const generationAtRequestStart = cacheGeneration;

  inflightSession = authClient.getSession().then((session) => {
    if (generationAtRequestStart === cacheGeneration) {
      cachedSession = session;
      cachedSessionExpiresAt = Date.now() + SESSION_CACHE_TTL_MS;
    }

    return session;
  });

  try {
    return await inflightSession;
  } finally {
    inflightSession = null;
  }
}

export function invalidateSessionCache() {
  cacheGeneration += 1;
  cachedSession = null;
  cachedSessionExpiresAt = 0;
  inflightSession = null;
}

export async function requireAuthBeforeLoad() {
  const session = await getCachedSession();

  if (!session.data) {
    invalidateSessionCache();
    redirect({ to: "/login", throw: true });
  }

  return { session };
}

export type AuthRouteContext = Awaited<ReturnType<typeof requireAuthBeforeLoad>>;
