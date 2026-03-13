import alchemy from "alchemy";
import { CloudflareStateStore } from "alchemy/state";
import { Vite, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("open-clock", {
  password: process.env.ALCHEMY_PASSWORD,
  stateStore: process.env.CI ? (scope) => new CloudflareStateStore(scope) : undefined,
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
    GOOGLE_GENERATIVE_AI_API_KEY: alchemy.secret.env.GOOGLE_GENERATIVE_AI_API_KEY!,
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
    DEV_PORT: "3001",
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
