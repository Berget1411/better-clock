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

  // Extract session token so tRPC procedures can make Better Auth API calls on behalf of the user
  const cookieHeader = context.req.header("cookie") ?? "";
  const sessionToken =
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("better-auth.session_token="))
      ?.split("=")
      .slice(1)
      .join("=") ?? null;

  return {
    session,
    sessionToken,
  };
}
