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

## Design Context

### Users

Open Clock serves a broad audience: freelancers tracking billable hours across multiple clients, small agency and studio teams, technical developers, and ops-focused team leads. The interface is used in high-context switching moments — between client calls, during focused work sessions, and when reviewing end-of-week reports. Users want to get in, log time accurately, and get out. They also want to feel proud showing reports or dashboards to clients.

**Job to be done:** Know exactly where time went, with minimal friction and maximum confidence in the data.

### Brand Personality

**Clean · Calm · Confident**

Open Clock is precise and assured — like a well-made tool rather than a feature-packed platform. It doesn't try to entertain; it respects the user's time and intelligence. The voice is understated, direct, and professional. It evokes calm focus, confidence in your data, and quiet pride in the work. Small moments of polish reward attention without demanding it.

### Aesthetic Direction

**References:** Linear (linear.app) — polished dark UI, information density done right, keyboard-first, every detail considered. The bar is: "does this feel like a tool professionals would pay for?"

**Theme:** Both light and dark are first-class experiences. The codebase defaults to dark. Neither mode should feel like an afterthought.

**Visual language:**

- Strictly neutral/achromatic color palette — grays in oklch, near-zero chroma
- Two functional accent colors only: **teal** (`hsl(174 84% 32%)`) for tracked time, **blue** (`hsl(200 78% 46%)`) for billable time
- **Square corners everywhere** (`rounded-none`) — the sharpness is intentional and part of the identity
- Elevation via `ring-1 ring-foreground/10`, never heavy shadows or blobs
- Typography: Inter Variable only; tight tracking on headings (`tracking-tight`, `tracking-[-0.05em]` for hero); `tabular-nums` on all time values
- Icon library: Lucide React exclusively — never mix
- Base type: predominantly `text-xs` in components, `text-sm` for primary content

**Anti-references:** No Harvest/enterprise spreadsheet heaviness. No rounded blobs, gradients, or shadow stacks. No cartoon-y or overly colorful design. No generic SaaS template aesthetics (Bootstrap-era dashboards).

### Design Principles

1. **Precision over decoration.** Every element earns its place. If it doesn't inform, guide, or confirm — remove it. Restraint is the primary aesthetic choice.

2. **Density with clarity.** Pack information efficiently but never sacrifice legibility. `text-xs` is fine; illegible is not. Use `tabular-nums`, consistent alignment, and generous vertical rhythm to make dense data scannable.

3. **Calm confidence.** The interface should feel settled, not busy. Avoid motion for its own sake — animate only to orient (entrance) or confirm (state change). Let whitespace breathe.

4. **Both modes, equal quality.** Light and dark are both primary. Design decisions must be validated in both. Use oklch tokens; never hard-code colors outside the token system.

5. **WCAG AA baseline.** All interactive states must meet 4.5:1 contrast minimum for text, 3:1 for UI components. Keyboard navigation and focus states are non-negotiable.

### Key Design Conventions

- **No `tailwind.config.ts`** — all theme customisation goes in `packages/ui/src/styles/globals.css` via `@theme inline {}`
- **`rounded-none` is the rule**, not the exception — do not introduce rounded variants unless explicitly requested
- **Color system is oklch** — new colors must be defined in oklch in the token file, not as arbitrary HSL or hex values inline
- Card elevation: `ring-1 ring-foreground/10` — not `shadow-*`
- All time/duration values: always use `tabular-nums`
- Section labels: `text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground`
- Metric values: `text-[2rem] leading-none font-medium tracking-tight`
- Page heading: `text-2xl font-semibold`
