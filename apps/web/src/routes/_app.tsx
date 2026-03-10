import { requireAuthBeforeLoad } from "@/features/auth/utils/require-auth";
import {
  AppLayoutPending,
  AppLayoutShell,
} from "@/features/navigation/components/app-layout-shell";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: requireAuthBeforeLoad,
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
