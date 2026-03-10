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

export const auth = betterAuth({
  database,
  trustedOrigins: [env.CORS_ORIGIN],
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
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 60,
  //   },
  // },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "<your-workers-subdomain>",
    // },
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
