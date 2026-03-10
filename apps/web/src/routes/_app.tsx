import { requireAuthBeforeLoad } from "@/features/auth/utils/require-auth";
import { ensureActiveOrganization } from "@/features/auth/utils/ensure-active-organization";
import {
  AppLayoutPending,
  AppLayoutShell,
} from "@/features/navigation/components/app-layout-shell";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const authCtx = await requireAuthBeforeLoad();
    // Best-effort: ensure the user has an active organisation set.
    await ensureActiveOrganization();
    return authCtx;
  },
  pendingComponent: AppLayoutPending,
  pendingMs: 150,
  pendingMinMs: 200,
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppLayoutShell>
      <Outlet />
    </AppLayoutShell>
  );
}
