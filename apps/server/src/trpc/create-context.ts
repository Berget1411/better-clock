import type { TrpcContext } from "@open-learn/api/context/types";
import { auth } from "@open-learn/auth";
import { extractSessionToken } from "@open-learn/auth/lib/session-cookie";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions): Promise<TrpcContext> {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  // Extract session token so tRPC procedures can make Better Auth API calls on behalf of the user
  const sessionToken = extractSessionToken(context.req.header("cookie"));

  return {
    session,
    sessionToken,
  };
}
