const SESSION_TOKEN_COOKIE_NAMES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
] as const;

export function extractSessionToken(cookieHeader?: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookieName of SESSION_TOKEN_COOKIE_NAMES) {
    const token = cookies
      .find((cookie) => cookie.startsWith(`${cookieName}=`))
      ?.split("=")
      .slice(1)
      .join("=");

    if (token) {
      return token;
    }
  }

  return null;
}

export function buildSessionTokenCookieHeader(sessionToken: string): string {
  return SESSION_TOKEN_COOKIE_NAMES.map((cookieName) => `${cookieName}=${sessionToken}`).join("; ");
}
