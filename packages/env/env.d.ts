import { type server } from "@open-learn/infra/alchemy.run";

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

export type CloudflareEnv = typeof server.Env & {
  GMAIL_USER: string;
  GMAIL_APP_PASSWORD: string;
};

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  export const env: CloudflareEnv;

  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
