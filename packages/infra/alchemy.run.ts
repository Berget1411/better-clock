import alchemy from "alchemy";
import { CloudflareStateStore } from "alchemy/state";
import { createCloudflareApi, Vite, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("open-clock", {
  stateStore: process.env.ALCHEMY_STATE_TOKEN
    ? (scope) => new CloudflareStateStore(scope)
    : undefined,
});

// NOTE: Load stage-specific overrides after alchemy resolves the real stage.
// `alchemy dev` (no --stage) resolves to $USER — no .env.$USER file exists,
// so localhost values from apps/server/.env are preserved.
// `alchemy deploy --stage dev/prod` resolves to "dev"/"prod" and loads the
// corresponding file, overriding CORS_ORIGIN/BETTER_AUTH_URL with Cloudflare URLs.
config({ path: `./.env.${app.stage}`, override: true });

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    ...(process.env.GOOGLE_GENERATIVE_AI_API_KEY
      ? { GOOGLE_GENERATIVE_AI_API_KEY: alchemy.secret.env.GOOGLE_GENERATIVE_AI_API_KEY! }
      : {}),
    POLAR_ACCESS_TOKEN: alchemy.secret.env.POLAR_ACCESS_TOKEN!,
    POLAR_SUCCESS_URL: alchemy.env.POLAR_SUCCESS_URL!,
    GOOGLE_CLIENT_ID: alchemy.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: alchemy.secret.env.GOOGLE_CLIENT_SECRET!,
    GITHUB_CLIENT_ID: alchemy.env.GITHUB_CLIENT_ID!,
    GITHUB_CLIENT_SECRET: alchemy.secret.env.GITHUB_CLIENT_SECRET!,
    GMAIL_USER: alchemy.env.GMAIL_USER!,
    GMAIL_APP_PASSWORD: alchemy.secret.env.GMAIL_APP_PASSWORD!,
  },
  dev: {
    port: 3002,
  },
});

export const web = await Vite("web", {
  cwd: "../../apps/web",
  assets: "dist",
  bindings: {
    VITE_SERVER_URL: server.url,
    VITE_AI_ENABLED: alchemy.env.VITE_AI_ENABLED ?? "false",
    DEV_PORT: "3001",
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

// Ensure the Cloudflare Access application protecting the server worker has a
// bypass policy for /api/auth/* so that Better Auth's sign-in endpoints are
// publicly reachable. Without this, OPTIONS preflight requests (which carry no
// Access JWT) are rejected by the Access layer before the Worker runs, producing
// a 403 with no CORS headers.
//
// This only runs when a CLOUDFLARE_API_TOKEN is present (i.e. during `deploy`).
// Local `alchemy dev` skips this because the dev server runs directly on localhost
// without a Cloudflare Access gate.
if (process.env.CLOUDFLARE_API_TOKEN) {
  const cf = await createCloudflareApi();

  // Find the Access application for this server worker hostname.
  const serverHostname = new URL(server.url).hostname;
  const appsRes = await cf.get(`/accounts/${cf.accountId}/access/apps`);
  const appsJson = (await appsRes.json()) as {
    result: Array<{ id: string; domain: string; name: string }>;
  };
  const accessApp = appsJson.result?.find(
    (a) => a.domain === serverHostname || a.domain === `${serverHostname}/*`,
  );

  if (accessApp) {
    // Upsert a bypass policy for /api/auth/* so auth routes skip Access checks.
    const policiesRes = await cf.get(
      `/accounts/${cf.accountId}/access/apps/${accessApp.id}/policies`,
    );
    const policiesJson = (await policiesRes.json()) as {
      result: Array<{ id: string; name: string; decision: string }>;
    };
    const bypassPolicy = policiesJson.result?.find((p) => p.name === "Bypass auth API");

    const bypassBody = {
      name: "Bypass auth API",
      decision: "bypass",
      include: [{ everyone: {} }],
      // Apply only to the auth sub-paths
      precedence: 1,
    };

    if (bypassPolicy) {
      await cf.put(
        `/accounts/${cf.accountId}/access/apps/${accessApp.id}/policies/${bypassPolicy.id}`,
        bypassBody,
      );
      console.log(`Access: updated bypass policy on ${serverHostname}/api/auth/*`);
    } else {
      await cf.post(`/accounts/${cf.accountId}/access/apps/${accessApp.id}/policies`, bypassBody);
      console.log(`Access: created bypass policy on ${serverHostname}/api/auth/*`);
    }
  } else {
    console.warn(
      `Access: no Access application found for ${serverHostname} — skipping bypass policy.\n` +
        `If the server worker is protected by Cloudflare Access, add a bypass policy\n` +
        `for /api/auth/* manually in the Zero Trust dashboard.`,
    );
  }
}

await app.finalize();
