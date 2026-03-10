import { ModeToggle } from "@/components/mode-toggle";
import { requireAuthBeforeLoad } from "@/features/auth/utils/require-auth";
import AppSidebar from "@/features/navigation/components/app-sidebar";
import { Separator } from "@open-learn/ui/components/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@open-learn/ui/components/sidebar";
import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import type { RegisteredRouter } from "@tanstack/react-router";

type AppRoutePath =
  RegisteredRouter["routesByPath"][keyof RegisteredRouter["routesByPath"]]["fullPath"];

const titles: Partial<Record<AppRoutePath, string>> = {
  "/": "Dashboard",
  "/ai": "AI Chat",
  "/todos": "Todos",
  "/tracker": "Time Tracker",
};

export const Route = createFileRoute("/_app")({
  beforeLoad: requireAuthBeforeLoad,
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {titles[pathname as AppRoutePath] ?? "open-learn"}
            </p>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
