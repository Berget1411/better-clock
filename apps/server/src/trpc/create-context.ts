import type { TrpcContext } from "@open-learn/api/context/types";
import { auth } from "@open-learn/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions): Promise<TrpcContext> {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  // Read the token directly from the session object — avoids hardcoding the
  // cookie name which changes when crossSubDomainCookies / __Secure- prefix is active.
  const sessionToken = session?.session.token ?? null;

  return {
    session,
    sessionToken,
  };
}
