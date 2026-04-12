import { db } from "@open-learn/db";
import * as schema from "@open-learn/db/schema/auth";
import { env } from "@open-learn/env/server";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { dash } from "@better-auth/infra";

import { polarClient } from "./lib/payments";
import { sendInvitationEmail } from "./lib/email";

const database: BetterAuthOptions["database"] = drizzleAdapter(db, {
  provider: "pg",
  schema: schema,
});

// Derive shared parent domain for cross-subdomain cookies when deployed on workers.dev.
// e.g. "https://open-clock-web-dev.ludvig1411.workers.dev" → ".ludvig1411.workers.dev"
// Falls back to undefined for local development so cookies stay scoped to localhost.
const workersDomain = env.CORS_ORIGIN.includes("workers.dev")
  ? `.${new URL(env.CORS_ORIGIN).hostname.split(".").slice(-3).join(".")}`
  : undefined;

// Build the list of trusted origins. Always include the primary CORS_ORIGIN.
// During local dev the web worker binds VITE_SERVER_URL to localhost:3002 and
// the browser reaches it from localhost:3001/3003, so we also trust localhost
// variants to avoid 403 preflight failures against the deployed dev server.
const trustedOrigins = [
  env.CORS_ORIGIN,
  // localhost variants for local development
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

export const auth = betterAuth({
  database,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: !!workersDomain,
      maxAge: 60,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    ...(workersDomain && {
      crossSubDomainCookies: {
        enabled: true,
        domain: workersDomain,
      },
    }),
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      // 7-day invitation expiry
      invitationExpiresIn: 60 * 60 * 24 * 7,
      sendInvitationEmail: async (data: {
        id: string;
        email: string;
        inviter: { user: { name: string } };
        organization: { name: string };
      }) => {
        const inviteLink = `${env.CORS_ORIGIN}/accept-invitation/${data.id}`;
        await sendInvitationEmail({
          to: data.email,
          inviterName: data.inviter.user.name,
          orgName: data.organization.name,
          inviteLink,
        });
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            {
              productId: "your-product-id",
              slug: "pro",
            },
          ],
          successUrl: env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
    dash(),
  ],
});
