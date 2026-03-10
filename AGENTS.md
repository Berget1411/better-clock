# AGENTS

## Core Rules

- Work in a modular, feature-owned way.
- Prefer extending an existing feature over adding a new shared abstraction.
- Keep transport thin, business logic in services, and DB access in `packages/db` repositories.
- Do not edit generated files unless the generating workflow requires it.
- For `apps/web`, always run react-doctor at end of assignment

## Where To Work

- `apps/web`: routes, feature pages, client-side feature code.
- `apps/server`: Hono transport, REST mounting, auth mounting, runtime wiring.
- `packages/api`: tRPC contracts, schemas, procedures, feature services.
- `packages/db`: schema, DB client, repositories.
- `packages/auth`, `packages/ui`, `packages/env`: shared platform packages.

## Scoped Docs

- `apps/web/AGENTS.md`
- `apps/server/AGENTS.md`
- `packages/api/AGENTS.md`
- `packages/db/AGENTS.md`
- `packages/auth/AGENTS.md`
- `packages/ui/AGENTS.md`
